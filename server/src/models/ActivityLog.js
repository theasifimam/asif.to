import { Schema, model } from "mongoose";

const activityLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, required: true, index: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    entityTitle: { type: String, trim: true, maxlength: 500 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    metadata: { type: Schema.Types.Mixed, default: {} },
    severity: { type: String, enum: ["info", "important", "critical"], default: "info", index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    targetUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    url: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ severity: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

export default model("ActivityLog", activityLogSchema);
