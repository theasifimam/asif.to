import { Schema, model } from "mongoose";

export const COMMUNITY_POST_TYPES = ["question", "discussion", "help", "code", "learning", "project"];
export const COMMUNITY_CONTENT_STATUSES = ["published", "under_review", "hidden", "removed", "deleted_by_author"];

const relatedResourceSchema = new Schema({
  kind: { type: String, enum: ["course", "topic", "article", "interview_question", "cheatsheet", "playground_snippet"], required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  url: { type: String, required: true, trim: true, maxlength: 1000 },
}, { _id: false });

const communityPostSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type: { type: String, enum: COMMUNITY_POST_TYPES, required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 8, maxlength: 180 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  body: { type: String, required: true, minlength: 20, maxlength: 20000 },
  code: { type: String, default: "", maxlength: 30000 },
  language: { type: String, default: "", trim: true, maxlength: 40 },
  tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
  relatedResource: { type: relatedResourceSchema, default: null },
  visibility: { type: String, enum: ["public", "unlisted"], default: "public", index: true },
  status: { type: String, enum: COMMUNITY_CONTENT_STATUSES, default: "published", index: true },
  statusReason: { type: String, default: "", maxlength: 1000 },
  automaticallyHiddenAt: Date,
  editedAt: Date,
  deletedAt: Date,
  commentCount: { type: Number, default: 0, min: 0 },
  acceptedComment: { type: Schema.Types.ObjectId, ref: "CommunityComment", default: null },
  submissionFingerprint: { type: String, select: false },
}, { timestamps: true });

communityPostSchema.index({ status: 1, visibility: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, status: 1, createdAt: -1 });
communityPostSchema.index({ type: 1, status: 1, createdAt: -1 });
communityPostSchema.index({ "relatedResource.kind": 1, "relatedResource.targetId": 1, status: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, submissionFingerprint: 1, createdAt: -1 });

export default model("CommunityPost", communityPostSchema);
