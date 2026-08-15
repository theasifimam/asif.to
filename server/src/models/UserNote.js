import { Schema, model } from "mongoose";

const userNoteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

userNoteSchema.index({ user: 1, createdAt: -1 });

export default model("UserNote", userNoteSchema);
