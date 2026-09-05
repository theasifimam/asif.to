import assert from "node:assert/strict";
import test from "node:test";
import { resolveAdsRuntimeState } from "../../config/ads.mjs";
import { createAdsPolicyConfig } from "./runtimePolicy.mjs";
import { getMaxAdsForContent } from "./getMaxAdsForContent.mjs";
import {
  isExcludedAdRoute,
  matchesRoutePrefix,
  shouldShowAds,
} from "./shouldShowAds.mjs";

const config = {
  enabled: true,
  clientId: "ca-pub-test",
  excludedRoutes: [
    "/admin",
    "/login",
    "/register",
    "/practice",
    "/playground",
    "/notes",
    "/search",
  ],
  monetizablePageTypes: [
    "article",
    "course-chapter",
    "cheatsheet",
    "interview-question",
  ],
  limits: {
    article: 3,
    "course-chapter": 3,
    cheatsheet: 1,
    "interview-question": 2,
  },
  contentThresholds: [
    { minWords: 1500, maxAds: 3 },
    { minWords: 700, maxAds: 2 },
    { minWords: 400, maxAds: 1 },
  ],
};

test("runtime state never requests real ads in development or test mode", () => {
  const development = resolveAdsRuntimeState({
    NODE_ENV: "development",
    NEXT_PUBLIC_ADS_ENABLED: "true",
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
    NEXT_PUBLIC_ADSENSE_TEST_MODE: "false",
  });
  assert.equal(development.canRequestAds, false);
  assert.equal(development.showPlaceholders, true);

  const testMode = resolveAdsRuntimeState({
    NODE_ENV: "production",
    NEXT_PUBLIC_ADS_ENABLED: "true",
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
    NEXT_PUBLIC_ADSENSE_TEST_MODE: "true",
  });
  assert.equal(testMode.canRequestAds, false);
  assert.equal(testMode.showPlaceholders, true);

  const production = resolveAdsRuntimeState({
    NODE_ENV: "production",
    NEXT_PUBLIC_ADS_ENABLED: "true",
    NEXT_PUBLIC_ADSENSE_CLIENT_ID: "ca-pub-test",
    NEXT_PUBLIC_ADSENSE_TEST_MODE: "false",
  });
  assert.equal(production.canRequestAds, true);
  assert.equal(production.showPlaceholders, false);
});

test("route-prefix matching does not confuse similar route names", () => {
  assert.equal(matchesRoutePrefix("/admin/users", "/admin"), true);
  assert.equal(matchesRoutePrefix("/administrator", "/admin"), false);
  assert.equal(matchesRoutePrefix("/practice/javascript?level=1", "/practice"), true);
});

test("excluded and nested settings routes are blocked", () => {
  for (const pathname of [
    "/admin",
    "/admin/users",
    "/practice",
    "/practice/javascript",
    "/login",
    "/register",
    "/notes",
    "/playground",
    "/search",
    "/asif/settings",
  ]) {
    assert.equal(isExcludedAdRoute(pathname, config), true, pathname);
  }
});

test("global disabled and missing-client states block ads", () => {
  const page = { pathname: "/articles/example", pageType: "article", contentLength: 900 };
  assert.equal(shouldShowAds(page, { ...config, enabled: false }), false);
  assert.equal(shouldShowAds(page, { ...config, clientId: "" }), false);
});

test("database, content-type, and placement switches all gate eligibility", () => {
  const staticConfig = { ...config, enabled: true, clientId: "ca-pub-test" };
  const runtime = {
    environmentMasterEnabled: true,
    adsEnabled: true,
    clientId: "ca-pub-test",
    contentTypes: { article: true },
    contentRules: { thresholds: config.contentThresholds, safetyDistancePx: 240 },
    placements: [
      {
        key: "ARTICLE_BOTTOM",
        enabled: true,
        slotId: "1234567890",
        pageType: "article",
        minWordCount: 400,
      },
    ],
  };
  const page = {
    pathname: "/articles/example",
    pageType: "article",
    contentLength: 900,
    placementKey: "ARTICLE_BOTTOM",
  };

  assert.equal(
    shouldShowAds(page, createAdsPolicyConfig(runtime, staticConfig)),
    true,
  );
  assert.equal(
    shouldShowAds(
      page,
      createAdsPolicyConfig({ ...runtime, adsEnabled: false }, staticConfig),
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      page,
      createAdsPolicyConfig(
        { ...runtime, contentTypes: { article: false } },
        staticConfig,
      ),
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      page,
      createAdsPolicyConfig(
        {
          ...runtime,
          placements: [{ ...runtime.placements[0], enabled: false }],
        },
        staticConfig,
      ),
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      page,
      createAdsPolicyConfig(
        {
          ...runtime,
          placements: [
            { ...runtime.placements[0], implementationStatus: "reserved" },
          ],
        },
        staticConfig,
      ),
    ),
    false,
  );
});

test("page type, content density, premium, and explicit consent are enforced", () => {
  assert.equal(
    shouldShowAds(
      { pathname: "/articles/short", pageType: "article", contentLength: 200 },
      config,
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      { pathname: "/articles/long", pageType: "article", contentLength: 900 },
      config,
    ),
    true,
  );
  assert.equal(
    shouldShowAds(
      { pathname: "/courses/a/b", pageType: "course-chapter", contentLength: 900 },
      config,
    ),
    true,
  );
  assert.equal(
    shouldShowAds(
      { pathname: "/about", pageType: "marketing", contentLength: 900 },
      config,
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      { pathname: "/articles/long", pageType: "article", contentLength: 900, isPremium: true },
      config,
    ),
    false,
  );
  assert.equal(
    shouldShowAds(
      { pathname: "/articles/long", pageType: "article", contentLength: 900, hasAdConsent: false },
      config,
    ),
    false,
  );
});

test("content thresholds and page caps return the allowed ad count", () => {
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 399 }, config), 0);
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 400 }, config), 1);
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 699 }, config), 1);
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 700 }, config), 2);
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 1499 }, config), 2);
  assert.equal(getMaxAdsForContent({ pageType: "article", wordCount: 1500 }, config), 3);
  assert.equal(getMaxAdsForContent({ pageType: "cheatsheet", wordCount: 1800 }, config), 1);
  assert.equal(getMaxAdsForContent({ pageType: "search", wordCount: 1800 }, config), 0);
});
