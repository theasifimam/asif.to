import { Schema, model } from "mongoose";

const questionSchema = new Schema({
  type: { type: String, enum: ["quiz", "interview"], required: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: "TopicCategory", default: null, index: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", default: null },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
  question: { type: String, required: true, trim: true, maxlength: 500 },

  // Quiz/practice answer fields.
  options: { type: [String], default: undefined },
  correctIndex: { type: Number, min: 0, max: 3, default: undefined },
  explanation: { type: String, default: "" },
  quizEnabled: { type: Boolean, default: true },
  flashcardEnabled: { type: Boolean, default: true },
  flashcardAnswer: { type: String, default: "" },
  tag: { type: String, default: "", trim: true },
  legacyFlashcardId: { type: Schema.Types.ObjectId },

  // Detailed interview answer fields.
  answer: { type: String, default: "" },
  questionType: { type: String, enum: ["conceptual", "coding", "behavioral", "scenario", "debugging"], default: "conceptual" },
  tags: { type: [String], default: [] },
  slug: { type: String, trim: true, lowercase: true, maxlength: 180, default: "" },
  codeExample: { type: String, default: "" },
  expectedOutput: { type: String, default: "" },
  followUps: { type: [String], default: [] },
  seoTitle: { type: String, default: "", trim: true, maxlength: 70 },
  seoDescription: { type: String, default: "", trim: true, maxlength: 170 },
  keywords: { type: [String], default: [] },
  canonicalUrl: { type: String, default: "", trim: true, maxlength: 500 },
  ogImage: { type: String, default: "", trim: true, maxlength: 1000 },
  author: { type: Schema.Types.ObjectId, ref: "User", default: null },

  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
  status: { type: String, enum: ["draft", "published"], default: "published" },
  order: { type: Number, default: 0, index: true },
}, { timestamps: true, collection: "questions" });

questionSchema.index({ type: 1, category: 1, order: 1 });
questionSchema.index({ type: 1, category: 1, status: 1 });
questionSchema.index({ type: 1, courses: 1, status: 1 });
questionSchema.index({ type: 1, course: 1, difficulty: 1, questionType: 1 });
questionSchema.index({ legacyFlashcardId: 1 }, { unique: true, partialFilterExpression: { legacyFlashcardId: { $type: "objectId" } } });
questionSchema.index({ question: "text", answer: "text", tags: "text" });

questionSchema.pre("validate", function validateByType() {
  if (this.type === "quiz") {
    if (!Array.isArray(this.options) || this.options.length !== 4) this.invalidate("options", "Quiz questions must have exactly four options.");
    if (!Number.isInteger(this.correctIndex)) this.invalidate("correctIndex", "Quiz questions require a correct answer index.");
    if (!this.courses?.length) this.invalidate("courses", "Quiz questions require at least one course.");
  }
  if (this.type === "interview") {
    if (!this.category && !this.course) this.invalidate("category", "Interview questions require a category or course.");
    if (!this.answer) this.invalidate("answer", "Interview questions require a detailed answer.");
    if (!this.slug) this.invalidate("slug", "Interview questions require a slug.");
  }
});

export default model("Question", questionSchema);
