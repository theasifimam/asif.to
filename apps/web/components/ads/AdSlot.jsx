"use client";

import { useEffect, useRef, useState } from "react";
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
  clientId = ADS_CONFIG.clientId,
  adsEnabled = ADS_CONFIG.enabled,
  safetyDistancePx = 240,
}) {
  const wrapperRef = useRef(null);
  const adElementRef = useRef(null);
  const initializedRef = useRef(false);
  const [safetyChecked, setSafetyChecked] = useState(false);
  const [safetyBlocked, setSafetyBlocked] = useState(false);
  const isConfigured = Boolean(
    adsEnabled && clientId && slot && hasAdConsent !== false,
  );

  useEffect(() => {
    if (!isConfigured || !wrapperRef.current) return;
    const frame = window.requestAnimationFrame(() => {
      const slotRect = wrapperRef.current?.getBoundingClientRect();
      if (!slotRect) return;
      const selector = [
        "[data-ad-exclusion='true']",
        "form",
        "button",
        "[role='button']",
        ".sp-wrapper",
        ".sandpack",
        "[data-code-play='true']",
      ].join(",");
      const blocked = [...document.querySelectorAll(selector)].some(
        (element) => {
          if (wrapperRef.current?.contains(element)) return false;
          const rect = element.getBoundingClientRect();
          const horizontalOverlap =
            rect.right >= slotRect.left && rect.left <= slotRect.right;
          const verticalDistance = Math.max(
            0,
            slotRect.top - rect.bottom,
            rect.top - slotRect.bottom,
          );
          return horizontalOverlap && verticalDistance < safetyDistancePx;
        },
      );
      setSafetyBlocked(blocked);
      setSafetyChecked(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isConfigured, safetyDistancePx]);

  useEffect(() => {
    if (
      !isConfigured ||
      !safetyChecked ||
      safetyBlocked ||
      !ADS_CONFIG.isProduction ||
      ADS_CONFIG.testMode ||
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
  }, [isConfigured, safetyBlocked, safetyChecked, slot]);

  if (!isConfigured) return null;

  const showPlaceholder = !ADS_CONFIG.isProduction || ADS_CONFIG.testMode;

  return (
    <aside
      ref={wrapperRef}
      aria-label="Advertisement"
      className={cn(
        "my-6 min-h-24 w-full overflow-hidden sm:min-h-28",
        className,
      )}
      data-ad-placement={placement || undefined}
    >
      {safetyChecked && !safetyBlocked && showPlaceholder ? (
        <AdPlaceholder placement={placement} />
      ) : safetyChecked && !safetyBlocked ? (
        <ins
          ref={adElementRef}
          className="adsbygoogle block h-full min-h-24 w-full sm:min-h-28"
          data-ad-client={clientId}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      ) : null}
    </aside>
  );
}
