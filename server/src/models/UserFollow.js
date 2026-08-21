import { Schema, model } from "mongoose";

const userFollowSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

userFollowSchema.index({ follower: 1, following: 1 }, { unique: true });
userFollowSchema.index({ following: 1, createdAt: -1 });
userFollowSchema.index({ follower: 1, createdAt: -1 });

export default model("UserFollow", userFollowSchema);
