import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    activityId: { type: Schema.Types.ObjectId, ref: "ActivityLog", default: null, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", default: null, index: true },
    messageId: { type: Schema.Types.ObjectId, ref: "Message", default: null, index: true },
    title: { type: String, required: true, maxlength: 300 },
    message: { type: String, required: true, maxlength: 1000 },
    type: { type: String, default: "activity", index: true },
    severity: { type: String, enum: ["info", "important", "critical"], default: "info", index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: Date,
    url: { type: String, trim: true, maxlength: 1000 },
    dedupeKey: { type: String, trim: true, maxlength: 300, select: false },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, dedupeKey: 1 }, { unique: true, sparse: true });

export default model("Notification", notificationSchema);
