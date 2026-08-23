import { Schema, model } from "mongoose";

const codeSnippetSchema = new Schema({
  title: { type: String, default: "" },
  code: { type: String, required: true },
  language: { type: String, default: "javascript" },
  showPlay: { type: Boolean, default: false },
});

const chapterSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "TopicCategory",
      default: null,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },
    seoTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 70,
    },
    seoDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 170,
    },
    keywords: {
      type: [String],
      default: [],
    },
    canonicalUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
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

// ASIF_COURSE_LEARNING_FLOW_V1:chapter-learning-schema
learningActivities: {
  revisionQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  practiceQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  build: {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: "", trim: true, maxlength: 220 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    requirements: { type: [String], default: [] },
    estimatedMinutes: { type: Number, default: 0, min: 0, max: 10080 },
  },
},
relatedQuestions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    relatedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
  },
  {
    timestamps: true,
  },
);

chapterSchema.index({ course: 1, slug: 1 }, { unique: true });
chapterSchema.index({ course: 1, status: 1, order: 1 });
chapterSchema.index({ title: "text", summary: "text", keywords: "text" });

export default model("Chapter", chapterSchema);
