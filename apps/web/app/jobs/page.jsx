import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";

export const metadata = {
  title: "UAE Jobs in Dubai, Abu Dhabi & More | asif.to",
  description: "Find reviewed UAE jobs across Dubai, Abu Dhabi, Sharjah and the other emirates. Search by role, company, work mode, salary and experience.",
  alternates: { canonical: "/jobs" },
  openGraph: { title: "UAE Jobs | asif.to", description: "Search focused, traceable job opportunities across the UAE.", url: "/jobs", type: "website" },
};

export const dynamic = "force-dynamic";

export default async function JobsPage({ searchParams }) {
  const query = await searchParams;
  return <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100"><Header /><JobsListing searchParams={query} /><Footer /></div>;
}

