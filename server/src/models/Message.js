import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, default: "", trim: true, maxlength: 4000 },
    clientId: { type: String, trim: true, maxlength: 100 },
    // Reserved for later V2 features; no V1 API accepts these values.
    replyToMessageId: { type: Schema.Types.ObjectId, ref: "Message", default: null, index: true },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    attachments: [{
      attachmentId: { type: Schema.Types.ObjectId, ref: "MessageAttachment" },
      name: String,
      url: String,
      mimeType: String,
      size: Number,
      _id: false,
    }],
    editedAt: Date,
    deletedAt: Date,
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ mentions: 1, createdAt: -1 });
messageSchema.index({ content: "text" });
messageSchema.index(
  { senderId: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: "string" } } },
);

export default model("Message", messageSchema);
