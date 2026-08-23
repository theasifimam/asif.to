"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SUB_TABS = ["published", "drafts", "roles", "activity", "invitations"];

export function getModuleKey(pathname) {
  if (!pathname || pathname === "/") return "";
  const parts = pathname.split("/").filter(Boolean);
  return parts[0] || "";
}

export function isSubRoute(pathname) {
  if (!pathname) return false;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return false;
  
  const lastSegment = segments[segments.length - 1];
  if (lastSegment === "new" || lastSegment === "edit") return true;
  
  if (segments.length >= 2) {
    if (!SUB_TABS.includes(lastSegment)) {
      return true;
    }
  }
  return false;
}

export function getModuleBackUrl(moduleRoot, requestedReturnTo) {
  if (
    requestedReturnTo &&
    typeof requestedReturnTo === "string" &&
    requestedReturnTo.startsWith("/") &&
    requestedReturnTo !== moduleRoot &&
    (requestedReturnTo.includes("?") || requestedReturnTo.split("/").filter(Boolean).length > moduleRoot.split("/").filter(Boolean).length)
  ) {
    return requestedReturnTo;
  }

  if (typeof window !== "undefined") {
    try {
      const moduleKey = moduleRoot.replace(/^\//, "").split("/")[0];
      const saved = sessionStorage.getItem(`admin_module_last_url_${moduleKey}`);
      if (saved && saved.startsWith(moduleRoot)) {
        return saved;
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }

  return requestedReturnTo && typeof requestedReturnTo === "string" && requestedReturnTo.startsWith("/")
    ? requestedReturnTo
    : moduleRoot;
}

export function ModuleHistoryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    const moduleKey = getModuleKey(pathname);
    if (!moduleKey) return;

    if (!isSubRoute(pathname)) {
      const query = searchParams?.toString();
      const fullUrl = query ? `${pathname}?${query}` : pathname;
      try {
        sessionStorage.setItem(`admin_module_last_url_${moduleKey}`, fullUrl);
      } catch {
        // Ignore storage failures
      }
    }
  }, [pathname, searchParams]);

  return null;
}
