import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    platform: { type: String, enum: ["instagram", "facebook", "linkedin"], required: true, unique: true, index: true },
    status: { type: String, enum: ["connected", "needs_selection", "error", "disconnected"], default: "disconnected" },
    accountId: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountType: { type: String, default: "" },
    accessTokenEncrypted: { type: String, default: "" },
    refreshTokenEncrypted: { type: String, default: "" },
    accountTokenEncrypted: { type: String, default: "" },
    scopes: { type: [String], default: [] },
    tokenExpiresAt: { type: Date, default: null },
    accountOptions: { type: [{ id: String, name: String }], default: [] },
    errorMessage: { type: String, default: "" },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    connectedAt: { type: Date, default: null },
    lastCheckedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.SocialIntegration || mongoose.model("SocialIntegration", schema);
