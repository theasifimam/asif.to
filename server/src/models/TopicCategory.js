import { Schema, model } from "mongoose";

const topicCategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 140,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      default: "",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
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
    ogTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    ogDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    ogImage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    twitterTitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    twitterDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    twitterImage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    noindex: {
      type: Boolean,
      default: false,
    },
    nofollow: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

topicCategorySchema.index({ slug: 1 });
topicCategorySchema.index({ status: 1, order: 1 });
topicCategorySchema.index({ course: 1, slug: 1 });

export default model("TopicCategory", topicCategorySchema);

