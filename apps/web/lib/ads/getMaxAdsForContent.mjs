import { ADS_CONFIG } from "../../config/ads.mjs";

/**
 * Returns the density allowance capped by the configured page-type limit.
 * `wordCount` is intentionally supplied by the page/content layer.
 */
export function getMaxAdsForContent(
  { pageType, wordCount },
  config = ADS_CONFIG,
) {
  const normalizedPageType = String(pageType || "").toLowerCase();
  const normalizedWordCount = Number(wordCount);
  const pageLimit = config.limits?.[normalizedPageType];

  if (
    !config.monetizablePageTypes?.includes(normalizedPageType) ||
    !Number.isFinite(normalizedWordCount) ||
    normalizedWordCount < 0 ||
    !Number.isFinite(pageLimit) ||
    pageLimit <= 0
  ) {
    return 0;
  }

  const densityLimit = config.contentThresholds.reduce(
    (currentLimit, { minWords, maxAds }) =>
      normalizedWordCount >= minWords
        ? Math.max(currentLimit, maxAds)
        : currentLimit,
    0,
  );

  return densityLimit ? Math.min(densityLimit, pageLimit) : 0;
}
