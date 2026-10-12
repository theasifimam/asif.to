import { notFound, redirect } from "next/navigation";
import { JOBS_INDEXABLE } from "@/lib/jobsIndexing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";
import { GULF_HUB, fetchJobs, jobCountryBySlug } from "@/lib/jobs";

// /jobs already is the UAE page, so /jobs/country/uae would only duplicate it.
const hubFor = (slug) => (slug === GULF_HUB.slug ? { slug, name: "the Gulf", title: "Gulf Jobs: Saudi Arabia, UAE, Qatar, Kuwait, Bahrain & Oman" } : null);

export async function generateMetadata({ params }) {
  const { country } = await params;
  const hub = hubFor(country);
  const known = hub || jobCountryBySlug(country);
  if (!known || country === "uae") return { title: "Jobs | asif.to", robots: { index: false, follow: true } };
  const name = hub ? hub.name : known.name;
  const result = await fetchJobs({ country, limit: 1 });
  const useful = (result?.meta?.indexableCount || 0) > 0;
  return {
    title: hub ? `${hub.title} | asif.to` : `Jobs in ${name} | asif.to`,
    description: `Browse active jobs in ${name}, updated daily from employer career pages, with work mode, experience and role filters.`,
    alternates: { canonical: `/jobs/country/${country}` },
    robots: { index: JOBS_INDEXABLE && useful, follow: true },
  };
}

export default async function CountryJobsPage({ params, searchParams }) {
  const [{ country }, query] = await Promise.all([params, searchParams]);
  if (country === "uae") redirect("/jobs");
  const hub = hubFor(country);
  const known = hub || jobCountryBySlug(country);
  if (!known) notFound();
  const name = hub ? hub.name : known.name;
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <JobsListing
        searchParams={query}
        fixed={{ country }}
        path={`/jobs/country/${country}`}
        heading={hub ? "Jobs across the Gulf" : `Jobs in ${name}`}
        intro={`Current, reviewed opportunities in ${name}, collected from employer career pages and refreshed daily.`}
      />
      <Footer />
    </div>
  );
}
