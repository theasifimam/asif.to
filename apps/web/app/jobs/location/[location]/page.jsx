import { JOBS_INDEXABLE } from "@/lib/jobsIndexing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";
import { fetchJobs, jobCountryByCode } from "@/lib/jobs";

const titleCase = (value) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

// A city page spans whatever country the city is in, so read the country off its jobs. `short` keeps
// UAE titles exactly as they were ("Jobs in Dubai, UAE"); `full` is for running text.
async function describeLocation(location) {
  const name = titleCase(location);
  const result = await fetchJobs({ location, limit: 1 });
  const country = jobCountryByCode(result?.data?.[0]?.country);
  // A country-wide place ("Qatar", "United Arab Emirates") is not repeated after itself.
  const countryWide = [country.name, country.short, titleCase(country.slug)].includes(name);
  return {
    name, result,
    short: countryWide ? country.short : `${name}, ${country.short}`,
    full: countryWide ? country.name : `${name}, ${country.name}`,
  };
}

export async function generateMetadata({ params }) {
  const { location } = await params;
  const { short, result } = await describeLocation(location);
  const useful = (result?.meta?.indexableCount || 0) > 0;
  return { title: `Jobs in ${short} | asif.to`, description: `Browse active jobs in ${short}, with salary, work mode and experience filters.`, alternates: { canonical: `/jobs/location/${location}` }, robots: { index: JOBS_INDEXABLE && useful, follow: true } };
}

export default async function LocationJobsPage({ params, searchParams }) {
  const [{ location }, query] = await Promise.all([params, searchParams]);
  const { name, full } = await describeLocation(location);
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header /><JobsListing searchParams={query} fixed={{ location }} path={`/jobs/location/${location}`} heading={`Jobs in ${name}`} intro={`Current, reviewed opportunities in ${full}.`} /><Footer /></div>;
}
