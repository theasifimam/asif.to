import { Schema, model } from "mongoose";

// ASIF_TRUSTED_ANALYTICS_V2
// This collection intentionally starts clean. Legacy AnalyticsDaily records
// may contain country values inferred from timezone and are not mixed here.
const analyticsTrustedDailySchema = new Schema(
  {
    date: { type: Date, required: true },
    path: { type: String, required: true, maxlength: 2048 },
    source: { type: String, required: true, maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrer: { type: String, default: "", maxlength: 2048 },

    // Country is stored only when the server receives a verified edge/CDN
    // ISO-3166 alpha-2 country header. It is never inferred from timezone.
    country: { type: String, default: "", maxlength: 2 },
    countrySource: {
      type: String,
      enum: ["", "cloudflare", "vercel", "cloudfront"],
      default: "",
      maxlength: 32,
    },

    // This is a viewport class, not a claim about the physical device.
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },

    pageViews: { type: Number, default: 0 },
    engagementMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

analyticsTrustedDailySchema.index(
  {
    date: 1,
    path: 1,
    source: 1,
    medium: 1,
    campaign: 1,
    referrer: 1,
    country: 1,
    countrySource: 1,
    device: 1,
  },
  { unique: true },
);
analyticsTrustedDailySchema.index({ date: -1, pageViews: -1 });
analyticsTrustedDailySchema.index({ path: 1, date: -1 });
analyticsTrustedDailySchema.index({ date: 1, country: 1, countrySource: 1 });

export default model("AnalyticsTrustedDaily", analyticsTrustedDailySchema);
