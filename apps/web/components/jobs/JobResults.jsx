"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, LoaderCircle, MapPin } from "lucide-react";
import JobCard from "./JobCard";
import JobSort from "./JobSort";

function queryString(params = {}, excluded = []) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && !excluded.includes(key)) query.set(key, String(value));
  }
  return query.toString();
}

function jobHref(slug, searchParams) {
  const query = queryString(searchParams);
  return `/jobs/${slug}${query ? `?${query}` : ""}`;
}

export default function JobResults({
  jobs = [],
  pagination = { page: 1, totalPages: 1, totalCount: 0 },
  searchParams = {},
  path = "/jobs",
  selectedSlug = "",
  compact = false,
  queryParams = searchParams,
}) {
  const [items, setItems] = useState(() => jobs);
  const [currentPage, setCurrentPage] = useState(() => pagination.page || 1);
  const [hasMore, setHasMore] = useState(
    () => (pagination.page || 1) < (pagination.totalPages || 1),
  );
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const sentinel = useRef(null);
  const loadNextPage = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setLoadError("");
    try {
      const params = new URLSearchParams();
      Object.entries(queryParams || {}).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== "" &&
          key !== "page"
        )
          params.set(key, String(value));
      });
      params.set("page", String(currentPage + 1));
      params.set("limit", "15");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs?${params}`,
        { credentials: "include" },
      );
      if (!response.ok) throw new Error("Unable to load more jobs.");
      const result = await response.json();
      const nextItems = result?.data || [];
      setItems((previous) => [
        ...previous,
        ...nextItems.filter(
          (item) => !previous.some((job) => job._id === item._id),
        ),
      ]);
      const nextPagination = result?.pagination || {};
      setCurrentPage(nextPagination.page || currentPage + 1);
      setHasMore(
        (nextPagination.page || currentPage + 1) <
          (nextPagination.totalPages || currentPage + 1),
      );
    } catch (error) {
      setLoadError(error.message || "Unable to load more jobs.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading, queryParams]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadNextPage();
      },
      { rootMargin: "500px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadNextPage]);

  return (
    <section className="min-w-0 max-w-full overflow-x-clip">
      {jobs.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
            <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
            {pagination.totalCount} active{" "}
            {pagination.totalCount === 1 ? "job" : "jobs"}
          </p>
          <JobSort
            currentSort={searchParams.sort}
            searchParams={searchParams}
            path={path}
          />
        </div>
      )}

      <div className="space-y-3 min-w-0 max-w-full">
        {items.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            href={jobHref(job.slug, searchParams)}
            selected={job.slug === selectedSlug}
            compact={compact}
          />
        ))}
      </div>

      {!items.length && (
        <div className="rounded-4xl border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-zinc-700">
          <MapPin className="mx-auto h-8 w-8 text-zinc-300" />
          <h2 className="mt-4 font-outfit text-xl font-black">
            No active jobs match these filters
          </h2>
          <p className="mt-2 text-xs text-zinc-500">
            Try a broader keyword or clear one of the filters.
          </p>
          <Link
            href="/jobs"
            className="mt-5 inline-block text-xs font-black text-blue-600"
          >
            View all UAE jobs
          </Link>
        </div>
      )}

      {hasMore && (
        <div
          ref={sentinel}
          className="flex min-h-16 items-center justify-center"
          aria-live="polite"
        >
          {loading && (
            <LoaderCircle
              className="h-5 w-5 animate-spin text-blue-600"
              aria-label="Loading more jobs"
            />
          )}
          {!loading && loadError && (
            <button
              type="button"
              onClick={loadNextPage}
              className="rounded-full px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            >
              Try again
            </button>
          )}
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="mt-6 text-center text-xs font-medium text-zinc-400">
          You&apos;ve reached the end of the results.
        </p>
      )}
    </section>
  );
}
