import { Schema, model } from "mongoose";

// ASIF_TRUSTED_ANALYTICS_V2
// A visitor is a distinct first-party browser identifier. It is deliberately
// not called a unique human/person because a person can use multiple browsers
// and a browser can be shared.
const analyticsTrustedIdentitySchema = new Schema(
  {
    date: { type: Date, required: true },
    visitorHash: { type: String, required: true, maxlength: 64 },
    sessionHash: { type: String, required: true, maxlength: 64 },
    path: { type: String, required: true, maxlength: 2048 },

    source: { type: String, default: "", maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrerDomain: { type: String, default: "", maxlength: 255 },
    landingPath: { type: String, default: "", maxlength: 2048 },

    country: { type: String, default: "", maxlength: 2 },
    countrySource: {
      type: String,
      enum: ["", "cloudflare", "vercel", "cloudfront"],
      default: "",
      maxlength: 32,
    },

    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },
    timezone: { type: String, default: "", maxlength: 100 },
    language: { type: String, default: "", maxlength: 32 },
  },
  { timestamps: true },
);

analyticsTrustedIdentitySchema.index(
  { date: 1, visitorHash: 1, sessionHash: 1, path: 1 },
  { unique: true },
);
analyticsTrustedIdentitySchema.index({ date: 1, visitorHash: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, sessionHash: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, source: 1, medium: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, country: 1, countrySource: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, timezone: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, device: 1 });

// Keep raw identity rows for ~400 days, matching the previous analytics model.
analyticsTrustedIdentitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 34560000 },
);

export default model(
  "AnalyticsTrustedIdentity",
  analyticsTrustedIdentitySchema,
);
