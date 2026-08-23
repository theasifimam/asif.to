import { Schema, model } from "mongoose";

const analyticsIdentitySchema = new Schema(
  {
    date: { type: Date, required: true },
    visitorHash: { type: String, required: true, maxlength: 64 },
    sessionHash: { type: String, required: true, maxlength: 64 },
    path: { type: String, required: true, maxlength: 2048 },
  },
  { timestamps: true },
);

analyticsIdentitySchema.index({ date: 1, visitorHash: 1, sessionHash: 1, path: 1 }, { unique: true });
analyticsIdentitySchema.index({ date: 1, visitorHash: 1 });
analyticsIdentitySchema.index({ date: 1, sessionHash: 1 });
analyticsIdentitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 34560000 });

export default model("AnalyticsIdentity", analyticsIdentitySchema);
