import { Schema, model } from "mongoose";

const flashcardSchema = new Schema(
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
    // Front face of the card — concept / term
    front: {
      type: String,
      required: true,
    },
    // Back face of the card — answer / explanation
    back: {
      type: String,
      required: true,
    },
    // Short label for grouping (e.g. "Hooks", "Routing", "State")
    tag: {
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

flashcardSchema.index({ techId: 1, status: 1 });

export default model("Flashcard", flashcardSchema);
