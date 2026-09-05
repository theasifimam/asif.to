import assert from "node:assert/strict";
import test from "node:test";

import MonetizationPlacement from "../models/MonetizationPlacement.js";
import MonetizationSettings from "../models/MonetizationSettings.js";
import { requirePermission } from "../utils/permissions.js";
import { createTimedCache } from "../services/monetization.service.js";
import {
  buildMonetizationRecommendations,
  classifyMonetizablePath,
  summarizeMonetizationTraffic,
} from "../services/monetizationInsights.service.js";

const settings = {
  adsEnabled: true,
  contentTypes: {
    article: true,
    course: true,
    cheatsheet: true,
    interview: true,
  },
};

const articlePlacement = {
  key: "ARTICLE_BOTTOM",
  label: "Article bottom",
  enabled: true,
  slotId: "1234567890",
  pageType: "article",
  maxPerPage: 1,
};

test("monetizable paths are narrowly classified", () => {
  assert.equal(classifyMonetizablePath("/articles/example"), "article");
  assert.equal(
    classifyMonetizablePath("/courses/react/hooks"),
    "course-chapter",
  );
  assert.equal(classifyMonetizablePath("/courses/react/final-exam"), null);
  assert.equal(classifyMonetizablePath("/practice/javascript"), null);
  assert.equal(classifyMonetizablePath("/search?q=react"), null);
});

test("placement validation rejects missing and malformed AdSense slot IDs", async () => {
  const missing = new MonetizationPlacement({
    ...articlePlacement,
    slotId: "",
  });
  await assert.rejects(missing.validate(), /required/i);

  const malformed = new MonetizationPlacement({
    ...articlePlacement,
    slotId: "not-a-slot",
  });
  await assert.rejects(malformed.validate(), /6-20 digits/i);
});

test("provider and density settings reject invalid configuration", async () => {
  const invalidClient = new MonetizationSettings({
    adsense: { clientId: "not-a-publisher" },
  });
  await assert.rejects(invalidClient.validate(), /ca-pub/i);

  const invalidThresholds = new MonetizationSettings({
    contentRules: {
      thresholds: [
        { minWords: 400, maxAds: 1 },
        { minWords: 700, maxAds: 2 },
      ],
    },
  });
  await assert.rejects(invalidThresholds.validate(), /beginning at 0/i);
});

test("traffic eligibility requires an enabled configured placement", () => {
  const rows = [
    {
      date: new Date("2026-09-01"),
      path: "/articles/example",
      device: "mobile",
      pageViews: 120,
      engagementMs: 120000,
    },
    {
      date: new Date("2026-09-01"),
      path: "/practice/javascript",
      device: "mobile",
      pageViews: 80,
      engagementMs: 10000,
    },
  ];
  const enabled = summarizeMonetizationTraffic(rows, settings, [
    articlePlacement,
  ]);
  assert.equal(enabled.pageViews, 200);
  assert.equal(enabled.adEligiblePageViews, 120);
  assert.equal(enabled.estimatedAdOpportunities, 120);

  const disabled = summarizeMonetizationTraffic(rows, settings, [
    { ...articlePlacement, enabled: false },
  ]);
  assert.equal(disabled.adEligiblePageViews, 0);

  const globallyDisabled = summarizeMonetizationTraffic(
    rows,
    { ...settings, adsEnabled: false },
    [articlePlacement],
  );
  assert.equal(globallyDisabled.adEligiblePageViews, 0);

  const contentTypeDisabled = summarizeMonetizationTraffic(
    rows,
    { ...settings, contentTypes: { ...settings.contentTypes, article: false } },
    [articlePlacement],
  );
  assert.equal(contentTypeDisabled.adEligiblePageViews, 0);

  const reserved = summarizeMonetizationTraffic(rows, settings, [
    { ...articlePlacement, implementationStatus: "reserved" },
  ]);
  assert.equal(reserved.adEligiblePageViews, 0);
});

test("timed cache reuses values and clear invalidates immediately", async () => {
  const cache = createTimedCache(60000);
  let calls = 0;
  const load = async () => ++calls;
  assert.equal(await cache.get(load), 1);
  assert.equal(await cache.get(load), 1);
  cache.clear();
  assert.equal(await cache.get(load), 2);

  const concurrentCache = createTimedCache(60000);
  let concurrentCalls = 0;
  const concurrentLoad = async () => {
    concurrentCalls += 1;
    await Promise.resolve();
    return concurrentCalls;
  };
  const values = await Promise.all([
    concurrentCache.get(concurrentLoad),
    concurrentCache.get(concurrentLoad),
    concurrentCache.get(concurrentLoad),
  ]);
  assert.deepEqual(values, [1, 1, 1]);
  assert.equal(concurrentCalls, 1);
});

test("unauthorized users cannot manage monetization", () => {
  let status;
  let payload;
  const response = {
    status(value) {
      status = value;
      return this;
    },
    json(value) {
      payload = value;
    },
  };
  let continued = false;
  requirePermission("monetization.manage")(
    { user: { effectivePermissions: ["monetization.view"] } },
    response,
    () => {
      continued = true;
    },
  );
  assert.equal(status, 403);
  assert.equal(payload.success, false);
  assert.equal(continued, false);
});

test("recommendations cite supplied configuration and traffic data", () => {
  const recommendations = buildMonetizationRecommendations({
    settings,
    placements: [],
    performance: {
      firstParty: {
        pageViews: 200,
        byContentType: { article: 150 },
        byDevice: [{ device: "mobile", pageViews: 150 }],
      },
      adsense: { connected: false },
    },
  });
  assert.ok(
    recommendations.some((item) => item.title.includes("Article traffic")),
  );
  assert.ok(recommendations.some((item) => item.reason.includes("150")));
  assert.ok(
    recommendations.some((item) => item.title === "Most traffic is mobile"),
  );
  assert.ok(
    recommendations.some((item) => item.title.includes("not connected")),
  );
});
