import AnalyticsSync from "../models/AnalyticsSync.js";
import {
  isSearchConsoleConfigured,
  syncSearchConsole,
} from "./searchConsole.service.js";

const CHECK_INTERVAL_MS = 60 * 60 * 1000;
const MIN_HOURS_BETWEEN_SYNCS = 20;
// A "syncing" state older than this is a crashed run, not a live one.
const STALE_SYNC_MS = 2 * 60 * 60 * 1000;

let timer = null;
let running = false;

/** Pure decision helper so the cadence is testable without a database. */
export function shouldRunSync(sync, now = Date.now()) {
  if (!sync) return true;
  if (sync.status === "syncing") {
    const started = sync.lastStartedAt ? new Date(sync.lastStartedAt).getTime() : 0;
    return now - started > STALE_SYNC_MS;
  }
  if (!sync.lastSyncedAt) return true;
  return now - new Date(sync.lastSyncedAt).getTime() >= MIN_HOURS_BETWEEN_SYNCS * 3600000;
}

export async function runScheduledSearchConsoleSync() {
  if (running) return;
  running = true;
  try {
    const sync = await AnalyticsSync.findOne({ provider: "search-console" }).lean();
    if (!shouldRunSync(sync)) return;
    if (sync?.status === "syncing") {
      await AnalyticsSync.updateOne({ provider: "search-console" }, { $set: { status: "error", error: "Previous sync did not finish" } });
    }
    const result = await syncSearchConsole();
    console.log(`[GSC SCHEDULER] synced ${result.rowsSynced} rows through ${result.syncedThrough.toISOString().slice(0, 10)}`);
  } catch (error) {
    console.error("[GSC SCHEDULER]", error?.message || error);
  } finally {
    running = false;
  }
}

/** Opt-in: requires GSC_SYNC_ENABLED=true and configured credentials. */
export function startSearchConsoleScheduler() {
  if (timer) return;
  if (process.env.GSC_SYNC_ENABLED !== "true") return;
  if (!isSearchConsoleConfigured()) {
    console.warn("[GSC SCHEDULER] GSC_SYNC_ENABLED is true but Search Console is not configured");
    return;
  }
  timer = setInterval(runScheduledSearchConsoleSync, CHECK_INTERVAL_MS);
  timer.unref?.();
  // Catch up shortly after boot instead of waiting a full interval.
  setTimeout(runScheduledSearchConsoleSync, 30 * 1000).unref?.();
  console.log("[GSC SCHEDULER] enabled (checks hourly, syncs about once a day)");
}
