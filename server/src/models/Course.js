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
    },
    subtitle: {
      type: String,
      required: true,
    },
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
    // Populated chapters are fetched via Chapter.find({ course: id })
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: chapter count
courseSchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "course",
  options: { sort: { order: 1 } },
});

courseSchema.index({ status: 1, order: 1 });

export default model("Course", courseSchema);
