import { Schema, Document, model } from "mongoose";

const articleSchema = new Schema({
  type: {
    type: String,
    enum: ["article", "cheatsheet"],
    default: "article",
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  keywords: { type: [String], default: [] },
  canonicalUrl: { type: String, default: "" },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  readCount: {
    type: Number,
    default: 0,
  },
  views: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  image: {
    type: String,
    default: "",
  },
  topic: [
    {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
  ],
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "published",
  },
  techId: { type: String, default: "", trim: true, index: true },
  order: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model("Article", articleSchema);
