import { Schema, model } from "mongoose";

const moderationActionSchema = new Schema({
  moderator: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  source: { type: String, enum: ["automatic", "manual"], default: "manual" },
  action: { type: String, enum: ["auto_hide", "hide", "restore", "remove", "dismiss_reports", "resolve_reports"], required: true, index: true },
  targetType: { type: String, enum: ["post", "comment"], required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  fromStatus: String,
  toStatus: String,
  reason: { type: String, default: "", trim: true, maxlength: 1000 },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

moderationActionSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
moderationActionSchema.index({ createdAt: -1 });

export default model("ModerationAction", moderationActionSchema);
