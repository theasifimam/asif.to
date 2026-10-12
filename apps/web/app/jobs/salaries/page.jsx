import Link from "next/link";
import { ArrowRight, BarChart3, Info } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { JOBS_INDEXABLE } from "@/lib/jobsIndexing";
import { fetchSalaryOverview, formatAed } from "@/lib/jobs";

export const metadata = {
  title: "UAE Salaries from Real Job Postings | asif.to",
  description: "What UAE employers state they pay, calculated from live job postings that include a salary. Every figure shows how many postings it is based on.",
  alternates: { canonical: "/jobs/salaries" },
  robots: { index: JOBS_INDEXABLE, follow: true },
};

export const revalidate = 600;

function StatCard({ name, n, median, low, high, href }) {
  const body = (
    <>
      <h3 className="font-outfit text-lg font-black">{name}</h3>
      <p className="mt-3 font-outfit text-3xl font-black tabular-nums">{formatAed(median)}<span className="text-xs font-bold text-zinc-400"> / month</span></p>
      <p className="mt-1 text-xs font-semibold text-zinc-500">Typical range {formatAed(low)} – {formatAed(high)}</p>
      <p className="mt-3 text-[11px] font-bold text-zinc-400">Median of {n} postings</p>
    </>
  );
  const classes = "block rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900";
  return href ? <Link href={href} className={`${classes} hover:border-blue-300 hover:shadow-md`}>{body}</Link> : <div className={classes}>{body}</div>;
}

export default async function SalariesPage() {
  const data = await fetchSalaryOverview();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <nav aria-label="Breadcrumb" className="text-xs font-bold text-zinc-400"><Link href="/jobs" className="hover:text-blue-600">UAE jobs</Link> / Salaries</nav>
        <header className="mt-4 max-w-3xl">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-600"><BarChart3 className="h-4 w-4" aria-hidden="true" /> Salary insights</p>
          <h1 className="mt-2 font-outfit text-3xl font-black tracking-tight sm:text-5xl">UAE salaries from real job postings</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Figures come only from live postings that state a salary, converted to a monthly amount. We show how many postings each number is based on, and we do not publish a figure until a group has enough of them.
          </p>
        </header>

        {!data?.overall ? (
          <div className="mt-10 rounded-4xl border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
            <p className="font-outfit text-xl font-black">Not enough salary data yet</p>
            <p className="mt-2 text-sm text-zinc-500">Most employers do not state pay. We will publish figures as soon as there are enough postings behind them.</p>
            <Link href="/jobs" className="mt-5 inline-block text-xs font-black text-blue-600">Browse UAE jobs</Link>
          </div>
        ) : (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Overall">
              <StatCard name="All UAE jobs that state a salary" {...data.overall} />
            </section>

            {data.categories.length > 0 && (
              <section className="mt-12">
                <h2 className="font-outfit text-2xl font-black">By job category</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.categories.map((category) => <StatCard key={category.id} name={category.name} {...category} href={`/jobs/salaries/${category.id}`} />)}
                </div>
              </section>
            )}

            {data.locations.length > 0 && (
              <section className="mt-12">
                <h2 className="font-outfit text-2xl font-black">By emirate</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.locations.map((location) => <StatCard key={location.id} name={location.name} {...location} />)}
                </div>
              </section>
            )}
          </>
        )}

        <aside className="mt-12 flex gap-3 rounded-3xl bg-blue-50 p-5 text-xs leading-5 text-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong>How to read this.</strong> The median is the middle posting&apos;s pay (the midpoint of its stated range); the typical range covers the middle half of postings. Only {data?.postingsWithSalary ?? 0} live postings state a salary, so these figures describe advertised pay, not everyone who works in the role, and categories with fewer than {data?.minimumSample ?? 5} postings are not shown.
          </p>
        </aside>
        <Link href="/jobs" className="mt-8 inline-flex items-center gap-1.5 text-xs font-black text-blue-600">Browse all UAE jobs <ArrowRight className="h-3.5 w-3.5" /></Link>
      </main>
      <Footer />
    </div>
  );
}
