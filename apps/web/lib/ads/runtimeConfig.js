import "server-only";

import { ADS_CONFIG } from "@/config/ads.mjs";

export const DISABLED_MONETIZATION_CONFIG = Object.freeze({
  version: 0,
  environmentMasterEnabled: false,
  adsEnabled: false,
  effectiveAdsEnabled: false,
  previewMode: false,
  provider: "adsense",
  clientId: "",
  approvalStatus: "not_configured",
  contentTypes: {
    article: true,
    course: true,
    cheatsheet: true,
    interview: true,
  },
  contentRules: {
    thresholds: [
      { minWords: 0, maxAds: 0 },
      { minWords: 400, maxAds: 1 },
      { minWords: 700, maxAds: 2 },
      { minWords: 1500, maxAds: 3 },
    ],
    safetyDistancePx: 240,
  },
  placements: [],
});

export async function getRuntimeMonetizationConfig() {
  // The build/deployment switch wins without contacting the API.
  if (!ADS_CONFIG.enabled) return DISABLED_MONETIZATION_CONFIG;

  const apiUrl = (
    process.env.AUTH_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");
  if (!apiUrl) return DISABLED_MONETIZATION_CONFIG;

  try {
    const response = await fetch(`${apiUrl}/monetization/public`, {
      next: { revalidate: 5 },
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return DISABLED_MONETIZATION_CONFIG;
    const payload = await response.json();
    return payload?.data || DISABLED_MONETIZATION_CONFIG;
  } catch {
    return DISABLED_MONETIZATION_CONFIG;
  }
}
