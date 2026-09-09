import { Schema, model } from "mongoose";
import { INTERNAL_APPLICATION_STATUSES } from "../constants/jobs.js";

const jobApplicationSchema = new Schema(
  {
    kind: { type: String, enum: ["internal", "external_click"], required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    fullName: { type: String, default: "", trim: true, maxlength: 180 },
    email: { type: String, default: "", trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    coverMessage: { type: String, default: "", maxlength: 5000 },
    resume: {
      storageKey: { type: String, default: "" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      size: { type: Number, default: 0 },
    },
    status: { type: String, enum: INTERNAL_APPLICATION_STATUSES, default: "submitted", index: true },
    sourceName: { type: String, default: "", maxlength: 160 },
    redirectUrl: { type: String, default: "" },
    appliedAt: { type: Date, default: Date.now, index: true },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

jobApplicationSchema.index(
  { user: 1, job: 1, kind: 1 },
  { unique: true, partialFilterExpression: { kind: "internal" } },
);
jobApplicationSchema.index({ kind: 1, status: 1, appliedAt: -1 });

export default model("JobApplication", jobApplicationSchema);

