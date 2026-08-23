import { Schema, model } from "mongoose";

// ASIF_SIMPLE_ANALYTICS_V1
const analyticsIdentitySchema = new Schema(
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

    country: { type: String, default: "", maxlength: 8 },
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

analyticsIdentitySchema.index(
  { date: 1, visitorHash: 1, sessionHash: 1, path: 1 },
  { unique: true },
);
analyticsIdentitySchema.index({ date: 1, visitorHash: 1 });
analyticsIdentitySchema.index({ date: 1, sessionHash: 1 });
analyticsIdentitySchema.index({ date: 1, source: 1, medium: 1 });
analyticsIdentitySchema.index({ date: 1, country: 1 });
analyticsIdentitySchema.index({ date: 1, timezone: 1 });
analyticsIdentitySchema.index({ date: 1, device: 1 });
analyticsIdentitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 34560000 },
);

export default model("AnalyticsIdentity", analyticsIdentitySchema);
