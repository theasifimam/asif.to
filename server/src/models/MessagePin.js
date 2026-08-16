import { Schema, model } from "mongoose";
const schema = new Schema({ conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true }, messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true }, pinnedBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, pinnedAt: { type: Date, default: Date.now } }, { timestamps: true });
schema.index({ conversationId: 1, messageId: 1 }, { unique: true });
schema.index({ conversationId: 1, pinnedAt: -1 });
export default model("MessagePin", schema);
