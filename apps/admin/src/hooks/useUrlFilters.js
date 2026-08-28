"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Keeps listing state in the URL so a detail/edit round trip can restore it.
// Only values that differ from the defaults are written to keep URLs readable.
function filtersFromParams(searchParams, defaults) {
  const next = { ...defaults };
  Object.keys(defaults).forEach((key) => {
    const value = searchParams?.get(key);
    if (value !== null) next[key] = value;
  });
  return next;
}

function filtersMatch(left, right, defaults) {
  return Object.keys(defaults).every(
    (key) => String(left[key] ?? "") === String(right[key] ?? ""),
  );
}

export function useUrlFilters(defaults, { enabled = true } = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const localUpdateRef = useRef(false);
  const pendingQueryRef = useRef(null);
  const [stableDefaults] = useState(() => defaults);
  const [filters, setFilterState] = useState(() =>
    enabled
      ? filtersFromParams(searchParams, stableDefaults)
      : { ...stableDefaults },
  );

  const setFilters = useCallback(
    (update) => {
      setFilterState((current) => {
        const next = typeof update === "function" ? update(current) : update;
        if (filtersMatch(current, next, stableDefaults)) return current;
        localUpdateRef.current = true;
        return next;
      });
    },
    [stableDefaults],
  );

  useEffect(() => {
    if (!enabled) return;

    const currentQuery = searchParams?.toString() || "";
    if (
      pendingQueryRef.current !== null &&
      currentQuery !== pendingQueryRef.current
    ) {
      return;
    }

    pendingQueryRef.current = null;

    if (!localUpdateRef.current) {
      const next = filtersFromParams(searchParams, stableDefaults);
      if (!filtersMatch(filters, next, stableDefaults)) {
        const timer = window.setTimeout(() => setFilterState(next), 0);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    localUpdateRef.current = false;
    const params = new URLSearchParams(searchParams?.toString() || "");
    Object.keys(stableDefaults).forEach((key) => {
      params.delete(key);
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value) !== String(stableDefaults[key]) &&
        String(value) !== ""
      ) {
        params.set(key, String(value));
      }
    });
    const query = params.toString();
    if (query === currentQuery) return;
    pendingQueryRef.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [enabled, filters, pathname, router, searchParams, stableDefaults]);

  return [filters, setFilters];
}

export function listingReturnTo(pathname, searchParams) {
  const query = searchParams?.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}
