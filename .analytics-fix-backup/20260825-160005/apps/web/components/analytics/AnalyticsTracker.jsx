"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;
const ATTRIBUTION_KEY = "asif_session_attribution";

const id = (key, session = false) => {
  const store = session ? sessionStorage : localStorage;
  let value = store.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    store.setItem(key, value);
  }

  return value;
};

const isLocalhost = () => {
  if (typeof window === "undefined") return true;

  const hostname = window.location.hostname;

  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".local")
  );
};

function safeDomain(value = "") {
  if (!value) return "";

  try {
    return new URL(value).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return "";
  }
}

function initialAttribution(pathname, searchParams) {
  const existing = sessionStorage.getItem(ATTRIBUTION_KEY);

  if (existing) {
    try {
      return JSON.parse(existing);
    } catch {
      sessionStorage.removeItem(ATTRIBUTION_KEY);
    }
  }

  const params = new URLSearchParams(searchParams.toString());
  const referrer = document.referrer || "";
  const referrerDomain = safeDomain(referrer);

  const attribution = {
    landingPath: pathname || "/",
    referrer,
    referrerDomain,

    utmSource: params.get("utm_source") || "",
    utmMedium: params.get("utm_medium") || "",
    utmCampaign: params.get("utm_campaign") || "",

    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language:
      navigator.language ||
      navigator.languages?.[0] ||
      "",
  };

  sessionStorage.setItem(
    ATTRIBUTION_KEY,
    JSON.stringify(attribution),
  );

  return attribution;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    if (
      isLocalhost() ||
      !API ||
      navigator.doNotTrack === "1"
    ) {
      return;
    }

    const started = Date.now();
    const width = window.innerWidth;
    const attribution = initialAttribution(
      pathname,
      search,
    );

    const payload = {
      path: pathname || "/",
      visitorId: id("asif_visitor_id"),
      sessionId: id("asif_session_id", true),

      device:
        width < 768
          ? "mobile"
          : width < 1024
            ? "tablet"
            : "desktop",

      ...attribution,
    };

    fetch(`${API}/analytics/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        event: "pageview",
      }),
      keepalive: true,
    }).catch(() => {});

    return () => {
      const engagementMs = Math.min(
        Date.now() - started,
        30 * 60 * 1000,
      );

      const body = JSON.stringify({
        ...payload,
        event: "engagement",
        engagementMs,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API}/analytics/visit`,
          new Blob([body], {
            type: "application/json",
          }),
        );
      } else {
        fetch(`${API}/analytics/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    };
  }, [pathname, search]);

  return null;
}
