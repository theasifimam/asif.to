import crypto from "crypto";
import { Schema, model } from "mongoose";

const checklistItemSchema = new Schema(
  {
    id: { type: String, default: () => crypto.randomUUID(), required: true },
    text: { type: String, default: "", maxlength: 1000 },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
);

const personalNoteSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "", maxlength: 200 },
    type: {
      type: String,
      enum: ["text", "checklist"],
      default: "text",
    },
    content: { type: String, default: "", maxlength: 50000 },
    checklist: { type: [checklistItemSchema], default: [] },
    color: {
      type: String,
      enum: ["neutral", "amber", "blue", "emerald", "rose", "violet"],
      default: "neutral",
    },
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

personalNoteSchema.index({ owner: 1, archived: 1, pinned: -1, updatedAt: -1 });

export default model("PersonalNote", personalNoteSchema);
