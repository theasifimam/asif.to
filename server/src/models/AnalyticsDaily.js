import { Schema, model } from "mongoose";

const analyticsDailySchema = new Schema(
  {
    date: { type: Date, required: true },
    path: { type: String, required: true, maxlength: 2048 },
    source: { type: String, required: true, maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrer: { type: String, default: "", maxlength: 2048 },
    country: { type: String, default: "", maxlength: 8 },
    device: { type: String, enum: ["desktop", "mobile", "tablet", "other"], default: "other" },
    pageViews: { type: Number, default: 0 },
    engagementMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

analyticsDailySchema.index({ date: 1, path: 1, source: 1, medium: 1, campaign: 1, referrer: 1, country: 1, device: 1 }, { unique: true });
analyticsDailySchema.index({ date: -1, pageViews: -1 });
analyticsDailySchema.index({ path: 1, date: -1 });

export default model("AnalyticsDaily", analyticsDailySchema);
