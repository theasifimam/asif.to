import { notFound } from "next/navigation";
import { Building2, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobCard from "@/components/jobs/JobCard";
import { fetchJobCompany } from "@/lib/jobs";
import { assetUrl } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { companySlug } = await params;
  const result = await fetchJobCompany(companySlug, { limit: 1 });
  const company = result?.data?.company;
  if (!company) return { title: "Company not found | asif.to", robots: { index: false } };
  const useful = (result?.data?.indexableOpenJobs || 0) > 0;
  return { title: `${company.name} Jobs in the UAE | asif.to`, description: `Company information and active UAE jobs at ${company.name}.`, alternates: { canonical: `/jobs/company/${company.slug}` }, robots: { index: useful, follow: true } };
}

export default async function CompanyJobsPage({ params }) {
  const { companySlug } = await params;
  const result = await fetchJobCompany(companySlug, { limit: 50 });
  if (!result?.data?.company) notFound();
  const { company, jobs, openJobs } = result.data;
  return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950"><Header /><main className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
    <header className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-9"><div className="flex flex-col gap-5 sm:flex-row"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">{company.logo ? <img src={assetUrl(company.logo)} alt={`${company.name} logo`} className="h-full w-full object-contain p-2" /> : <Building2 className="h-8 w-8 text-zinc-400" />}</div><div><div className="flex items-center gap-2"><h1 className="font-outfit text-3xl font-black tracking-tight sm:text-5xl">{company.name}</h1>{company.verified && <ShieldCheck className="h-5 w-5 text-blue-600" />}</div><p className="mt-2 text-xs font-bold text-blue-600">{openJobs} open {openJobs === 1 ? "job" : "jobs"} in the UAE</p>{company.description && <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-500">{company.description}</p>}<div className="mt-4 flex flex-wrap gap-4 text-xs font-bold text-zinc-500">{company.headquarters && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.headquarters}</span>}{company.industry && <span>{company.industry}</span>}{company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600">Company website<ExternalLink className="h-3 w-3" /></a>}</div></div></div></header>
    <section className="mt-8"><h2 className="font-outfit text-2xl font-black">Active jobs</h2><div className="mt-5 space-y-3">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div>{!jobs.length && <div className="mt-5 rounded-3xl border border-dashed border-zinc-300 p-12 text-center text-sm text-zinc-500 dark:border-zinc-700">No active jobs at this company right now.</div>}</section>
  </main><Footer /></div>;
}
