/**
 * AdSense reporting boundary. No reporting dependency or credentials exist in
 * the repository yet, so callers receive an explicit unavailable state rather
 * than fabricated revenue or impression data.
 */
export function getAdSenseReportingStatus() {
  return {
    connected: false,
    provider: "adsense",
    reason: "not_connected",
    message: "AdSense reporting is not connected.",
    metrics: {
      estimatedEarnings: null,
      pageRpm: null,
      impressions: null,
      clicks: null,
      ctr: null,
      cpc: null,
    },
    trend: [],
    byPlacement: [],
    byCountry: [],
    byDevice: [],
  };
}
