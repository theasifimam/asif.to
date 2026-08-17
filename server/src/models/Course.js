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

// Cascade delete chapters when a course is deleted
courseSchema.pre("findOneAndDelete", async function () {
  const courseId = this.getQuery()["_id"];
  if (courseId) {
    await Promise.all([
      model("Chapter").deleteMany({ course: courseId }),
      model("CourseTopic").deleteMany({ course: courseId }),
      model("TopicCategory").deleteMany({ course: courseId }),
      model("Question").deleteMany({ $or: [{ course: courseId }, { courses: courseId }] }),
    ]);
  }
});

courseSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await Promise.all([
      model("Chapter").deleteMany({ course: this._id }),
      model("CourseTopic").deleteMany({ course: this._id }),
      model("TopicCategory").deleteMany({ course: this._id }),
      model("Question").deleteMany({ $or: [{ course: this._id }, { courses: this._id }] }),
    ]);
  },
);

export default model("Course", courseSchema);
