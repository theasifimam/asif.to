"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ADS_CONFIG } from "@/config/ads.mjs";
import { createAdsPolicyConfig } from "@/lib/ads/runtimePolicy.mjs";
import { isExcludedAdRoute } from "@/lib/ads/shouldShowAds.mjs";
import { useMonetizationConfig } from "./MonetizationProvider";

export default function AdSenseProvider() {
  const pathname = usePathname();
  const runtimeConfig = useMonetizationConfig();
  const policy = createAdsPolicyConfig(runtimeConfig || {}, ADS_CONFIG);
  const clientId = runtimeConfig?.clientId || ADS_CONFIG.clientId;
  const hasActivePlacement = runtimeConfig?.placements?.some(
    (placement) =>
      placement.provider === "adsense" &&
      placement.enabled &&
      placement.implementationStatus !== "reserved" &&
      placement.slotId,
  );
  const canRequestAds = Boolean(
    ADS_CONFIG.enabled &&
    ADS_CONFIG.isProduction &&
    !ADS_CONFIG.testMode &&
    runtimeConfig?.environmentMasterEnabled &&
      runtimeConfig?.adsEnabled &&
      hasActivePlacement &&
      clientId &&
      !isExcludedAdRoute(pathname, policy),
  );
  if (!canRequestAds) return null;

  const src =
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" +
    `?client=${encodeURIComponent(clientId)}`;

  return (
    <Script
      id="google-adsense"
      src={src}
      strategy="afterInteractive"
      crossOrigin="anonymous"
      async
    />
  );
}
