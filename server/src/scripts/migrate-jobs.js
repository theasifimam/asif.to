import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import JobEvent from "../models/JobEvent.js";
import JobSource from "../models/JobSource.js";
import JobSyncLog from "../models/JobSyncLog.js";
import RolePermission from "../models/RolePermission.js";
import SavedJob from "../models/SavedJob.js";
import { DEFAULT_ROLE_PERMISSIONS } from "../utils/permissions.js";
import { normalizeCompanyName } from "../services/jobs/jobImport.service.js";
import { ensureDefaultPublicJobSources } from "../services/jobs/defaultSources.service.js";
import { normalizedJobFingerprint } from "../utils/jobValidation.js";

dotenv.config();

async function run() {
  await connectDB();
  await Promise.all([Company.syncIndexes(), Job.syncIndexes(), JobSource.syncIndexes(), JobSyncLog.syncIndexes(), JobApplication.syncIndexes(), SavedJob.syncIndexes(), JobEvent.syncIndexes()]);
  const companies = await Company.find({ $or: [{ normalizedName: "" }, { normalizedName: { $exists: false } }] }).select("name website");
  for (const company of companies) {
    company.normalizedName = normalizeCompanyName(company.name);
    try { company.websiteDomain = company.website ? new URL(company.website).hostname.toLowerCase().replace(/^www\./, "") : ""; } catch { company.websiteDomain = ""; }
    await company.save();
  }
  await Job.updateMany({ creationOrigin: { $exists: false } }, { $set: { creationOrigin: "admin_created", sourceProvider: "manual" } });
  const jobs = await Job.find({}).select("title companyName location employmentType fingerprint");
  for (const job of jobs) {
    const fingerprint = normalizedJobFingerprint(job);
    if (job.fingerprint !== fingerprint) { job.fingerprint = fingerprint; await job.save(); }
  }
  for (const role of ["editor", "admin"]) {
    const jobPermissions = DEFAULT_ROLE_PERMISSIONS[role].filter((permission) => permission.startsWith("job") || permission.startsWith("jobs."));
    await RolePermission.updateOne({ role }, { $addToSet: { permissions: { $each: jobPermissions } } });
  }
  await JobSource.updateOne(
    { slug: "manual" },
    { $setOnInsert: { name: "Manual", slug: "manual", type: "manual", enabled: true, syncFrequency: "manual", autoPublish: false, trusted: true } },
    { upsert: true },
  );
  const defaults = await ensureDefaultPublicJobSources();
  console.log(`Jobs indexes, permissions, manual source, and ${defaults.registered} new public source(s) are ready.`);
  process.exit(0);
}

run().catch((error) => { console.error(error); process.exit(1); });
