import Job from "../../models/Job.js";
import JobSource from "../../models/JobSource.js";
import { syncJobSource } from "./jobImport.service.js";
import { ensureDefaultPublicJobSources } from "./defaultSources.service.js";
import { runDailyJobAlertDigests } from "./jobAlert.service.js";
import { runDiscovery } from "./companyDiscovery.service.js";

// ─── Discovery scheduler state ────────────────────────────────────────────────
let lastDiscoveryRun = null;

const discoveryIntervalMs = () => {
  const hours = parseFloat(process.env.DISCOVERY_INTERVAL_HOURS || "24");
  return Math.max(1, hours) * 3_600_000;
};

export async function runDiscoveryIfDue() {
  if (process.env.DISCOVERY_ENABLED === "false") return;
  const now = Date.now();
  if (lastDiscoveryRun && now - lastDiscoveryRun < discoveryIntervalMs()) return;
  lastDiscoveryRun = now;
  try {
    await runDiscovery({ trigger: "scheduled" });
  } catch (error) {
    console.error("[DISCOVERY] Scheduled run failed:", error.message);
  }
}

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
  runDailyJobAlertDigests().catch((error) => console.error("[JOBS] daily alert digest failed:", error.message));
  // Run discovery on first tick (after a short delay so the server is fully ready)
  setTimeout(() => {
    runDiscoveryIfDue().catch((error) => console.error("[DISCOVERY] initial run failed:", error.message));
  }, 30_000);
  timer = setInterval(() => {
    runMaintenance().catch((error) => console.error("[JOBS] maintenance failed:", error.message));
    runDailyJobAlertDigests().catch((error) => console.error("[JOBS] daily alert digest failed:", error.message));
    // Check every maintenance tick whether discovery is due
    runDiscoveryIfDue().catch((error) => console.error("[DISCOVERY] scheduled run failed:", error.message));
  }, 15 * 60_000);
  timer.unref();
}
