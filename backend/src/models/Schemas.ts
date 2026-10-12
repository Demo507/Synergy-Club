import mongoose, { Schema } from "mongoose";

export const STATUSES = ["PENDING_INTERVIEW", "APPROVED", "ACTIVATED", "REJECTED", "EXPELLED"] as const;

const InvitationSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    generatedBy: { type: String, required: true, lowercase: true, index: true },
    usedBy: { type: String, default: null },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserProfileSchema = new Schema(
  {
    walletAddress: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    invitedBy: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    isDrugAddict: { type: Boolean, required: true },
    isDrunker: { type: Boolean, required: true },
    isCultist: { type: Boolean, required: true },
    intentions: { type: String, required: true, maxlength: 1000 },
    phoneNumber: { type: String, required: true, maxlength: 30 },
    email: { type: String, required: true, lowercase: true, maxlength: 120 },
    photo: { type: String, default: null }, // small base64 JPEG (320x320)
    status: { type: String, enum: STATUSES, default: "PENDING_INTERVIEW", index: true },
    registrationCode: { type: String, default: null },
    isInterviewer: { type: Boolean, default: false },
    notes: [{ by: String, text: String, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

const MeetingRecordingSchema = new Schema({
  meetingName: { type: String, required: true },
  recordedBy: { type: String, required: true },
  filePath: { type: String, required: true },
  recordedAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema(
  {
    from: { type: String, required: true, index: true },
    to: { type: String, required: true, index: true }, // "group" or a wallet address
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

export const Invitation = mongoose.model("Invitation", InvitationSchema);
export const UserProfile = mongoose.model("UserProfile", UserProfileSchema);
export const MeetingRecording = mongoose.model("MeetingRecording", MeetingRecordingSchema);
export const Message = mongoose.model("Message", MessageSchema);
