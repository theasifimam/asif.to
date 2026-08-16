import { Schema, model } from "mongoose";
const schema = new Schema({ messageId: { type: Schema.Types.ObjectId, ref: "Message", required: true }, conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true }, emoji: { type: String, enum: ["👍", "✅", "👀", "🎉"], required: true }, userId: { type: Schema.Types.ObjectId, ref: "User", required: true } }, { timestamps: true });
schema.index({ messageId: 1, emoji: 1, userId: 1 }, { unique: true });
schema.index({ conversationId: 1, messageId: 1 });
export default model("MessageReaction", schema);
