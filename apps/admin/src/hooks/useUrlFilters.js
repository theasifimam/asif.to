"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Keeps listing state in the URL so a detail/edit round trip can restore it.
// Only values that differ from the defaults are written to keep URLs readable.
export function useUrlFilters(defaults) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const defaultsRef = useRef(defaults);
  const stableDefaults = defaultsRef.current;
  const [filters, setFilters] = useState(() => {
    const next = { ...stableDefaults };
    Object.keys(stableDefaults).forEach((key) => {
      const value = searchParams?.get(key);
      if (value !== null) next[key] = value;
    });
    return next;
  });

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.keys(stableDefaults).forEach((key) => {
      params.delete(key);
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value) !== String(stableDefaults[key]) && String(value) !== "") {
        params.set(key, String(value));
      }
    });
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, pathname, router, stableDefaults, searchParams]);

  return [filters, setFilters];
}

export function listingReturnTo(pathname, searchParams) {
  const query = searchParams?.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
