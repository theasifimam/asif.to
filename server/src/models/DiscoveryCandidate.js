import { Schema, model } from "mongoose";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DISCOVERY_STATUSES = [
  "discovered",    // Just found, not yet verified
  "verifying",     // Verification in progress
  "verified",      // Verified UAE jobs exist; ready to become a JobSource
  "created",       // Company + JobSource have been created
  "no_uae_jobs",   // Source reachable but no UAE jobs at this time
  "requires_review", // Provider unknown or ambiguous; admin decision needed
  "rejected",      // Explicitly rejected by admin
  "blocked",       // Provider returned 401/403; no point retrying soon
  "failed",        // Verification failed; will retry with backoff
];

export const DISCOVERY_METHODS = [
  "existing_job",        // Extracted from a job already ingested by the system
  "ats_discovery",       // Discovered via a known ATS provider's public list
  "career_page",         // Company career page inspection
  "existing_source",     // Derived from signal on an existing JobSource
  "other",               // Fallback
];

// ─── Schema ──────────────────────────────────────────────────────────────────

const confidenceReasonSchema = new Schema({
  code: { type: String, required: true, maxlength: 80 },
  label: { type: String, required: true, maxlength: 200 },
  points: { type: Number, required: true },
}, { _id: false });

const discoveryCandidateSchema = new Schema(
  {
    // ── Company identity ───────────────────────────────────────────────────
    companyName: { type: String, required: true, trim: true, maxlength: 180 },
    normalizedCompanyName: { type: String, default: "", trim: true, maxlength: 180 },

    // ── Domain / URL signals ───────────────────────────────────────────────
    domain: { type: String, default: "", trim: true, lowercase: true, maxlength: 253, index: true },
    careersUrl: { type: String, default: "", trim: true, maxlength: 2048 },

    // ── ATS detection ─────────────────────────────────────────────────────
    detectedProvider: {
      type: String,
      enum: ["greenhouse", "lever", "smartrecruiters", "workable", "ashby", "recruitee", "pinpoint", "teamtailor", "employer-career-page", "api", "other", "unknown"],
      default: "unknown",
      index: true,
    },
    providerOrganizationId: { type: String, default: "", trim: true, maxlength: 300 },
    providerRegion: { type: String, enum: ["global", "eu"], default: "global" },
    endpointUrl: { type: String, default: "", trim: true, maxlength: 2048 },

    // ── UAE evidence ───────────────────────────────────────────────────────
    country: { type: String, default: "AE", maxlength: 10 },
    emirate: { type: String, default: "", maxlength: 80 },
    uaeEvidence: { type: [String], default: [] }, // e.g. ["Dubai found in job location", "AE country code"]

    // ── Discovery provenance ───────────────────────────────────────────────
    sourceUrl: { type: String, default: "", trim: true, maxlength: 2048 },
    evidenceUrls: { type: [String], default: [] },
    discoveryMethod: { type: String, enum: DISCOVERY_METHODS, default: "other", index: true },

    // ── Confidence ────────────────────────────────────────────────────────
    confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
    confidenceReasons: { type: [confidenceReasonSchema], default: [] },

    // ── Status / lifecycle ────────────────────────────────────────────────
    status: { type: String, enum: DISCOVERY_STATUSES, default: "discovered", index: true },

    // ── Verification tracking ─────────────────────────────────────────────
    verificationAttempts: { type: Number, default: 0, min: 0 },
    lastError: { type: String, default: "", maxlength: 2000 },
    lastVerifiedAt: { type: Date, default: null },
    nextCheckAt: { type: Date, default: null, index: true },

    // ── Verification result cache ─────────────────────────────────────────
    verifiedJobsFound: { type: Number, default: 0, min: 0 },
    verifiedUaeJobsFound: { type: Number, default: 0, min: 0 },

    // ── Links to created records ──────────────────────────────────────────
    createdCompanyId: { type: Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    createdJobSourceId: { type: Schema.Types.ObjectId, ref: "JobSource", default: null, index: true },

    // ── Admin control ─────────────────────────────────────────────────────
    rejectionReason: { type: String, default: "", maxlength: 500 },
    adminNote: { type: String, default: "", maxlength: 1000 },
  },
  { timestamps: true },
);

// ── Indexes ──────────────────────────────────────────────────────────────────

// Deduplication: provider + org ID is the canonical unique key
discoveryCandidateSchema.index(
  { detectedProvider: 1, providerOrganizationId: 1 },
  { unique: true, partialFilterExpression: { providerOrganizationId: { $type: "string", $gt: "" } } },
);

discoveryCandidateSchema.index({ status: 1, nextCheckAt: 1 });
discoveryCandidateSchema.index({ status: 1, confidenceScore: -1 });
discoveryCandidateSchema.index({ normalizedCompanyName: 1 });
discoveryCandidateSchema.index({ createdAt: -1 });

export default model("DiscoveryCandidate", discoveryCandidateSchema);
