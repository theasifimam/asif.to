import test from "node:test";
import assert from "node:assert/strict";
import {
  afterWindow,
  baselineWindow,
  compareWindows,
  normalizePath,
} from "../services/seoChange.service.js";

test("normalizePath strips origin, query and trailing slash", () => {
  assert.equal(normalizePath("https://asif.to/articles/x/?a=1"), "/articles/x");
  assert.equal(normalizePath("/jobs/"), "/jobs");
  assert.equal(normalizePath("https://asif.to"), "/");
});

test("baselineWindow covers the days before the change", () => {
  const { from, to } = baselineWindow("2026-10-18T15:00:00Z", 28);
  assert.equal(to.toISOString(), "2026-10-18T00:00:00.000Z");
  assert.equal(from.toISOString(), "2026-09-20T00:00:00.000Z");
});

test("afterWindow waits for enough final data and caps at the baseline length", () => {
  const changed = "2026-10-01T10:00:00Z";
  assert.equal(afterWindow(changed, Date.parse("2026-10-08T12:00:00Z")), null);
  const short = afterWindow(changed, Date.parse("2026-10-15T12:00:00Z"));
  assert.equal(short.from.toISOString(), "2026-10-02T00:00:00.000Z");
  assert.equal(short.days, 11);
  const long = afterWindow(changed, Date.parse("2026-12-15T12:00:00Z"));
  assert.equal(long.days, 28);
});

test("compareWindows compares per-day rates and ignores position without data", () => {
  const result = compareWindows(
    { clicks: 28, impressions: 280, ctr: 10, position: 9 },
    { clicks: 22, impressions: 330, ctr: 6.7, position: 7 },
    28,
    11,
  );
  assert.equal(Math.round(result.clicksPerDayChangePct), 100);
  assert.equal(Math.round(result.impressionsPerDayChangePct), 200);
  assert.equal(result.positionChange, -2);
  assert.equal(
    compareWindows({ clicks: 0, impressions: 0, ctr: 0, position: 0 }, { clicks: 1, impressions: 5, ctr: 20, position: 3 }, 28, 7).positionChange,
    0,
  );
});
