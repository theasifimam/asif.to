import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Info } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { JOBS_INDEXABLE } from "@/lib/jobsIndexing";
import { fetchSalaryCategory, formatAed, formatSalary } from "@/lib/jobs";

export const revalidate = 600;

export async function generateMetadata({ params }) {
  const { category } = await params;
  const data = await fetchSalaryCategory(category);
  if (!data?.available) return { title: "Salaries | asif.to", robots: { index: false, follow: true } };
  return {
    title: `${data.categoryName} Salaries in the UAE | asif.to`,
    description: `${data.categoryName} jobs in the UAE state a median of ${formatAed(data.median)} a month, based on ${data.n} live postings.`,
    alternates: { canonical: `/jobs/salaries/${category}` },
    robots: { index: JOBS_INDEXABLE, follow: true },
  };
}

const label = (value = "") => value.replaceAll("-", " ");

function Breakdown({ title, rows }) {
  if (!rows?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-outfit text-xl font-black">{title}</h2>
      <div className="mt-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 text-[11px] font-black uppercase tracking-wide text-zinc-400 dark:bg-zinc-950">
            <tr><th className="px-4 py-3">Group</th><th className="px-4 py-3">Median / month</th><th className="px-4 py-3 text-right">Postings</th></tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-semibold capitalize">{label(row.name)}</td>
                <td className="px-4 py-3 tabular-nums">{formatAed(row.median)}</td>
                <td className="px-4 py-3 text-right text-zinc-500">{row.n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function SalaryCategoryPage({ params }) {
  const { category } = await params;
  const data = await fetchSalaryCategory(category);
  if (!data) notFound();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <nav aria-label="Breadcrumb" className="text-xs font-bold text-zinc-400">
          <Link href="/jobs" className="hover:text-blue-600">UAE jobs</Link> / <Link href="/jobs/salaries" className="hover:text-blue-600">Salaries</Link> / {data.categoryName || category}
        </nav>
        {!data.available ? (
          <div className="mt-8 rounded-4xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <h1 className="font-outfit text-2xl font-black">Not enough data yet</h1>
            <p className="mt-2 text-sm text-zinc-500">Only {data.postings} live {data.categoryName || "job"} postings state a salary. We publish a figure once there are {data.minimumSample}.</p>
            <Link href="/jobs/salaries" className="mt-5 inline-block text-xs font-black text-blue-600">See categories with salary data</Link>
          </div>
        ) : (
          <>
            <h1 className="mt-4 font-outfit text-3xl font-black tracking-tight sm:text-5xl">{data.categoryName} salaries in the UAE</h1>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Based on {data.n} live postings that state a salary, converted to a monthly amount.</p>
            <section className="mt-8 grid gap-4 sm:grid-cols-3">
              {[["Median", data.median], ["Typical low (25th percentile)", data.low], ["Typical high (75th percentile)", data.high]].map(([name, value]) => (
                <div key={name} className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="text-[11px] font-black uppercase tracking-wide text-zinc-400">{name}</p>
                  <p className="mt-2 font-outfit text-3xl font-black tabular-nums">{formatAed(value)}</p>
                  <p className="text-[11px] font-bold text-zinc-400">per month</p>
                </div>
              ))}
            </section>
            <Breakdown title="By experience level" rows={data.byExperience} />
            <Breakdown title="By emirate" rows={data.byLocation} />
            <section className="mt-10">
              <h2 className="font-outfit text-xl font-black">Recent postings with a salary</h2>
              <ul className="mt-4 divide-y divide-zinc-100 overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
                {data.recent.map((job) => (
                  <li key={job.slug}>
                    <Link href={`/jobs/${job.slug}`} className="flex flex-col gap-1 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 sm:flex-row sm:items-center sm:justify-between">
                      <span className="min-w-0"><span className="font-semibold">{job.title}</span><span className="block text-xs text-zinc-500">{job.companyName} · {job.location}</span></span>
                      <span className="shrink-0 text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatSalary(job)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
            <aside className="mt-10 flex gap-3 rounded-3xl bg-blue-50 p-5 text-xs leading-5 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>These are advertised salaries in {data.n} postings, not a survey of everyone in the role. Some figures were read from the posting text. Hourly and daily pay is left out because it cannot be compared fairly.</p>
            </aside>
            <Link href={`/jobs/category/${category}`} className="mt-8 inline-flex items-center gap-1.5 text-xs font-black text-blue-600">Browse {data.categoryName} jobs <ArrowRight className="h-3.5 w-3.5" /></Link>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
