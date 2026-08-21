import { Schema, model } from "mongoose";

export const COMMUNITY_REPORT_REASONS = ["spam", "harassment", "hate", "sexual", "dangerous", "scam", "off_topic", "copyright", "other"];

const communityReportSchema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  targetType: { type: String, enum: ["post", "comment"], required: true, index: true },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  targetAuthor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  reason: { type: String, enum: COMMUNITY_REPORT_REASONS, required: true },
  explanation: { type: String, default: "", trim: true, maxlength: 500 },
  status: { type: String, enum: ["active", "dismissed", "resolved"], default: "active", index: true },
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  resolvedAt: Date,
  resolutionNote: { type: String, default: "", maxlength: 1000 },
}, { timestamps: true });

communityReportSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 });
communityReportSchema.index({ status: 1, createdAt: -1 });
communityReportSchema.index(
  { reporter: 1, targetType: 1, targetId: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
);

export default model("CommunityReport", communityReportSchema);
