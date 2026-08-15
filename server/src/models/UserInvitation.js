import { Schema, model } from "mongoose";

const invitationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["author", "editor", "admin"],
      required: true,
    },
    tokenHash: { type: String, required: true, unique: true, select: false },
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled"],
      default: "pending",
      index: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true, index: true },
    acceptedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);

invitationSchema.index({ email: 1, status: 1 });

export default model("UserInvitation", invitationSchema);
