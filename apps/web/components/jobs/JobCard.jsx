import Link from "next/link";
import { BriefcaseBusiness, Building2, Clock3, MapPin, Star } from "lucide-react";
import { formatJobDate, formatSalary } from "@/lib/jobs";
import { getImageUrl } from "@/lib/config";

const label = (value = "") => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export default function JobCard({ job, href = `/jobs/${job.slug}`, selected = false, compact = false }) {
  const company = job.company || {};
  const logo = company.logo || job.companyLogo;
  return (
    <article className={`group rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 dark:bg-zinc-900/90 dark:hover:border-blue-800 ${selected ? "border-blue-500 ring-2 ring-blue-500/15 dark:border-blue-500" : "border-zinc-200/80 dark:border-zinc-800"} ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          {logo ? <img src={getImageUrl(logo)} alt={`${job.companyName} logo`} className="h-full w-full object-contain p-1.5" /> : <Building2 className="h-5 w-5 text-zinc-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={href} aria-current={selected ? "page" : undefined} className="text-base font-black leading-tight tracking-tight text-zinc-950 transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 sm:text-lg">
                {job.title}
              </Link>
              <p className="mt-1 text-xs font-bold text-zinc-500">
                {company.slug ? <Link href={`/jobs/company/${company.slug}`} className="hover:text-blue-600">{job.companyName}</Link> : job.companyName}
                {company.verified || job.verified ? <span className="ml-1.5 text-blue-600" title="Verified">●</span> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">{job.isDemo && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">Demo · not live</span>}{job.featured && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"><Star className="h-3 w-3 fill-current" /> Featured</span>}</div>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}, UAE</span>
            <span className="inline-flex items-center gap-1.5"><BriefcaseBusiness className="h-3.5 w-3.5" />{label(job.employmentType)} · {label(job.workMode)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{formatJobDate(job.postedAt)}</span>
          </div>
          <div className={`mt-4 flex flex-wrap items-center gap-2 ${compact ? "[&>span:nth-child(n+3)]:hidden" : ""}`}>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">{formatSalary(job)}</span>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{label(job.experienceLevel)}</span>
            {(job.skills || []).slice(0, 3).map((skill) => <span key={skill} className="rounded-full border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-500 dark:border-zinc-700">{skill}</span>)}
          </div>
        </div>
      </div>
    </article>
  );
}
