import { Schema, model } from "mongoose";

const selectionSchema = new Schema(
  {
    chapters: { type: Boolean, default: true },
    courseTopics: { type: Boolean, default: true },
    categories: { type: Boolean, default: true },
    interviewQuestions: { type: Boolean, default: true },
    quizQuestions: { type: Boolean, default: true },
    sharedQuizQuestions: { type: Boolean, default: false },
    cheatsheets: { type: Boolean, default: true },
  },
  { _id: false },
);

const impactSchema = new Schema(
  {
    chapters: { type: Number, default: 0 },
    courseTopics: { type: Number, default: 0 },
    categories: { type: Number, default: 0 },
    interviewQuestions: { type: Number, default: 0 },
    quizExclusive: { type: Number, default: 0 },
    quizShared: { type: Number, default: 0 },
    cheatsheets: { type: Number, default: 0 },
    otherCoursesSameTech: { type: Number, default: 0 },
    relatedArticles: { type: Number, default: 0 },
  },
  { _id: false },
);

const resultSchema = new Schema(
  {
    chapters: { type: Number, default: 0 },
    courseTopics: { type: Number, default: 0 },
    categories: { type: Number, default: 0 },
    interviewQuestions: { type: Number, default: 0 },
    quizQuestions: { type: Number, default: 0 },
    sharedQuizQuestions: { type: Number, default: 0 },
    sharedQuizDetached: { type: Number, default: 0 },
    cheatsheets: { type: Number, default: 0 },
    cleanedArticleReferences: { type: Number, default: 0 },
    cleanedCategoryReferences: { type: Number, default: 0 },
    cleanedCourseReferences: { type: Number, default: 0 },
    cleanedTopicReferences: { type: Number, default: 0 },
    course: { type: Number, default: 0 },
  },
  { _id: false },
);

const deletionRequestSchema = new Schema(
  {
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      refPath: "entityModel",
    },
    entityModel: {
      type: String,
      required: true,
      enum: ["Course", "TopicCategory"],
      index: true,
    },
    entitySnapshot: {
      title: { type: String, required: true },
      slug: { type: String, required: true },
      techId: { type: String, default: "" },
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    selections: { type: selectionSchema, required: true },
    impact: { type: impactSchema, required: true },
    impactFingerprint: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "initiator_otp_pending",
        "pending_approval",
        "approval_otp_pending",
        "executing",
        "completed",
        "rejected",
        "expired",
        "stale",
        "failed",
      ],
      default: "initiator_otp_pending",
      index: true,
    },

    initiatorOtpHash: { type: String, default: "", select: false },
    initiatorOtpExpiresAt: { type: Date, default: null, select: false },
    initiatorOtpAttempts: { type: Number, default: 0, select: false },
    initiatorVerifiedAt: { type: Date, default: null },

    approver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    approverOtpHash: { type: String, default: "", select: false },
    approverOtpExpiresAt: { type: Date, default: null, select: false },
    approverOtpAttempts: { type: Number, default: 0, select: false },
    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },

    approvalDeadline: { type: Date, default: null, index: true },
    completedAt: { type: Date, default: null },
    failureReason: { type: String, default: "" },
    result: { type: resultSchema, default: undefined },
  },
  { timestamps: true },
);

deletionRequestSchema.index({ entityId: 1, entityModel: 1, status: 1, createdAt: -1 });
deletionRequestSchema.index({ requestedBy: 1, createdAt: -1 });

export default model("DeletionRequest", deletionRequestSchema);
