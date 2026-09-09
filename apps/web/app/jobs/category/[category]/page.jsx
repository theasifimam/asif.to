import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";
import { fetchJobs } from "@/lib/jobs";

const titleCase = (value) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export async function generateMetadata({ params }) {
  const { category } = await params;
  const name = titleCase(category);
  const result = await fetchJobs({ category, limit: 1 });
  const useful = (result?.meta?.indexableCount || 0) > 0;
  return { title: `${name} Jobs in the UAE | asif.to`, description: `Browse active ${name.toLowerCase()} jobs across the UAE.`, alternates: { canonical: `/jobs/category/${category}` }, robots: { index: useful, follow: true } };
}

export default async function CategoryJobsPage({ params, searchParams }) {
  const [{ category }, query] = await Promise.all([params, searchParams]);
  const name = titleCase(category);
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header /><JobsListing searchParams={query} fixed={{ category }} path={`/jobs/category/${category}`} heading={`${name} jobs in the UAE`} intro={`Explore active ${name.toLowerCase()} opportunities across the United Arab Emirates.`} /><Footer /></div>;
}
