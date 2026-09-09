import Job from "../../models/Job.js";
import JobSource from "../../models/JobSource.js";
import { syncJobSource } from "./jobImport.service.js";
import { ensureDefaultPublicJobSources } from "./defaultSources.service.js";

export async function expireJobs() {
  return Job.updateMany(
    { status: "published", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } },
  );
}

let timer;

export async function runMaintenance({
  JobModel = Job, JobSourceModel = JobSource, syncSource = syncJobSource,
  ensureSources = ensureDefaultPublicJobSources,
} = {}) {
  await JobModel.updateMany(
    { status: "published", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } },
  );
  if (process.env.JOB_SYNC_ENABLED === "false") return;
  await ensureSources();
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 45 * 60_000);
  const sources = await JobSourceModel.find({
    enabled: true, syncFrequency: { $ne: "manual" },
    $and: [
      { $or: [{ syncStatus: { $ne: "running" } }, { lastSyncAt: null }, { lastSyncAt: { $lt: staleBefore } }] },
      { $or: [{ nextSyncAt: null }, { nextSyncAt: { $exists: false } }, { nextSyncAt: { $lte: now } }] },
    ],
  });
  for (const source of sources) {
    try { await syncSource(source._id, { trigger: "scheduled" }); }
    catch (error) { console.error(`[JOBS] ${source.name} sync failed:`, error.message); }
  }
}

export function startJobScheduler() {
  if (timer) return;
  runMaintenance().catch((error) => console.error("[JOBS] maintenance failed:", error.message));
  timer = setInterval(() => runMaintenance().catch((error) => console.error("[JOBS] maintenance failed:", error.message)), 15 * 60_000);
  timer.unref();
}
