import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    type: { type: String, enum: ["direct", "channel", "discussion"], required: true, index: true },
    directKey: { type: String, unique: true, sparse: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, trim: true, maxlength: 80 },
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    description: { type: String, trim: true, maxlength: 300 },
    readRoles: [{ type: String, enum: ["author", "editor", "admin", "super_admin"] }],
    postRoles: [{ type: String, enum: ["author", "editor", "admin", "super_admin"] }],
    allowedMemberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    entityKey: { type: String, unique: true, sparse: true, index: true },
    entityType: { type: String, enum: ["article", "chapter", "course", "interview_question", "cheatsheet"], index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    entityTitle: { type: String, trim: true, maxlength: 300 },
    entityUrl: { type: String, trim: true, maxlength: 1000 },
    entityAuthorId: { type: Schema.Types.ObjectId, ref: "User" },
    requiredPermission: { type: String, trim: true },
    isSystem: { type: Boolean, default: false },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    lastMessageText: { type: String, default: "", maxlength: 240 },
    lastMessageSenderId: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

conversationSchema.index({ members: 1, lastMessageAt: -1 });
conversationSchema.index({ type: 1, lastMessageAt: -1 });
conversationSchema.index({ readRoles: 1, lastMessageAt: -1 });
conversationSchema.index({ entityType: 1, entityId: 1 }, { unique: true, partialFilterExpression: { type: "discussion" } });

export default model("Conversation", conversationSchema);
