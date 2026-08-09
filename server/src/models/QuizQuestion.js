import { Schema, model } from "mongoose";

const quizQuestionSchema = new Schema(
  {
    techId: {
      type: String,
      required: true,
      trim: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    question: {
      type: String,
      required: true,
    },
    // Exactly 4 answer options
    options: {
      type: [String],
      validate: {
        validator: (v) => v.length === 4,
        message: "Quiz question must have exactly 4 options.",
      },
    },
    // 0-indexed correct answer
    correctIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    explanation: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

quizQuestionSchema.index({ techId: 1, status: 1 });

export default model("QuizQuestion", quizQuestionSchema);
