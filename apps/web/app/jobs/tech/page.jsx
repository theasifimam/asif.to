import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobsListing from "@/components/jobs/JobsListing";
import { JOBS_INDEXABLE } from "@/lib/jobsIndexing";

export const metadata = {
  title: "Tech Jobs in the UAE: Software, Web and IT Roles | asif.to",
  description: "Software, web and IT jobs across the UAE, filterable by the skills employers ask for, with free courses to learn the ones you are missing.",
  alternates: { canonical: "/jobs/tech" },
  robots: { index: JOBS_INDEXABLE, follow: true },
};

export const dynamic = "force-dynamic";

export default async function TechJobsPage({ searchParams }) {
  const query = await searchParams;
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <JobsListing
        searchParams={query}
        fixed={{ track: "tech" }}
        path="/jobs/tech"
        heading="Tech jobs in the UAE"
        intro="Software, web and IT roles. Pick a skill to see who is hiring for it, check how well you match, and learn what you are missing."
      />
      <Footer />
    </div>
  );
}
