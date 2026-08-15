import { Schema, model } from "mongoose";

const auditLogSchema = new Schema(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: { type: String, required: true, trim: true, index: true },
    targetUser: { type: Schema.Types.ObjectId, ref: "User", index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, trim: true },
    userAgent: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetUser: 1, createdAt: -1 });

export default model("AuditLog", auditLogSchema);
