import Link from "next/link";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, MapPin } from "lucide-react";
import JobCard from "./JobCard";
import JobSort from "./JobSort";

function queryString(params = {}, excluded = []) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && !excluded.includes(key)) query.set(key, String(value));
  }
  return query.toString();
}

function pageHref(path, params, page) {
  const query = new URLSearchParams(queryString(params, ["page"]));
  if (page > 1) query.set("page", page);
  return `${path}${query.size ? `?${query}` : ""}`;
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
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500">
          <BriefcaseBusiness className="h-4 w-4 text-blue-600" />
          {pagination.totalCount} active {pagination.totalCount === 1 ? "job" : "jobs"}
        </p>
        <JobSort currentSort={searchParams.sort} searchParams={searchParams} path={path} />
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard
            key={job._id}
            job={job}
            href={jobHref(job.slug, searchParams)}
            selected={job.slug === selectedSlug}
            compact={compact}
          />
        ))}
      </div>

      {!jobs.length && (
        <div className="rounded-4xl border border-dashed border-zinc-300 px-6 py-20 text-center dark:border-zinc-700">
          <MapPin className="mx-auto h-8 w-8 text-zinc-300" />
          <h2 className="mt-4 font-outfit text-xl font-black">No active jobs match these filters</h2>
          <p className="mt-2 text-xs text-zinc-500">Try a broader keyword or clear one of the filters.</p>
          <Link href="/jobs" className="mt-5 inline-block text-xs font-black text-blue-600">View all UAE jobs</Link>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between rounded-3xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900" aria-label="Jobs pagination">
          {pagination.page > 1 ? (
            <Link href={pageHref(path, searchParams, pagination.page - 1)} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ArrowLeft className="h-3.5 w-3.5" />Previous
            </Link>
          ) : <span />}
          <span className="text-[11px] font-bold text-zinc-400">Page {pagination.page} of {pagination.totalPages}</span>
          {pagination.page < pagination.totalPages ? (
            <Link href={pageHref(path, searchParams, pagination.page + 1)} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Next<ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : <span />}
        </nav>
      )}
    </section>
  );
}
