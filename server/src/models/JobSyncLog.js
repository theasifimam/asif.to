import { Schema, model } from "mongoose";

const countsSchema = new Schema({
  fetched: { type: Number, default: 0 }, created: { type: Number, default: 0 }, updated: { type: Number, default: 0 },
  unchanged: { type: Number, default: 0 }, rejected: { type: Number, default: 0 }, duplicates: { type: Number, default: 0 },
  validationFailed: { type: Number, default: 0 }, sourceRemoved: { type: Number, default: 0 }, errors: { type: Number, default: 0 },
}, { _id: false, suppressReservedKeysWarning: true });

const jobSyncLogSchema = new Schema({
  source: { type: Schema.Types.ObjectId, ref: "JobSource", required: true, index: true },
  sourceName: { type: String, required: true, maxlength: 160 },
  provider: { type: String, required: true, maxlength: 80, index: true },
  trigger: { type: String, enum: ["manual", "scheduled", "test"], default: "scheduled" },
  status: { type: String, enum: ["running", "success", "partial", "failed"], default: "running", index: true },
  startedAt: { type: Date, default: Date.now, index: true }, completedAt: { type: Date, default: null }, durationMs: { type: Number, default: null },
  counts: { type: countsSchema, default: () => ({}) },
  errors: { type: [{ sourceJobId: String, code: String, message: { type: String, maxlength: 1000 } }], default: [] },
}, { timestamps: true, suppressReservedKeysWarning: true });

jobSyncLogSchema.index({ source: 1, startedAt: -1 });
export default model("JobSyncLog", jobSyncLogSchema);
