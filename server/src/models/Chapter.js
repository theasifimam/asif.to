import { Schema, model } from "mongoose";

const codeSnippetSchema = new Schema({
  title: { type: String, default: "" },
  code: { type: String, required: true },
  language: { type: String, default: "javascript" },
});

const chapterSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      required: true,
    },
    // Array of Markdown paragraphs or rich blocks
    content: {
      type: [String],
      default: [],
    },
    // Backwards compatible single code snippet
    codeSnippet: {
      type: String,
      default: "",
    },
    // Array of multiple code snippets with titles & language
    codeSnippets: {
      type: [codeSnippetSchema],
      default: [],
    },
    language: {
      type: String,
      default: "javascript",
    },
    tryItChallenge: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    // Reader view tracking — incremented on each chapter page visit
    viewCount: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

chapterSchema.index({ course: 1, slug: 1 }, { unique: true });

export default model("Chapter", chapterSchema);
