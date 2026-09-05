import { ADS_CONFIG } from "../../config/ads.mjs";
import { getMaxAdsForContent } from "./getMaxAdsForContent.mjs";
import { findRuntimePlacement } from "./runtimePolicy.mjs";

const CONTENT_TYPE_KEYS = {
  article: "article",
  "course-chapter": "course",
  cheatsheet: "cheatsheet",
  "interview-question": "interview",
};

export function normalizePathname(pathname) {
  const withoutQuery = String(pathname || "/").split(/[?#]/, 1)[0];
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, "/");

  return collapsed.length > 1 ? collapsed.replace(/\/+$/, "") : collapsed;
}

export function matchesRoutePrefix(pathname, routePrefix) {
  const path = normalizePathname(pathname);
  const prefix = normalizePathname(routePrefix);

  return path === prefix || path.startsWith(`${prefix}/`);
}

export function isExcludedAdRoute(pathname, config = ADS_CONFIG) {
  const path = normalizePathname(pathname);

  if (
    config.excludedRoutes.some((prefix) => matchesRoutePrefix(path, prefix))
  ) {
    return true;
  }

  // The settings page is nested below a dynamic username route.
  return path === "/settings" || path.endsWith("/settings");
}

/**
 * Pure page-level monetization decision. `hasAdConsent` is tri-state: an
 * explicit false always blocks ads, while undefined delegates regional
 * consent handling to the configured Google CMP.
 */
export function shouldShowAds(
  {
    pathname,
    pageType,
    contentLength,
    placementKey,
    occurrenceIndex = 1,
    isPremium,
    hasAdConsent,
  },
  config = ADS_CONFIG,
) {
  if (!config.enabled || !config.clientId) return false;
  if (hasAdConsent === false || isPremium === true) return false;
  if (isExcludedAdRoute(pathname, config)) return false;

  const normalizedPageType = String(pageType || "").toLowerCase();
  if (!config.monetizablePageTypes.includes(normalizedPageType)) return false;
  const contentTypeKey = CONTENT_TYPE_KEYS[normalizedPageType];
  if (contentTypeKey && config.contentTypes?.[contentTypeKey] === false)
    return false;

  if (placementKey) {
    const placement = findRuntimePlacement(config, placementKey);
    if (
      !placement ||
      !placement.enabled ||
      placement.implementationStatus === "reserved" ||
      !placement.slotId ||
      placement.pageType !== normalizedPageType ||
      Number(contentLength) < Number(placement.minWordCount || 0)
    ) {
      return false;
    }
  }

  const maxAds = getMaxAdsForContent(
    { pageType: normalizedPageType, wordCount: contentLength },
    config,
  );
  return maxAds >= Math.max(1, Number(occurrenceIndex) || 1);
}
