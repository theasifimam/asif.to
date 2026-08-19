import { Schema, model } from "mongoose";

const codeBlockSchema = new Schema(
  {
    language: { type: String, default: "javascript" },
    filename: { type: String, default: "" },
    content: { type: String, default: "" },
    highlightLines: { type: [Number], default: [] },
    showLineNumbers: { type: Boolean, default: true },
  },
  { _id: false },
);

const comparisonSideSchema = new Schema(
  {
    label: { type: String, default: "" },
    items: { type: [String], default: [] },
  },
  { _id: false },
);

const slideSchema = new Schema(
  {
    id: { type: String, required: true },
    order: { type: Number, default: 0 },
    template: { type: String, default: "developer-tip" },
    eyebrow: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    body: { type: String, default: "" },
    highlightedText: { type: String, default: "" },
    code: { type: codeBlockSchema, default: null },
    bulletPoints: { type: [String], default: [] },
    quote: { type: String, default: "" },
    author: { type: String, default: "" },
    badge: { type: String, default: "" },
    stepNumber: { type: Number, default: null },
    cta: { type: String, default: "" },
    footerText: { type: String, default: "" },
    url: { type: String, default: "" },
    comparisonLeft: { type: comparisonSideSchema, default: null },
    comparisonRight: { type: comparisonSideSchema, default: null },
  },
  { _id: false },
);

const postSettingsSchema = new Schema(
  {
    accentColor: { type: String, default: "#2563eb" },
    codeTheme: { type: String, enum: ["dark", "light"], default: "dark" },
    showBranding: { type: Boolean, default: true },
    showSlideNumbers: { type: Boolean, default: true },
    showCategory: { type: Boolean, default: true },
    footerText: { type: String, default: "asif.to" },
  },
  { _id: false },
);

const socialPostSchema = new Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: "", trim: true },
  platform: {
    type: String,
    enum: ["instagram", "linkedin", "twitter", "facebook", "general"],
    default: "instagram",
  },
  format: {
    type: String,
    enum: ["square-1080", "portrait-1080"],
    default: "square-1080",
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
    index: true,
  },
  settings: { type: postSettingsSchema, default: () => ({}) },
  slides: { type: [slideSchema], default: [] },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

socialPostSchema.index({ createdBy: 1, status: 1, updatedAt: -1 });

export default model("SocialPost", socialPostSchema);
