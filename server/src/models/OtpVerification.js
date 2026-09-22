import { Schema, model } from "mongoose";

const otpVerificationSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    otpHash: { type: String, required: true, select: false },
    purpose: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, required: true },
  },
  { timestamps: true },
);

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model("OtpVerification", otpVerificationSchema);
