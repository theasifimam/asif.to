import Link from "next/link";
import { GULF_HUB, JOB_COUNTRIES } from "@/lib/jobs";

const hrefFor = (slug) => (slug === "uae" ? "/jobs" : `/jobs/country/${slug}`);

/**
 * One-tap country switch: UAE, each other Gulf country that has live jobs, and an all-Gulf view. It is a
 * horizontally scrolling chip row, so it stays a single line and thumb-reachable on a phone. Plain links,
 * so every country is a crawlable page rather than client-side state.
 */
export default function JobCountryTabs({ countries = [], activeSlug }) {
  const counts = new Map(countries.map((country) => [country.slug, country.count]));
  const visible = JOB_COUNTRIES.filter((country) => country.slug === "uae" || counts.get(country.slug) > 0);
  if (visible.length < 2) return null;
  const total = countries.reduce((sum, country) => sum + (country.count || 0), 0);
  const tabs = [
    ...visible.map((country) => ({ slug: country.slug, label: country.label, count: counts.get(country.slug) })),
    { slug: GULF_HUB.slug, label: GULF_HUB.label, count: total },
  ];
  return (
    <nav aria-label="Country" className="mt-3 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 scrollbar-none xs:-mx-6 xs:px-6 sm:mx-0 sm:px-0">
      {tabs.map((tab) => {
        const active = tab.slug === activeSlug;
        return (
          <Link
            key={tab.slug}
            href={hrefFor(tab.slug)}
            aria-current={active ? "page" : undefined}
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-bold transition ${
              active
                ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                : "border-blue-500/20 bg-white/95 text-zinc-800 hover:border-blue-400 dark:bg-zinc-900 dark:text-zinc-100"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className={active ? "text-white/80" : "text-zinc-400"}>{new Intl.NumberFormat("en").format(tab.count)}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
