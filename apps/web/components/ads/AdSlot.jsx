"use client";

import { useEffect, useRef } from "react";
import { ADS_CONFIG } from "@/config/ads.mjs";
import { cn } from "@/lib/utils";
import AdPlaceholder from "./AdPlaceholder";

export default function AdSlot({
  slot,
  placement,
  className,
  format = "auto",
  responsive = true,
  hasAdConsent,
}) {
  const adElementRef = useRef(null);
  const initializedRef = useRef(false);
  const isConfigured = Boolean(
    ADS_CONFIG.enabled &&
      ADS_CONFIG.clientId &&
      slot &&
      hasAdConsent !== false,
  );

  useEffect(() => {
    if (
      !isConfigured ||
      !ADS_CONFIG.canRequestAds ||
      initializedRef.current ||
      !adElementRef.current
    ) {
      return;
    }

    // Set before pushing so React Strict Mode cannot initialize this slot twice.
    initializedRef.current = true;

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("AdSense slot initialization was blocked.", error);
      }
    }
  }, [isConfigured, slot]);

  if (!isConfigured) return null;

  if (ADS_CONFIG.showPlaceholders) {
    return <AdPlaceholder placement={placement} className={className} />;
  }

  if (!ADS_CONFIG.canRequestAds) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={cn(
        "my-6 min-h-24 w-full overflow-hidden sm:min-h-28",
        className,
      )}
      data-ad-placement={placement || undefined}
    >
      <ins
        ref={adElementRef}
        className="adsbygoogle block h-full min-h-24 w-full sm:min-h-28"
        data-ad-client={ADS_CONFIG.clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </aside>
  );
}
