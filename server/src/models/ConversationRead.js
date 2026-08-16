import { Schema, model } from "mongoose";

const conversationReadSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastReadAt: { type: Date, default: Date.now },
    lastReadMessageId: { type: Schema.Types.ObjectId, ref: "Message" },
    unreadCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

conversationReadSchema.index({ conversationId: 1, userId: 1 }, { unique: true });
conversationReadSchema.index({ userId: 1, unreadCount: 1 });

export default model("ConversationRead", conversationReadSchema);
