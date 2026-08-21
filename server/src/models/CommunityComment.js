import { Schema, model } from "mongoose";
import { COMMUNITY_CONTENT_STATUSES } from "./CommunityPost.js";

const communityCommentSchema = new Schema({
  post: { type: Schema.Types.ObjectId, ref: "CommunityPost", required: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  parent: { type: Schema.Types.ObjectId, ref: "CommunityComment", default: null, index: true },
  body: { type: String, required: true, minlength: 2, maxlength: 10000 },
  code: { type: String, default: "", maxlength: 20000 },
  language: { type: String, default: "", trim: true, maxlength: 40 },
  status: { type: String, enum: COMMUNITY_CONTENT_STATUSES, default: "published", index: true },
  statusReason: { type: String, default: "", maxlength: 1000 },
  automaticallyHiddenAt: Date,
  editedAt: Date,
  deletedAt: Date,
  submissionFingerprint: { type: String, select: false },
}, { timestamps: true });

communityCommentSchema.index({ post: 1, parent: 1, status: 1, createdAt: 1 });
communityCommentSchema.index({ author: 1, status: 1, createdAt: -1 });
communityCommentSchema.index({ author: 1, submissionFingerprint: 1, createdAt: -1 });

export default model("CommunityComment", communityCommentSchema);
