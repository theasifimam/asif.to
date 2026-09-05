"use client";

import { usePathname } from "next/navigation";
import { ADS_CONFIG } from "@/config/ads.mjs";
import {
  createAdsPolicyConfig,
  findRuntimePlacement,
} from "@/lib/ads/runtimePolicy.mjs";
import { shouldShowAds } from "@/lib/ads/shouldShowAds.mjs";
import AdSlot from "./AdSlot";
import { useMonetizationConfig } from "./MonetizationProvider";

export default function MonetizationSlot({
  placementKey,
  pageType,
  wordCount,
  occurrenceIndex = 1,
  className,
  hasAdConsent,
  isPremium,
}) {
  const pathname = usePathname();
  const runtimeConfig = useMonetizationConfig();
  const policy = createAdsPolicyConfig(runtimeConfig || {}, ADS_CONFIG);
  const placement = findRuntimePlacement(policy, placementKey);

  if (
    !placement ||
    placement.provider !== "adsense" ||
    !shouldShowAds(
      {
        pathname,
        pageType,
        contentLength: wordCount,
        placementKey,
        occurrenceIndex,
        isPremium,
        hasAdConsent,
      },
      policy,
    )
  ) {
    return null;
  }

  return (
    <AdSlot
      slot={placement.slotId}
      placement={placement.key}
      className={className}
      hasAdConsent={hasAdConsent}
      clientId={policy.clientId}
      adsEnabled={policy.enabled}
      safetyDistancePx={policy.safetyDistancePx}
    />
  );
}
