import { Schema, model } from "mongoose";
const schema = new Schema({ conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true }, messageId: { type: Schema.Types.ObjectId, ref: "Message", default: null }, uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, originalName: { type: String, required: true, maxlength: 255 }, storageKey: { type: String, required: true, unique: true }, mimeType: { type: String, required: true }, size: { type: Number, required: true, max: 10485760 } }, { timestamps: true });
schema.index({ conversationId: 1, uploadedBy: 1, messageId: 1 });
export default model("MessageAttachment", schema);
