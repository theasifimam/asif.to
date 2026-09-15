import Link from "next/link";
import MobileJobsFilters from "./MobileJobsFilters";
import JobResults from "./JobResults";
import JobAlertButton from "./JobAlertButton";
import { fetchJobs, fetchJobTaxonomy } from "@/lib/jobs";
import {
  Briefcase,
  Building2,
  MapPin,
  BookmarkCheck,
} from "lucide-react";

/** Format exact count to rounded badge like 2,500+, 3,000+, 3,500+ */
function formatRoundedCount(count = 0) {
  if (!count || count <= 0) return "1,000+";
  if (count < 100) return count.toString();
  if (count < 500) return `${Math.floor(count / 100) * 100}+`;
  const rounded = Math.floor(count / 500) * 500;
  return `${rounded.toLocaleString("en-AE")}+`;
}

/** Build a contextual heading from active search params */
function buildHeading({ searchParams = {}, totalCount = 0 }) {
  const parts = [];
  if (searchParams.category)
    parts.push(searchParams.category.replace(/-/g, " "));
  if (searchParams.location) parts.push(`in ${searchParams.location}`);
  if (searchParams.workMode)
    parts.push(`· ${searchParams.workMode.replace(/-/g, " ")}`);

  const countStr = totalCount > 0 ? formatRoundedCount(totalCount) : null;

  if (parts.length === 0) {
    return countStr
      ? `${countStr} verified jobs in the UAE.`
      : "UAE Jobs, Curated Daily.";
  }
  return countStr
    ? `${countStr} ${parts.join(" ")} jobs.`
    : `${parts.join(" ")} jobs in the UAE.`;
}

function buildSubtitle({ searchParams = {}, taxonomy = {} }) {
  const hasFilter = Object.values(searchParams).some(Boolean);
  if (hasFilter) {
    const active = [];
    if (searchParams.employmentType)
      active.push(searchParams.employmentType.replace(/-/g, " "));
    if (searchParams.experienceLevel)
      active.push(searchParams.experienceLevel.replace(/-/g, " "));
    if (searchParams.query) active.push(`matching "${searchParams.query}"`);
    return active.length
      ? `Showing ${active.join(", ")} roles. Refine your query using the filters below.`
      : "Filtered results based on your selected criteria.";
  }
  const categoryCount = taxonomy.categories?.length ?? 0;
  const locationCount = taxonomy.locations?.length ?? 0;
  return `${categoryCount > 0 ? `${categoryCount} categories` : "Roles"} across ${locationCount > 0 ? `${locationCount} emirates & locations` : "all seven emirates"} — reviewed, verified, and updated daily by asif.to.`;
}

export default async function JobsListing({
  searchParams = {},
  fixed = {},
  heading,
  intro,
  path = "/jobs",
}) {
  const params = {
    ...searchParams,
    ...fixed,
    page: searchParams.page || 1,
    limit: 15,
  };
  const [result, taxonomyResult] = await Promise.all([
    fetchJobs(params),
    fetchJobTaxonomy(),
  ]);
  const jobs = result?.data || [];
  const pagination = result?.pagination || {
    page: 1,
    totalPages: 1,
    totalCount: 0,
  };
  const taxonomy = taxonomyResult?.data || {};

  const dynamicHeading =
    heading ||
    buildHeading({
      searchParams: { ...searchParams, ...fixed },
      totalCount: pagination.totalCount,
    });
  const dynamicSubtitle =
    intro ||
    buildSubtitle({ searchParams: { ...searchParams, ...fixed }, taxonomy });

  const roundedCountLabel = formatRoundedCount(pagination.totalCount);

  // Quick-stat chips
  const stats = [
    {
      icon: Briefcase,
      label: `${roundedCountLabel} Jobs`,
    },
    taxonomy.locations?.length && {
      icon: MapPin,
      label: `${taxonomy.locations.length} Locations`,
    },
    taxonomy.categories?.length && {
      icon: Building2,
      label: `${taxonomy.categories.length} Categories`,
    },
  ].filter(Boolean);

  return (
    <>
      {/* Hero Header Card with exact section banner gradient & border aesthetic */}
      <section className="px-4 pt-20 pb-2 sm:px-6 sm:pt-24 sm:pb-4">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-sky-500/10 p-5 xs:p-6 sm:p-8 border border-blue-500/15 dark:border-blue-500/20 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-zinc-900/90 shadow-sm min-w-0 overflow-hidden">
            {/* Top Right Notification Bell */}
            <div className="absolute right-4 top-4 z-20 sm:right-7 sm:top-7">
              <JobAlertButton
                taxonomy={taxonomy}
                criteria={{
                  keyword: searchParams.keyword || "",
                  category: fixed.category || searchParams.category || "",
                  location: fixed.location || searchParams.location || "",
                  employmentType: searchParams.employmentType || "",
                  workMode: searchParams.workMode || "",
                  experienceLevel: searchParams.experienceLevel || "",
                }}
              />
            </div>

            <div className="relative z-10">
              {/* Header Title Section with right padding to clear bell icon */}
              <div className="pr-14 sm:pr-16">
                {/* Eyebrow Label */}
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                    UAE Jobs Directory
                  </span>
                </div>

                {/* Dynamic Heading */}
                <h1 className="font-outfit mt-1.5 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white capitalize leading-tight">
                  {dynamicHeading}
                </h1>

                {/* Subtitle */}
                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {dynamicSubtitle}
                </p>
              </div>

              {/* Counts Buttons Row (1 single row on small screens) */}
              {stats.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-1.5 xs:gap-2 w-full sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2">
                  {stats.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="flex min-w-0 items-center justify-center gap-1 xs:gap-1.5 rounded-xl sm:rounded-full border border-blue-500/20 bg-white/95 dark:bg-zinc-900 px-2 py-2 text-[10px] xs:text-xs font-bold text-zinc-800 dark:text-zinc-100 shadow-xs sm:px-3.5 sm:py-2 sm:flex-initial"
                    >
                      <Icon className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="truncate">{label}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Saved Jobs Full Width Action Button */}
              <div className="mt-3 sm:mt-4">
                <Link
                  href="/jobs/my"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-zinc-100 active:scale-[0.99] dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 shadow-xs cursor-pointer"
                >
                  <BookmarkCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>My Saved Jobs &amp; Applications</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Jobs Listing & Filters Grid */}
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[300px_1fr] lg:py-8 min-w-0 overflow-x-clip">
        <aside className="min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start">
          <MobileJobsFilters
            values={searchParams}
            taxonomy={taxonomy}
            fixed={fixed}
          />
        </aside>
        <JobResults
          jobs={jobs}
          pagination={pagination}
          searchParams={searchParams}
          path={path}
        />
      </main>
    </>
  );
}
