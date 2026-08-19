import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    socialPost: { type: Schema.Types.ObjectId, ref: "SocialPost", required: true, index: true },
    platform: { type: String, enum: ["instagram", "facebook", "linkedin"], required: true, index: true },
    status: {
      type: String,
      enum: ["scheduled", "publishing", "published", "failed", "cancelled"],
      default: "publishing",
      index: true,
    },
    remotePostId: { type: String, default: "" },
    remotePostUrl: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    caption: { type: String, default: "" },
    assetUrls: { type: [String], default: [] },
    assetPaths: { type: [String], default: [] },
    assetMimeTypes: { type: [String], default: [] },
    scheduledAt: { type: Date, default: null, index: true },
    publishedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: null },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

schema.index({ socialPost: 1, platform: 1, createdAt: -1 });
schema.index({ status: 1, scheduledAt: 1 });

export default model("SocialPublication", schema);
