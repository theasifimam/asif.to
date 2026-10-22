import { Schema, model } from "mongoose";

const periodMetrics = {
  clicks: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  ctr: { type: Number, default: 0 },
  position: { type: Number, default: 0 },
};

// One row per deliberate on-page SEO change, with the search performance of
// the page in the window before it, so later results can be judged fairly.
const seoChangeSchema = new Schema(
  {
    path: { type: String, required: true, index: true, trim: true },
    changeType: {
      type: String,
      enum: ["title", "description", "content", "internal-links", "technical", "other"],
      default: "other",
    },
    note: { type: String, default: "", trim: true, maxlength: 1000 },
    changedAt: { type: Date, required: true, default: Date.now },
    baseline: { from: Date, to: Date, ...periodMetrics },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default model("SeoChange", seoChangeSchema);
