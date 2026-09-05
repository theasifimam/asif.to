"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ADS_CONFIG } from "@/config/ads.mjs";

const MonetizationContext = createContext(null);
const REFRESH_INTERVAL_MS = 30000;

export default function MonetizationProvider({ config, children }) {
  const [runtimeConfig, setRuntimeConfig] = useState(config);

  useEffect(() => {
    const apiUrl = String(process.env.NEXT_PUBLIC_API_URL || "").replace(
      /\/$/,
      "",
    );
    if (!ADS_CONFIG.enabled || !apiUrl) return undefined;

    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch(`${apiUrl}/monetization/public`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("Runtime configuration unavailable");
        const payload = await response.json();
        if (active && payload?.data) setRuntimeConfig(payload.data);
      } catch {
        if (active) {
          setRuntimeConfig((current) => ({
            ...current,
            adsEnabled: false,
            effectiveAdsEnabled: false,
          }));
        }
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return (
    <MonetizationContext.Provider value={runtimeConfig}>
      {children}
    </MonetizationContext.Provider>
  );
}

export function useMonetizationConfig() {
  return useContext(MonetizationContext);
}
