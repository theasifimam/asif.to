import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    socialPost: { type: Schema.Types.ObjectId, ref: "SocialPost", required: true, index: true },
    platform: { type: String, enum: ["instagram", "facebook", "linkedin"], required: true, index: true },
    status: { type: String, enum: ["publishing", "published", "failed"], default: "publishing", index: true },
    remotePostId: { type: String, default: "" },
    remotePostUrl: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    caption: { type: String, default: "" },
    assetUrls: { type: [String], default: [] },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

schema.index({ socialPost: 1, platform: 1, createdAt: -1 });
export default model("SocialPublication", schema);
