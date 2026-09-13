"use client";

import Link from "next/link";
import { useJobSheet } from "./JobSheetProvider";
import { BriefcaseBusiness, Clock3, MapPin, Star } from "lucide-react";
import { formatJobDate, formatSalary } from "@/lib/jobs";
import CompanyLogo from "./CompanyLogo";

const label = (value = "") =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export default function JobCard({
  job,
  href = `/jobs/${job.slug}`,
  selected = false,
  compact = false,
}) {
  const sheet = useJobSheet();
  const company = job.company || {};

  return (
    <article
      className={`group relative w-full max-w-full overflow-hidden rounded-3xl border bg-white shadow-sm transition active:scale-[0.99] hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 dark:bg-zinc-900/90 dark:hover:border-blue-800 ${selected ? "border-blue-500 ring-2 ring-blue-500/15 dark:border-blue-500" : "border-zinc-200/80 dark:border-zinc-800"} ${compact ? "p-4" : "p-4 sm:p-6"}`}
    >
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 max-w-full">
        <div className="flex-none w-12 h-12 shrink-0 overflow-hidden">
          <CompanyLogo company={company} job={job} className="h-12 w-12" />
        </div>
        <div className="min-w-0 flex-1 max-w-full">
          <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
            <div className="min-w-0 flex-1">
              <Link
                href={href}
                onClick={
                  sheet ? (event) => sheet.openJob(event, job) : undefined
                }
                aria-haspopup={sheet ? "dialog" : undefined}
                aria-current={selected ? "page" : undefined}
                className="wrap-break-word text-base font-black leading-tight tracking-tight text-zinc-950 transition after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-blue-500 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg block"
              >
                {job.title}
              </Link>
              <p className="mt-1 text-xs font-bold text-zinc-500 truncate max-w-full">
                {company.slug ? (
                  <Link
                    href={`/jobs/company/${company.slug}`}
                    className="relative z-10 inline-block py-1 hover:text-blue-600 truncate max-w-full"
                  >
                    {job.companyName}
                  </Link>
                ) : (
                  <span className="truncate">{job.companyName}</span>
                )}
                {company.verified || job.verified ? (
                  <span
                    className="ml-1.5 text-blue-600 shrink-0"
                    title="Verified"
                  >
                    ●
                  </span>
                ) : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {job.isDemo && (
                <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
                  Demo · not live
                </span>
              )}
              {job.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                  <Star className="h-3 w-3 fill-current" /> Featured
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 min-w-0 max-w-full">
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{job.location}, UAE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {label(job.employmentType)} · {label(job.workMode)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
              <Clock3 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatJobDate(job.postedAt)}</span>
            </span>
          </div>
          <div
            className={`mt-4 flex flex-wrap items-center gap-2 min-w-0 max-w-full ${compact ? "[&>span:nth-child(n+3)]:hidden" : ""}`}
          >
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">
              {formatSalary(job)}
            </span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
              {label(job.experienceLevel)}
            </span>
            {(job.skills || []).slice(0, 3).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-500 dark:border-zinc-700 truncate max-w-40"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
