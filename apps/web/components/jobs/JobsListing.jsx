import Link from "next/link";
import MobileJobsFilters from "./MobileJobsFilters";
import JobAlertButton from "./JobAlertButton";
import JobsHeroSearch from "./JobsHeroSearch";
import JobResults from "./JobResults";
import JobCountryTabs from "./JobCountryTabs";
import { GULF_HUB, fetchJobs, fetchJobTaxonomy, jobCountryBySlug } from "@/lib/jobs";
import { BarChart3, Briefcase, Code2, BookmarkCheck } from "lucide-react";

/** Shared look for the hero shortcut pills (JobAlertButton mirrors it); never truncates its label. */
const SHORTCUT_PILL =
  "inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border border-blue-500/20 bg-white/95 px-3.5 text-xs font-bold text-blue-600 shadow-xs transition hover:border-blue-400 hover:bg-blue-50 dark:bg-zinc-900 dark:text-blue-400 dark:hover:bg-blue-950/40";

/** Format exact count to rounded badge like 2,500+, 3,000+, 3,500+ */
function formatRoundedCount(count = 0) {
  if (!count || count <= 0) return "1,000+";
  if (count < 100) return count.toString();
  if (count < 500) return `${Math.floor(count / 100) * 100}+`;
  const rounded = Math.floor(count / 500) * 500;
  return `${rounded.toLocaleString("en-AE")}+`;
}

/**
 * Which part of the Gulf a listing covers. The main /jobs, category and tech pages stay UAE-only so their
 * wording and rankings are unchanged; /jobs/country/<slug> pages cover one country or "gulf" (all).
 * Location pages span whichever country the city is in, so they have no country scope.
 */
function resolveScope(fixed = {}) {
  if (fixed.country === GULF_HUB.slug) return { slug: GULF_HUB.slug, name: GULF_HUB.name, label: "Gulf", code: null, api: GULF_HUB.slug };
  const country = jobCountryBySlug(fixed.country) || (fixed.location ? null : jobCountryBySlug("uae"));
  if (!country) return { slug: null, name: "the Gulf", label: "Gulf", code: null, api: undefined };
  return { slug: country.slug, name: country.slug === "uae" ? "the UAE" : country.name, label: country.label, code: country.code, api: country.slug };
}

const withoutCountry = (params = {}) => Object.fromEntries(Object.entries(params).filter(([key]) => key !== "country"));

/** Build a contextual heading from active search params */
function buildHeading({ searchParams = {}, totalCount = 0, placeName = "the UAE" }) {
  const parts = [];
  if (searchParams.category)
    parts.push(searchParams.category.replace(/-/g, " "));
  if (searchParams.location) parts.push(`in ${searchParams.location}`);
  if (searchParams.workMode)
    parts.push(`· ${searchParams.workMode.replace(/-/g, " ")}`);

  const countStr = totalCount > 0 ? formatRoundedCount(totalCount) : null;

  if (parts.length === 0) {
    return countStr
      ? `${countStr} verified jobs in ${placeName}.`
      : `${placeName === "the UAE" ? "UAE" : placeName} Jobs, Curated Daily.`;
  }
  return countStr
    ? `${countStr} ${parts.join(" ")} jobs.`
    : `${parts.join(" ")} jobs in ${placeName}.`;
}

function buildSubtitle({ searchParams = {}, taxonomy = {}, scope = {} }) {
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
  const places = scope.code === "AE" ? "emirates & locations" : "cities & locations";
  const fallbackPlaces = scope.code === "AE" ? "all seven emirates" : scope.name || "the Gulf";
  return `${categoryCount > 0 ? `${categoryCount} categories` : "Roles"} across ${locationCount > 0 ? `${locationCount} ${places}` : fallbackPlaces} — reviewed, verified, and updated daily by asif.to.`;
}

export default async function JobsListing({
  searchParams = {},
  fixed = {},
  heading,
  intro,
  path = "/jobs",
}) {
  const scope = resolveScope(fixed);
  // `country` reaches the API only through the scope, never from a stray ?country= in the address bar.
  const visitorParams = withoutCountry(searchParams);
  const params = {
    ...visitorParams,
    ...fixed,
    country: scope.api,
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
  const fullTaxonomy = taxonomyResult?.data || {};
  // Location choices and counts follow the scope, so the UAE page does not offer Riyadh and vice versa.
  const taxonomy = scope.code
    ? { ...fullTaxonomy, locations: (fullTaxonomy.locations || []).filter((location) => !location.country || location.country === scope.code) }
    : fullTaxonomy;
  const fixedFilters = withoutCountry(fixed);

  const dynamicHeading =
    heading ||
    buildHeading({
      searchParams: { ...visitorParams, ...fixedFilters },
      totalCount: pagination.totalCount,
      placeName: scope.name,
    });
  const dynamicSubtitle =
    intro ||
    buildSubtitle({ searchParams: { ...visitorParams, ...fixedFilters }, taxonomy, scope });

  return (
    <>
      {/* Hero Header Card with exact section banner gradient & border aesthetic */}
      <section className="px-4 pt-20 pb-2 sm:px-6 sm:pt-24 sm:pb-4">
        <div className="mx-auto max-w-7xl">
          <div className="relative rounded-4xl sm:rounded-[2.5rem] bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-sky-500/10 p-5 xs:p-6 sm:p-8 border border-blue-500/15 dark:border-blue-500/20 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-zinc-900/90 shadow-sm min-w-0 overflow-hidden">
            {/* Top Right Expanding Search */}
            <JobsHeroSearch fixed={fixed} />

            <div className="relative z-10">
              {/* Header Title Section with right padding to clear bell icon */}
              <div className="pr-14 sm:pr-16">
                {/* Eyebrow Label */}
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.18em]">
                    {scope.label} Jobs Directory
                  </span>
                </div>

                {/* Dynamic Heading */}
                <h1 className="font-outfit mt-1.5 text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white capitalize leading-tight">
                  {dynamicHeading}
                </h1>

                {/* Subtitle */}
                <p className="mt-1.5 max-w-2xl line-clamp-2 text-xs sm:line-clamp-none sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {dynamicSubtitle}
                </p>
              </div>

              {/* Shortcuts: one scrolling row on phones so every label stays fully readable; wraps from sm up. */}
              <div className="mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none xs:-mx-6 xs:px-6 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                <JobAlertButton
                  criteria={{ ...visitorParams, ...fixedFilters }}
                  taxonomy={taxonomy}
                />
                <Link href="/jobs/my" className={SHORTCUT_PILL}>
                  <BookmarkCheck className="h-3.5 w-3.5 shrink-0" />
                  Saved jobs
                </Link>
                <Link href="/jobs/tech" className={SHORTCUT_PILL}>
                  <Code2 className="h-3.5 w-3.5 shrink-0" />
                  Tech jobs
                </Link>
                <Link href="/jobs/salaries" className={SHORTCUT_PILL}>
                  <BarChart3 className="h-3.5 w-3.5 shrink-0" />
                  Salaries
                </Link>
              </div>

              <JobCountryTabs countries={fullTaxonomy.countries} activeSlug={scope.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Jobs Listing & Filters Grid */}
      <main className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-4 lg:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[300px_1fr] lg:py-8 min-w-0 overflow-x-clip">
        <aside className="min-w-0 max-w-full lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto scrollbar-none pr-0.5">
          <MobileJobsFilters
            values={searchParams}
            taxonomy={taxonomy}
            fixed={fixed}
          />
        </aside>
        <JobResults
          key={JSON.stringify({ searchParams, fixed })}
          jobs={jobs}
          pagination={pagination}
          meta={result?.meta}
          tags={taxonomy.tags}
          skills={fixed.track === "tech" ? taxonomy.techSkills : []}
          searchParams={searchParams}
          queryParams={{ ...visitorParams, ...fixedFilters, ...(scope.api ? { country: scope.api } : {}) }}
          path={path}
        />
      </main>
    </>
  );
}
