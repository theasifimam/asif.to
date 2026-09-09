import { Schema, model } from "mongoose";
import { SOURCE_TYPES, SOURCE_VERIFICATION_STATUSES } from "../constants/jobs.js";

const jobSourceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    type: { type: String, enum: SOURCE_TYPES, required: true, default: "manual", index: true },
    providerOrganizationId: { type: String, default: "", trim: true, maxlength: 300 },
    providerRegion: { type: String, enum: ["global", "eu"], default: "global" },
    baseUrl: { type: String, default: "", trim: true },
    careersUrl: { type: String, default: "", trim: true },
    endpointUrl: { type: String, default: "", trim: true },
    jobsPath: { type: String, default: "", trim: true, maxlength: 200 },
    fieldMapping: { type: Schema.Types.Mixed, default: {} },
    credentialEnvKey: { type: String, default: "", trim: true, maxlength: 100 },
    enabled: { type: Boolean, default: true, index: true },
    autoPublish: { type: Boolean, default: false, index: true },
    trusted: { type: Boolean, default: false },
    qualityThreshold: { type: Number, default: 90, min: 50, max: 100 },
    syncIntervalHours: { type: Number, default: 12, min: 6, max: 168 },
    syncFrequency: { type: String, enum: ["manual", "hourly", "daily", "weekly"], default: "manual" },
    lastSyncAt: Date,
    lastSuccessfulSyncAt: Date,
    nextSyncAt: { type: Date, default: null, index: true },
    availabilityStatus: { type: String, enum: ["available", "unavailable", "misconfigured"], default: "available" },
    verificationStatus: { type: String, enum: SOURCE_VERIFICATION_STATUSES, default: "Requires Review", index: true },
    lastVerifiedAt: { type: Date, default: null },
    verificationNotes: { type: String, default: "", maxlength: 2000 },
    verifiedJobsFound: { type: Number, default: 0, min: 0 },
    verifiedUaeJobsFound: { type: Number, default: 0, min: 0 },
    lastError: { type: String, default: "", maxlength: 2000 },
    syncStatus: { type: String, enum: ["idle", "running", "success", "failed"], default: "idle", index: true },
    numberImported: { type: Number, default: 0, min: 0 },
    numberUpdated: { type: Number, default: 0, min: 0 },
    numberRejected: { type: Number, default: 0, min: 0 },
    numberDuplicates: { type: Number, default: 0, min: 0 },
    numberUnchanged: { type: Number, default: 0, min: 0 },
    lastRunImported: { type: Number, default: 0, min: 0 },
    lastRunUpdated: { type: Number, default: 0, min: 0 },
    lastRunRejected: { type: Number, default: 0, min: 0 },
    lastRunDuplicates: { type: Number, default: 0, min: 0 },
    lastRunUnchanged: { type: Number, default: 0, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

jobSourceSchema.index({ enabled: 1, syncFrequency: 1, lastSyncAt: 1 });
jobSourceSchema.index({ enabled: 1, nextSyncAt: 1, syncStatus: 1 });
jobSourceSchema.index({ verificationStatus: 1, type: 1 });

export default model("JobSource", jobSourceSchema);
