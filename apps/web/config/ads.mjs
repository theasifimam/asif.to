export function resolveAdsRuntimeState(env = process.env) {
  const enabled = env.NEXT_PUBLIC_ADS_ENABLED === "true";
  const clientId = env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";
  const testMode = env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true";
  const isProduction = env.NODE_ENV === "production";

  return Object.freeze({
    enabled,
    clientId,
    testMode,
    isProduction,
    canRequestAds: enabled && Boolean(clientId) && isProduction && !testMode,
    showPlaceholders:
      enabled && Boolean(clientId) && (!isProduction || testMode),
  });
}

const runtime = resolveAdsRuntimeState();

/**
 * Central configuration for monetization. Keep provider-specific identifiers
 * here so content components can work with semantic placements instead.
 */
export const ADS_CONFIG = Object.freeze({
  ...runtime,

  excludedRoutes: Object.freeze([
    "/admin",
    "/auth",
    "/login",
    "/register",
    "/signup",
    "/forgot-password",
    "/practice",
    "/playground",
    "/play",
    "/run",
    "/notes",
    "/settings",
    "/account",
    "/dashboard",
    "/search",
  ]),

  monetizablePageTypes: Object.freeze([
    "article",
    "course-chapter",
    "cheatsheet",
    "interview-question",
  ]),

  limits: Object.freeze({
    article: 3,
    "course-chapter": 3,
    cheatsheet: 1,
    "interview-question": 2,
  }),

  contentThresholds: Object.freeze([
    Object.freeze({ minWords: 1500, maxAds: 3 }),
    Object.freeze({ minWords: 700, maxAds: 2 }),
    Object.freeze({ minWords: 400, maxAds: 1 }),
  ]),

  consent: Object.freeze({
    // Consent collection will be configured in AdSense Privacy & messaging.
    provider: "google-cmp",
  }),
});
