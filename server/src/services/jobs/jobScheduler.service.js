import Job from "../../models/Job.js";
import JobSource from "../../models/JobSource.js";
import { syncJobSource } from "./jobImport.service.js";
import { ensureDefaultPublicJobSources } from "./defaultSources.service.js";
import { runDailyJobAlertDigests } from "./jobAlert.service.js";
import { runDiscovery } from "./companyDiscovery.service.js";

// ─── Discovery scheduler state ────────────────────────────────────────────────
let lastDiscoveryRun = null;

const discoveryIntervalMs = () => {
  const hours = parseFloat(process.env.DISCOVERY_INTERVAL_HOURS || "6");
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

const intFromEnv = (name, fallback, min = 1) => {
  const value = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value >= min ? value : fallback;
};

/**
 * Syncs sources through a bounded pool. `perProvider` keeps a burst of boards from one ATS (all behind
 * the same rate limit) from running at once; `deadline` stops starting new work so a tick cannot
 * overrun the next one. Each source failure is isolated and counted, never thrown.
 */
export function syncSourcesWithLimits(sources, syncSource, { concurrency = 6, perProvider = 2, deadline = Infinity, trigger = "scheduled" } = {}) {
  const queue = [...sources];
  const activeByProvider = new Map();
  const result = { synced: 0, failed: 0, deferred: 0 };
  let running = 0;
  const limit = Math.max(1, concurrency); const providerLimit = Math.max(1, perProvider);
  return new Promise((resolve) => {
    const pump = () => {
      while (running < limit && queue.length && Date.now() < deadline) {
        const index = queue.findIndex((source) => (activeByProvider.get(source.type) || 0) < providerLimit);
        if (index === -1) break; // Every queued source belongs to a provider that is at its cap.
        const [source] = queue.splice(index, 1);
        activeByProvider.set(source.type, (activeByProvider.get(source.type) || 0) + 1); running += 1;
        Promise.resolve().then(() => syncSource(source._id, { trigger }))
          .then(() => { result.synced += 1; }, (error) => { result.failed += 1; console.error(`[JOBS] ${source.name} sync failed:`, error.message); })
          .finally(() => { activeByProvider.set(source.type, activeByProvider.get(source.type) - 1); running -= 1; pump(); });
      }
      if (!running && (!queue.length || Date.now() >= deadline)) { result.deferred = queue.length; resolve(result); }
    };
    pump();
  });
}

export async function runMaintenance({
  JobModel = Job, JobSourceModel = JobSource, syncSource = syncJobSource,
  ensureSources = ensureDefaultPublicJobSources,
} = {}) {
  await JobModel.updateMany(
    { status: "published", expiresAt: { $ne: null, $lte: new Date() } },
    { $set: { status: "expired" } },
  );
  // Imported jobs that no sync has seen for a while (their source was disabled or removed)
  // would otherwise stay live forever. Admin-protected statuses are left alone.
  const staleDays = Number(process.env.JOB_STALE_EXPIRY_DAYS ?? 30);
  if (staleDays > 0) {
    await JobModel.updateMany(
      { status: "published", importedAt: { $ne: null }, lastSeenAt: { $ne: null, $lt: new Date(Date.now() - staleDays * 86_400_000) }, overrideFields: { $ne: "status" } },
      { $set: { status: "expired", expiresAt: new Date() } },
    );
  }
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
  // Most overdue first, so a backlog drains fairly instead of always favouring the same boards.
  const dueFirst = [...sources].sort((a, b) => (a.nextSyncAt ? new Date(a.nextSyncAt).getTime() : 0) - (b.nextSyncAt ? new Date(b.nextSyncAt).getTime() : 0));
  const perTick = intFromEnv("JOB_SYNC_MAX_PER_TICK", 300);
  const outcome = await syncSourcesWithLimits(dueFirst.slice(0, perTick), syncSource, {
    concurrency: intFromEnv("JOB_SYNC_CONCURRENCY", 6),
    perProvider: intFromEnv("JOB_SYNC_PER_PROVIDER", 2),
    // Leave a margin so a long tick never collides with the next one.
    deadline: Date.now() + intFromEnv("JOB_SYNC_TICK_MINUTES", 14) * 60_000,
  });
  const deferred = outcome.deferred + Math.max(0, dueFirst.length - perTick);
  if (outcome.synced || outcome.failed || deferred) console.log(`[JOBS] sync tick: ${outcome.synced} synced, ${outcome.failed} failed, ${deferred} deferred to the next tick`);
  return { ...outcome, deferred };
}

// A tick that is still syncing when the next one fires would double the intended concurrency.
let maintenanceInFlight = false;
async function runMaintenanceOnce() {
  if (maintenanceInFlight) return;
  maintenanceInFlight = true;
  try { await runMaintenance(); }
  catch (error) { console.error("[JOBS] maintenance failed:", error.message); }
  finally { maintenanceInFlight = false; }
}

export function startJobScheduler() {
  if (timer) return;
  runMaintenanceOnce();
  runDailyJobAlertDigests().catch((error) => console.error("[JOBS] daily alert digest failed:", error.message));
  // Run discovery on first tick (after a short delay so the server is fully ready)
  setTimeout(() => {
    runDiscoveryIfDue().catch((error) => console.error("[DISCOVERY] initial run failed:", error.message));
  }, 30_000);
  timer = setInterval(() => {
    runMaintenanceOnce();
    runDailyJobAlertDigests().catch((error) => console.error("[JOBS] daily alert digest failed:", error.message));
    // Check every maintenance tick whether discovery is due
    runDiscoveryIfDue().catch((error) => console.error("[DISCOVERY] scheduled run failed:", error.message));
  }, 15 * 60_000);
  timer.unref();
}
