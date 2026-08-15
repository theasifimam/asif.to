"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialPage = useRef(true);

  useEffect(() => {
    // The initial page view is sent by gtag('config'). Only send views for
    // subsequent App Router navigations here.
    if (isInitialPage.current) {
      isInitialPage.current = false;
      return;
    }

    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
    });
  }, [pathname, searchParams]);

  return null;
}
