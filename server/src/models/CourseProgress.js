import { Schema, model } from "mongoose";

// ASIF_COURSE_LEARNING_FLOW_V1
const stageSchema = new Schema(
  {
    completed: { type: Boolean, default: false },
    score: { type: Number, default: 0, min: 0, max: 100 },
    attempts: { type: Number, default: 0, min: 0 },
    completedAt: { type: Date, default: null },
    updatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const chapterProgressSchema = new Schema(
  {
    chapter: { type: Schema.Types.ObjectId, ref: "Chapter", required: true },
    learn: { type: stageSchema, default: () => ({}) },
    revise: { type: stageSchema, default: () => ({}) },
    practice: { type: stageSchema, default: () => ({}) },
    build: { type: stageSchema, default: () => ({}) },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const courseProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    chapters: { type: [chapterProgressSchema], default: [] },
    lastChapter: { type: Schema.Types.ObjectId, ref: "Chapter", default: null },
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
);

courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });
courseProgressSchema.index({ user: 1, lastActivityAt: -1 });

export default model("CourseProgress", courseProgressSchema);
