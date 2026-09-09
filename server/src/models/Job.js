import { Schema, model } from "mongoose";
import {
  APPLICATION_TYPES, CREATION_ORIGINS, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, IMPORT_STATUSES, JOB_STATUSES, SALARY_PERIODS, SOURCE_TYPES, WORK_MODES,
} from "../constants/jobs.js";

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 220 },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    companyName: { type: String, required: true, trim: true, maxlength: 180 },
    companyLogo: { type: String, default: "", trim: true },
    description: { type: String, required: true, maxlength: 30_000 },
    descriptionHtml: { type: String, default: "", maxlength: 50_000 },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    benefits: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    category: { type: String, required: true, trim: true, maxlength: 120, index: true },
    categorySlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    location: { type: String, required: true, trim: true, maxlength: 160, index: true },
    locationSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    emirate: { type: String, required: true, trim: true, maxlength: 80 },
    country: { type: String, enum: ["AE"], default: "AE", index: true },
    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true, index: true },
    workMode: { type: String, enum: WORK_MODES, required: true, index: true },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS, required: true, index: true },
    originalExperienceText: { type: String, default: "", maxlength: 500 },
    minimumExperience: { type: Number, default: null, min: 0, max: 60 },
    maximumExperience: { type: Number, default: null, min: 0, max: 60 },
    minimumSalary: { type: Number, default: null, min: 0 },
    maximumSalary: { type: Number, default: null, min: 0 },
    salaryCurrency: { type: String, default: "AED", enum: ["AED"], uppercase: true },
    salaryPeriod: { type: String, enum: SALARY_PERIODS, default: "month" },
    salaryVisible: { type: Boolean, default: false, index: true },
    applicationType: { type: String, enum: APPLICATION_TYPES, required: true, default: "external", index: true },
    applicationUrl: { type: String, default: "", trim: true },
    source: { type: Schema.Types.ObjectId, ref: "JobSource", required: true, index: true },
    sourceName: { type: String, required: true, trim: true, maxlength: 160 },
    sourceUrl: { type: String, default: "", trim: true },
    sourceJobId: { type: String, default: "", trim: true, maxlength: 300 },
    sourceProvider: { type: String, enum: SOURCE_TYPES, default: "manual", index: true },
    sourceCompanyId: { type: String, default: "", trim: true, maxlength: 300 },
    creationOrigin: { type: String, enum: CREATION_ORIGINS, default: "admin_created", index: true },
    importStatus: { type: String, enum: IMPORT_STATUSES, default: null, index: true },
    importQualityScore: { type: Number, default: null, min: 0, max: 100 },
    importQualityBreakdown: { type: Schema.Types.Mixed, default: {} },
    duplicateCandidate: { type: Schema.Types.ObjectId, ref: "Job", default: null, index: true },
    duplicateConfidence: { type: Number, default: null, min: 0, max: 1 },
    normalizedApplicationUrl: { type: String, default: "", trim: true },
    fingerprint: { type: String, required: true, index: true },
    postedAt: { type: Date, required: true, default: Date.now, index: true },
    expiresAt: { type: Date, default: null, index: true },
    importedAt: { type: Date, default: null },
    lastSyncedAt: { type: Date, default: null },
    lastSeenAt: { type: Date, default: null },
    sourceRemovedAt: { type: Date, default: null },
    lastImportChangedAt: { type: Date, default: null },
    missingSyncCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: JOB_STATUSES, default: "draft", index: true },
    featured: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false, index: true },
    isDemo: { type: Boolean, default: false, index: true },
    views: { type: Number, default: 0, min: 0 },
    applyClicks: { type: Number, default: 0, min: 0 },
    applicationCount: { type: Number, default: 0, min: 0 },
    overrideFields: { type: [String], default: [] },
    importedData: { type: Schema.Types.Mixed, default: {} },
    seoTitle: { type: String, default: "", maxlength: 180 },
    seoDescription: { type: String, default: "", maxlength: 500 },
    canonicalUrl: { type: String, default: "", maxlength: 500 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

jobSchema.index({ title: "text", companyName: "text", description: "text", skills: "text", category: "text", location: "text" }, { weights: { title: 10, companyName: 6, skills: 5, category: 4, location: 3, description: 1 } });
jobSchema.index({ status: 1, country: 1, featured: -1, postedAt: -1 });
jobSchema.index({ status: 1, locationSlug: 1, postedAt: -1 });
jobSchema.index({ status: 1, categorySlug: 1, postedAt: -1 });
jobSchema.index({ status: 1, company: 1, postedAt: -1 });
jobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true, partialFilterExpression: { sourceJobId: { $type: "string", $gt: "" } } });
jobSchema.index({ normalizedApplicationUrl: 1 }, { partialFilterExpression: { normalizedApplicationUrl: { $type: "string", $gt: "" } } });
jobSchema.index({ creationOrigin: 1, importStatus: 1, lastSyncedAt: -1 });
jobSchema.index({ sourceProvider: 1, sourceCompanyId: 1, sourceJobId: 1 });

export default model("Job", jobSchema);
