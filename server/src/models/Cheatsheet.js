import { Schema, model } from "mongoose";

const snippetSchema = new Schema(
  {
    name: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, default: "javascript" },
  },
  { _id: false }
);

const cheatsheetSchema = new Schema(
  {
    techId: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Code snippet examples — array of { name, code, language }
    snippets: [snippetSchema],
    // Controls display order
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

cheatsheetSchema.index({ techId: 1, status: 1 });

export default model("Cheatsheet", cheatsheetSchema);
