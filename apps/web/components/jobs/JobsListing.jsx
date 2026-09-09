import Link from "next/link";
import JobsFilters from "./JobsFilters";
import JobResults from "./JobResults";
import { fetchJobs, fetchJobTaxonomy } from "@/lib/jobs";

export default async function JobsListing({ searchParams = {}, fixed = {}, heading, intro, path = "/jobs" }) {
  const params = { ...searchParams, ...fixed, page: searchParams.page || 1, limit: 15 };
  const [result, taxonomyResult] = await Promise.all([fetchJobs(params), fetchJobTaxonomy()]);
  const jobs = result?.data || [];
  const pagination = result?.pagination || { page: 1, totalPages: 1, totalCount: 0 };
  const taxonomy = taxonomyResult?.data || {};

  return (
    <>
      <section className="border-b border-zinc-200/70 bg-linear-to-b from-blue-50/80 to-transparent pb-10 pt-28 dark:border-zinc-800 dark:from-blue-950/20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">UAE jobs</p>
          <h1 className="mt-3 max-w-4xl font-outfit text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-6xl">{heading || "Find your next opportunity in the UAE."}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">{intro || "Search focused, traceable opportunities across all seven emirates. Every listing is reviewed and individually managed by asif.to."}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold"><Link href="/jobs/my" className="rounded-full bg-zinc-950 px-4 py-2 text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">My saved jobs & applications</Link></div>
        </div>
      </section>
      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[300px_1fr] lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start"><JobsFilters values={searchParams} taxonomy={taxonomy} fixed={fixed} /></aside>
        <JobResults jobs={jobs} pagination={pagination} searchParams={searchParams} path={path} />
      </main>
    </>
  );
}
