import Link from "next/link";
import { formatAed } from "@/lib/jobs";
import FollowCompanyButton from "./FollowCompanyButton";

/**
 * Hiring snapshot for a company page. Every block hides itself when there is too little
 * data to say anything honest (a trend needs employer-published dates; pay needs 3 postings).
 */
export default function CompanyInsights({ company, insights }) {
  if (!insights) return null;
  const { openRoles, newLastWeek, weekly, topCategories, topLocations, salary } = insights;
  const peak = weekly ? Math.max(1, ...weekly) : 1;

  return (
    <section aria-labelledby="company-insights" className="mt-8 rounded-4xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="company-insights" className="font-outfit text-xl font-black">Hiring at {company.name}</h2>
        <FollowCompanyButton companyId={company._id} companyName={company.name} />
      </div>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950"><dt className="text-[11px] font-black uppercase tracking-wide text-zinc-400">Open roles</dt><dd className="mt-1 font-outfit text-3xl font-black tabular-nums">{openRoles}</dd></div>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950"><dt className="text-[11px] font-black uppercase tracking-wide text-zinc-400">New this week</dt><dd className="mt-1 font-outfit text-3xl font-black tabular-nums">{newLastWeek}</dd></div>
        <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
          <dt className="text-[11px] font-black uppercase tracking-wide text-zinc-400">Typical stated pay</dt>
          <dd className="mt-1 font-outfit text-xl font-black tabular-nums">{salary ? `${formatAed(salary.median)} / mo` : "Not disclosed"}</dd>
          {salary && <p className="text-[11px] font-semibold text-zinc-400">Median of {salary.n} postings</p>}
        </div>
      </dl>

      {weekly && (
        <figure className="mt-6">
          <figcaption className="text-xs font-black">Roles published per week, last 8 weeks</figcaption>
          <div className="mt-3 flex h-20 items-end gap-1.5" role="img" aria-label={`Roles published per week: ${weekly.join(", ")}`}>
            {weekly.map((count, index) => (
              <div key={index} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-bold tabular-nums text-zinc-400">{count || ""}</span>
                <div className="w-full rounded-t-md bg-blue-500/80" style={{ height: `${Math.max(count ? 6 : 2, (count / peak) * 48)}px`, opacity: count ? 1 : 0.25 }} />
              </div>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-zinc-400">Counts only roles with a date published by the employer.</p>
        </figure>
      )}

      {(topCategories.length > 0 || topLocations.length > 0) && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {topCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-black">Most hiring for</h3>
              <ul className="mt-2 flex flex-wrap gap-2">{topCategories.map((item) => <li key={item.id}><Link href={`/jobs/category/${item.id}`} className="inline-flex min-h-8 items-center rounded-full bg-zinc-100 px-3 text-xs font-bold hover:text-blue-600 dark:bg-zinc-800">{item.name} · {item.count}</Link></li>)}</ul>
            </div>
          )}
          {topLocations.length > 0 && (
            <div>
              <h3 className="text-xs font-black">Where</h3>
              <ul className="mt-2 flex flex-wrap gap-2">{topLocations.map((item) => <li key={item.id}><Link href={`/jobs/location/${item.id}`} className="inline-flex min-h-8 items-center rounded-full bg-zinc-100 px-3 text-xs font-bold hover:text-blue-600 dark:bg-zinc-800">{item.name} · {item.count}</Link></li>)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
