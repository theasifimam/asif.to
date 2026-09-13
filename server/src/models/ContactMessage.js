import { Schema, model } from "mongoose";

const contactMessageSchema = new Schema(
  {
    originEmailJob: { type: Schema.Types.ObjectId, ref: "EmailJob", index: true },
    conversationNumber: { type: String, unique: true, sparse: true },
    inboundKey: { type: String, unique: true, sparse: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    conversationStatus: { type: String, enum: ["NEW", "OPEN", "WAITING_FOR_ADMIN", "WAITING_FOR_CUSTOMER", "RESOLVED", "CLOSED", "SPAM"], default: "NEW", index: true },
    source: { type: String, default: "CONTACT_FORM" }, category: { type: String, default: "General" },
    priority: { type: String, enum: ["LOW", "NORMAL", "HIGH", "URGENT"], default: "NORMAL" },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User", default: null }, tags: [String],
    unreadCount: { type: Number, default: 1 }, lastMessageAt: { type: Date, default: Date.now, index: true },
    firstResponseAt: Date, resolvedAt: Date,
    relatedContent: { entityType: String, entityId: Schema.Types.ObjectId },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
    replies: [{
      requestId: { type: String, required: true },
      message: { type: String, required: true, maxlength: 20000 },
      subject: { type: String, required: true },
      from: { type: String, default: "support@asif.to" },
      sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      status: { type: String, enum: ["sending", "sent", "failed"], default: "sending" },
      createdAt: { type: Date, default: Date.now },
      sentAt: Date,
      messageId: String,
    }],
  },
  {
    timestamps: true,
  }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

export default model("ContactMessage", contactMessageSchema);
