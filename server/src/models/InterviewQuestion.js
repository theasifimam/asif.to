import { Schema, model } from "mongoose";

const interviewQuestionSchema = new Schema(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      required: true,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    questionType: {
      type: String,
      enum: ["conceptual", "coding", "behavioral", "scenario", "debugging"],
      default: "conceptual",
    },
    tags: {
      type: [String],
      default: [],
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    codeExample: {
      type: String,
      default: "",
    },
    expectedOutput: {
      type: String,
      default: "",
    },
    followUps: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

interviewQuestionSchema.index({ course: 1, slug: 1 }, { unique: true });
interviewQuestionSchema.index({
  question: "text",
  answer: "text",
  tags: "text",
});
interviewQuestionSchema.index({ course: 1, difficulty: 1, questionType: 1 });
interviewQuestionSchema.index({ course: 1, tags: 1 });

export default model("InterviewQuestion", interviewQuestionSchema);
