import { Schema, model } from "mongoose";

const internalLinkRuleSchema = new Schema(
  {
    keyword: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: Number,
      default: 5,
    },
    maxPerPage: {
      type: Number,
      default: 1,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes for fast lookup on the frontend
internalLinkRuleSchema.index({ enabled: 1, priority: -1 });

export default model("InternalLinkRule", internalLinkRuleSchema);
