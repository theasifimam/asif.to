import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";
import { fetchJobs } from "@/lib/jobs";

const titleCase = (value) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export async function generateMetadata({ params }) {
  const { location } = await params;
  const name = titleCase(location);
  const result = await fetchJobs({ location, limit: 1 });
  const useful = (result?.meta?.indexableCount || 0) > 0;
  return { title: `Jobs in ${name}, UAE | asif.to`, description: `Browse active jobs in ${name}, UAE, with salary, work mode and experience filters.`, alternates: { canonical: `/jobs/location/${location}` }, robots: { index: useful, follow: true } };
}

export default async function LocationJobsPage({ params, searchParams }) {
  const [{ location }, query] = await Promise.all([params, searchParams]);
  const name = titleCase(location);
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header /><JobsListing searchParams={query} fixed={{ location }} path={`/jobs/location/${location}`} heading={`Jobs in ${name}`} intro={`Current, reviewed opportunities in ${name}, United Arab Emirates.`} /><Footer /></div>;
}
