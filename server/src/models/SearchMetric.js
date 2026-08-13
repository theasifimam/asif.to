import { Schema, model } from "mongoose";

const searchMetricSchema = new Schema(
  {
    date: { type: Date, required: true },
    dimension: { type: String, enum: ["total", "queryPage", "country", "device", "appearance"], required: true },
    query: { type: String, default: "", maxlength: 1000 },
    page: { type: String, default: "", maxlength: 2048 },
    key: { type: String, default: "", maxlength: 1000 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

searchMetricSchema.index({ date: 1, dimension: 1, query: 1, page: 1, key: 1 }, { unique: true });
searchMetricSchema.index({ dimension: 1, date: -1, clicks: -1 });
searchMetricSchema.index({ dimension: 1, page: 1, date: -1 });
searchMetricSchema.index({ dimension: 1, query: 1, date: -1 });

export default model("SearchMetric", searchMetricSchema);
