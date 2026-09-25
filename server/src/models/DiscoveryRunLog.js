import { Schema, model } from "mongoose";

// A structured log for each automated discovery run.
const discoveryRunLogSchema = new Schema(
  {
    runId: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    trigger: { type: String, enum: ["scheduled", "manual"], default: "scheduled" },
    status: { type: String, enum: ["running", "success", "partial", "failed"], default: "running", index: true },
    startedAt: { type: Date, default: Date.now, index: true },
    completedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },

    // Counts produced by this run
    candidatesDiscovered: { type: Number, default: 0 },
    candidatesVerified: { type: Number, default: 0 },
    companiesCreated: { type: Number, default: 0 },
    sourcesCreated: { type: Number, default: 0 },
    jobsImported: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
    skippedDuplicates: { type: Number, default: 0 },

    // Structured error list (capped at 50)
    errors: {
      type: [{
        candidateName: { type: String, maxlength: 180 },
        code: { type: String, maxlength: 80 },
        message: { type: String, maxlength: 1000 },
      }],
      default: [],
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

discoveryRunLogSchema.index({ startedAt: -1 });

export default model("DiscoveryRunLog", discoveryRunLogSchema);
