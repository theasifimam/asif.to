"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

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

export default function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialPage = useRef(true);

  useEffect(() => {
    // Skip tracking on localhost and development environments
    if (isLocalhost()) return;

    // The initial page view is sent by gtag('config'). Only send views for
    // subsequent App Router navigations here.
    if (isInitialPage.current) {
      isInitialPage.current = false;
      return;
    }

    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    // Next updates document.title after this effect runs, so reading it
    // immediately reports the previous page's title. Wait for it to settle.
    const timer = setTimeout(() => {
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "page_view", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: pagePath,
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}
