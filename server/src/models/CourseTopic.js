import { Schema, model } from "mongoose";

const courseTopicSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["article", "interview"],
      default: "article",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "TopicCategory",
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 320,
    },
    content: {
      type: String,
      default: "",
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
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
    relatedTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: "CourseTopic",
      },
    ],
    interviewQuestions: [
      {
        question: {
          type: Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        order: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true },
);

courseTopicSchema.index({ course: 1, slug: 1 }, { unique: true });
courseTopicSchema.index({ course: 1, category: 1, order: 1 });
courseTopicSchema.index({ status: 1, course: 1, order: 1 });
courseTopicSchema.index({ title: "text", excerpt: "text", keywords: "text" });

export default model("CourseTopic", courseTopicSchema);
