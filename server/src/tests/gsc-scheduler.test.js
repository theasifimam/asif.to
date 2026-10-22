import test from "node:test";
import assert from "node:assert/strict";
import { shouldRunSync } from "../services/searchConsoleScheduler.service.js";

const HOUR = 3600000;
const now = Date.parse("2026-10-18T12:00:00Z");

test("shouldRunSync runs when there is no sync record or never synced", () => {
  assert.equal(shouldRunSync(null, now), true);
  assert.equal(shouldRunSync({ status: "idle" }, now), true);
});

test("shouldRunSync waits about a day between successful syncs", () => {
  assert.equal(shouldRunSync({ status: "success", lastSyncedAt: new Date(now - 5 * HOUR) }, now), false);
  assert.equal(shouldRunSync({ status: "success", lastSyncedAt: new Date(now - 21 * HOUR) }, now), true);
});

test("shouldRunSync does not interrupt a live sync but recovers a stale one", () => {
  assert.equal(shouldRunSync({ status: "syncing", lastStartedAt: new Date(now - 10 * 60000) }, now), false);
  assert.equal(shouldRunSync({ status: "syncing", lastStartedAt: new Date(now - 3 * HOUR) }, now), true);
});
