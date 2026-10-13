import { env } from "./env";
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import http from "http";
import path from "path";
import crypto from "crypto";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import mongoose from "mongoose";
import { ethers } from "ethers";
import { Server } from "socket.io";
import { Invitation, MeetingRecording, Message, UserProfile } from "./models/Schemas";
import { ADMIN, issueNonce, requireAuth, verifyLogin, verifyToken } from "./auth";
import { club } from "./chain";

const app = express();

// ADD THIS TRACKING CODE BLOCK RIGHT HERE:
app.use((req, res, next) => {
  console.log(`🔍 Incoming Request Method: ${req.method} | URL: ${req.url}`);
  next();
});

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
const origins = [ 
  "http://localhost:3000", 
  "https://synergy-club-brown.vercel.app" 
];
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(["/api/auth", "/api/gate"], rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: origins } });
const upload = multer({ dest: path.join(__dirname, "..", "uploads"), limits: { fileSize: 200 * 1024 * 1024 } });

// ---------- helpers ----------
const h =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

async function roleOf(address: string) {
  const profile = await UserProfile.findOne({ walletAddress: address });
  if (address === ADMIN) return { role: "ADMIN", profile };
  return { role: profile ? profile.status : "GUEST", profile };
}
const isMember = async (a: string) => ["ADMIN", "ACTIVATED"].includes((await roleOf(a)).role);

const guard =
  (check: (a: string) => Promise<boolean>, message: string): RequestHandler =>
  async (req, res, next) => {
    try {
      if (await check(req.address as string)) return next();
      res.status(403).json({ message });
    } catch (e) {
      next(e);
    }
  };
const requireMember = guard(isMember, "Members only.");
const requireAdmin = guard(async (a) => a === ADMIN, "Admin only.");
const requireInterviewer = guard(async (a) => {
  const { role, profile } = await roleOf(a);
  return role === "ADMIN" || (role === "ACTIVATED" && !!profile?.isInterviewer);
}, "Interviewers only.");

const lower = (v: unknown) => String(v || "").toLowerCase();

async function makeInvite(owner: string): Promise<string> {
  const code = crypto.randomBytes(4).toString("hex").toUpperCase();
  await Invitation.create({ code, generatedBy: owner, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
  return code;
}

// ---------- auth ----------
app.get(" /api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/auth/nonce",
  h(async (req, res) => {
    const address = lower(req.query.address);
    if (!ethers.isAddress(address)) return res.status(400).json({ message: "Invalid address." });
    return res.json({ message: issueNonce(address) });
  })
);

app.post(
  "/api/auth/login",
  h(async (req, res) => {
    const token = verifyLogin(lower(req.body.address), String(req.body.signature || ""));
    if (!token) return res.status(401).json({ message: "Signature check failed. Try again." });
    return res.json({ token });
  })
);

app.get(
  "/api/session",
  requireAuth,
  h(async (req, res) => {
    const { role, profile } = await roleOf(req.address as string);
    return res.json({
      address: req.address,
      role,
      profile: profile
        ? {
            name: profile.name,
            status: profile.status,
            registrationCode: profile.registrationCode,
            isInterviewer: profile.isInterviewer,
            photo: profile.photo,
          }
        : null,
    });
  })
);

// ---------- gate + registration ----------
app.post(
  "/api/gate/verify",
  requireAuth,
  h(async (req, res) => {
    const code = String(req.body.code || "").trim().toUpperCase();
    const invite = await Invitation.findOne({ code, isUsed: false, expiresAt: { $gt: new Date() } });
    if (!invite) return res.status(404).json({ message: "Code invalid, already used or expired." });
    return res.json({ valid: true });
  })
);

app.post(
  "/api/register",
  requireAuth,
  h(async (req, res) => {
    const address = req.address as string;
    const b = req.body;
    if (await UserProfile.exists({ walletAddress: address })) return res.status(409).json({ message: "Already registered." });
    if (!(await club.hasPaidRegistration(address)))
      return res.status(402).json({ message: "Registration fee not found on-chain yet. Wait a few seconds and press submit again." });

    const age = Number(b.age);
    if (!b.name || !b.intentions || !b.phoneNumber || !b.email || !(age >= 18))
      return res.status(400).json({ message: "Missing or invalid fields (age must be 18 or older)." });

    const code = String(b.code || "").trim().toUpperCase();
    const invite = await Invitation.findOneAndUpdate(
      { code, isUsed: false, expiresAt: { $gt: new Date() } },
      { isUsed: true, usedBy: address }
    );
    if (!invite) return res.status(400).json({ message: "Invitation code invalid, already used or expired." });

    try {
      await UserProfile.create({
        walletAddress: address,
        name: b.name,
        invitedBy: invite.generatedBy,
        age,
        isDrugAddict: b.isDrugAddict === "yes",
        isDrunker: b.isDrunker === "yes",
        isCultist: b.isCultist === "yes",
        intentions: b.intentions,
        phoneNumber: b.phoneNumber,
        email: b.email,
      });
    } catch (e) {
      await Invitation.updateOne({ _id: invite._id }, { isUsed: false, usedBy: null });
      throw e;
    }
    return res.status(201).json({ ok: true });
  })
);

app.post(
  "/api/activate",
  requireAuth,
  h(async (req, res) => {
    const address = req.address as string;
    const profile = await UserProfile.findOne({ walletAddress: address });
    if (!profile || profile.status !== "APPROVED") return res.status(403).json({ message: "You are not approved yet." });
    if (!(await club.isFullyActivated(address)))
      return res.status(402).json({ message: "Activation payment not found on-chain yet. Wait a few seconds and retry." });
    profile.status = "ACTIVATED";
    await profile.save();
    return res.json({ ok: true });
  })
);

// ---------- members + invites ----------
app.get(
  "/api/members",
  requireAuth,
  requireMember,
  h(async (_req, res) => {
    const rows = await UserProfile.find({ status: "ACTIVATED" }).select("name walletAddress");
    return res.json([{ name: "Admin", walletAddress: ADMIN }, ...rows.map((r) => ({ name: r.name, walletAddress: r.walletAddress }))]);
  })
);

app.get(
  "/api/invites",
  requireAuth,
  requireMember,
  h(async (req, res) => res.json(await Invitation.find({ generatedBy: req.address }).sort({ createdAt: -1 })))
);

app.post(
  "/api/invites",
  requireAuth,
  requireMember,
  h(async (req, res) => {
    const active = await Invitation.countDocuments({ generatedBy: req.address, isUsed: false, expiresAt: { $gt: new Date() } });
    if (active >= 5) return res.status(429).json({ message: "You already have 5 active codes." });
    return res.status(201).json({ code: await makeInvite(req.address as string) });
  })
);

// ---------- interviews + admin ----------
app.get(
  "/api/interview/applicants",
  requireAuth,
  requireInterviewer,
  h(async (_req, res) => res.json(await UserProfile.find({}).sort({ createdAt: -1 })))
);

app.post(
  "/api/interview/note",
  requireAuth,
  requireInterviewer,
  h(async (req, res) => {
    const text = String(req.body.text || "").trim().slice(0, 500);
    if (!text) return res.status(400).json({ message: "Note is empty." });
    await UserProfile.updateOne({ walletAddress: lower(req.body.wallet) }, { $push: { notes: { by: req.address, text } } });
    return res.json({ ok: true });
  })
);

app.post(
  "/api/admin/approve",
  requireAuth,
  requireAdmin,
  h(async (req, res) => {
    const wallet = lower(req.body.wallet);
    if (!(await club.isApproved(wallet))) return res.status(400).json({ message: "Approve this wallet on-chain first." });
    const profile = await UserProfile.findOne({ walletAddress: wallet });
    if (!profile) return res.status(404).json({ message: "Applicant not found." });
    profile.registrationCode = await makeInvite(wallet);
    profile.status = "APPROVED";
    await profile.save();
    return res.json({ ok: true });
  })
);

app.post(
  "/api/admin/reject",
  requireAuth,
  requireAdmin,
  h(async (req, res) => {
    await UserProfile.updateOne({ walletAddress: lower(req.body.wallet) }, { status: "REJECTED" });
    return res.json({ ok: true });
  })
);

app.post(
  "/api/admin/expel",
  requireAuth,
  requireAdmin,
  h(async (req, res) => {
    const wallet = lower(req.body.wallet);
    if (await club.isFullyActivated(wallet)) return res.status(400).json({ message: "Expel on-chain first." });
    await UserProfile.updateOne({ walletAddress: wallet }, { status: "EXPELLED" });
    return res.json({ ok: true });
  })
);

app.post(
  "/api/admin/interviewer",
  requireAuth,
  requireAdmin,
  h(async (req, res) => {
    await UserProfile.updateOne({ walletAddress: lower(req.body.wallet) }, { isInterviewer: !!req.body.value });
    return res.json({ ok: true });
  })
);

// ---------- chat history ----------
app.get(
  "/api/chat/history",
  requireAuth,
  requireMember,
  h(async (req, res) => {
    const me = req.address as string;
    const other = lower(req.query.with || "group");
    if (other !== "group" && !ethers.isAddress(other)) return res.status(400).json({ message: "Bad target." });
    const filter = other === "group" ? { to: "group" } : { $or: [{ from: me, to: other }, { from: other, to: me }] };
    const rows = await Message.find(filter).sort({ createdAt: -1 }).limit(100);
    return res.json(rows.reverse());
  })
);

// ---------- meetings ----------
app.post(
  "/api/meetings/recordings",
  requireAuth,
  requireMember,
  upload.single("video"),
  h(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No video uploaded." });
    const rec = await MeetingRecording.create({
      meetingName: String(req.body.meetingName || "Meeting").slice(0, 100),
      recordedBy: req.address,
      filePath: req.file.path,
    });
    return res.status(201).json({ id: rec._id });
  })
);

app.get(
  "/api/meetings",
  requireAuth,
  requireMember,
  h(async (_req, res) => res.json(await MeetingRecording.find({}).select("meetingName recordedBy recordedAt").sort({ recordedAt: -1 })))
);

app.get(
  "/api/meetings/:id/file",
  requireAuth,
  requireMember,
  h(async (req, res) => {
    const id = String(req.params.id);
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Bad id." });
    const rec = await MeetingRecording.findById(id);
    if (!rec) return res.status(404).json({ message: "Not found." });
    return res.type("video/webm").sendFile(path.resolve(rec.filePath));
  })
);

// ---------- errors ----------
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : "Server error." });
});

// ---------- realtime chat ----------
io.use(async (socket, next) => {
  const address = verifyToken(socket.handshake.auth?.token);
  if (!address || !(await isMember(address))) return next(new Error("unauthorized"));
  socket.data.address = address;
  next();
});

io.on("connection", (socket) => {
  const me = socket.data.address as string;
  socket.join("group");
  socket.join(`user:${me}`);

  socket.on("message", async (p: { to?: string; text?: string }) => {
    try {
      const text = String(p?.text || "").trim().slice(0, 1000);
      const to = lower(p?.to);
      if (!text || (to !== "group" && !ethers.isAddress(to))) return;
      const msg = await Message.create({ from: me, to, text });
      const payload = { from: msg.from, to: msg.to, text: msg.text, createdAt: msg.createdAt };
      if (to === "group") io.to("group").emit("message", payload);
      else io.to(`user:${to}`).to(`user:${me}`).emit("message", payload);
    } catch (e) {
      console.error(e);
    }
  });
});

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("Database connected");
    server.listen(env.PORT, () => console.log(`API listening on port ${env.PORT}`));
  })
  .catch((e) => {
    console.error("Database connection failed:", e);
    process.exit(1);
  });