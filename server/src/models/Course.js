import { Schema, model } from "mongoose";

const courseSchema = new Schema(
  {
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
      maxlength: 180,
    },
    subtitle: {
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
    interviewSeoTitle: { type: String, default: "", trim: true, maxlength: 70 },
    interviewSeoDescription: { type: String, default: "", trim: true, maxlength: 170 },
    interviewKeywords: { type: [String], default: [] },
    interviewCanonicalUrl: { type: String, default: "", trim: true, maxlength: 500 },
    interviewOgImage: { type: String, default: "", trim: true, maxlength: 1000 },
    techId: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      default: "Beginner - Advanced",
    },
    duration: {
      type: String,
      default: "Self-paced",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    // What You Will Learn — list of skill bullet points
    learningOutcomes: [
      {
        type: String,
      },
    ],
    // Controls display order on homepage
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    examEnabled: {
      type: Boolean,
      default: false,
    },
    examSettings: {
      questionCount: { type: Number, default: 20, min: 1, max: 100 },
      durationMinutes: { type: Number, default: 30, min: 1, max: 300 },
      passingPercentage: { type: Number, default: 70, min: 1, max: 100 },
      cooldownHours: { type: Number, default: 24, min: 0, max: 720 },
    },
    relatedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    relatedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }],
    popularChapterIds: [{ type: Schema.Types.ObjectId, ref: "Chapter" }],
    // Optional author attribution (e.g. for re-assigning ownership)
    author: { type: Schema.Types.ObjectId, ref: "User", default: null },
    // Populated chapters are fetched via Chapter.find({ course: id })
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual: chapter count
courseSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "course",
  options: { sort: { order: 1 } },
});

courseSchema.index({ status: 1, order: 1 });
courseSchema.index({ examEnabled: 1, status: 1 });
courseSchema.index({ title: "text", subtitle: "text", keywords: "text" });

// Course deletion is intentionally blocked at the model layer.
// The old middleware silently deleted categories and ALL linked Question records,
// including questions shared with other courses. The protected deletion controller
// now performs the reviewed cascade inside one transaction and uses the native
// collection API for the final course row only after two separate OTP approvals.
const blockUnprotectedCourseDeletion = function () {
  throw new Error(
    "Protected course deletion must use the two-admin deletion workflow.",
  );
};

courseSchema.pre("findOneAndDelete", blockUnprotectedCourseDeletion);
courseSchema.pre(
  "deleteOne",
  { document: true, query: false },
  blockUnprotectedCourseDeletion,
);
courseSchema.pre(
  "deleteOne",
  { document: false, query: true },
  blockUnprotectedCourseDeletion,
);
courseSchema.pre("deleteMany", blockUnprotectedCourseDeletion);

export default model("Course", courseSchema);
