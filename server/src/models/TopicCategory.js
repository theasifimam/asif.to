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
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

topicCategorySchema.index({ course: 1, slug: 1 }, { unique: true });
topicCategorySchema.index({ course: 1, order: 1, name: 1 });

export default model("TopicCategory", topicCategorySchema);
