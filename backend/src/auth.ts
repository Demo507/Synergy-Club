import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ethers } from "ethers";
import { env } from "./env";

declare global {
  namespace Express {
    interface Request {
      address?: string;
    }
  }
}

export const ADMIN = env.ADMIN_WALLET;

const nonces = new Map<string, { nonce: string; exp: number }>();
const loginMessage = (nonce: string) => `Sign in to Synergy Shaking Hands Club.\nNonce: ${nonce}`;

export function issueNonce(address: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces.set(address, { nonce, exp: Date.now() + 5 * 60 * 1000 });
  return loginMessage(nonce);
}

export function verifyLogin(address: string, signature: string): string | null {
  const entry = nonces.get(address);
  if (!entry || entry.exp < Date.now()) return null;
  try {
    const signer = ethers.verifyMessage(loginMessage(entry.nonce), signature).toLowerCase();
    if (signer !== address) return null;
  } catch {
    return null;
  }
  nonces.delete(address);
  return jwt.sign({ address }, env.JWT_SECRET, { expiresIn: "12h" });
}

export function verifyToken(token?: string): string | null {
  try {
    return (jwt.verify(token || "", env.JWT_SECRET) as { address: string }).address;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const address = verifyToken((req.headers.authorization || "").replace("Bearer ", ""));
  if (!address) {
    res.status(401).json({ message: "Please sign in with your wallet." });
    return;
  }
  req.address = address;
  next();
}
