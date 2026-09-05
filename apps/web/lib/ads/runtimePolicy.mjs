import { ADS_CONFIG } from "../../config/ads.mjs";

export function createAdsPolicyConfig(
  runtimeConfig = {},
  staticConfig = ADS_CONFIG,
) {
  const thresholds = runtimeConfig.contentRules?.thresholds;
  const placements = Array.isArray(runtimeConfig.placements)
    ? runtimeConfig.placements
    : [];
  return {
    ...staticConfig,
    enabled: Boolean(
      staticConfig.enabled &&
      runtimeConfig.environmentMasterEnabled &&
      runtimeConfig.adsEnabled,
    ),
    clientId: runtimeConfig.clientId || staticConfig.clientId || "",
    contentTypes: runtimeConfig.contentTypes || {},
    contentThresholds:
      Array.isArray(thresholds) && thresholds.length
        ? thresholds
        : staticConfig.contentThresholds,
    runtimePlacements: placements,
    safetyDistancePx:
      Number(runtimeConfig.contentRules?.safetyDistancePx) || 240,
  };
}

export function findRuntimePlacement(config, placementKey) {
  const key = String(placementKey || "").toUpperCase();
  return config.runtimePlacements?.find((item) => item.key === key) || null;
}
