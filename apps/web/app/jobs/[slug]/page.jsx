import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JobActions from "@/components/jobs/JobActions";
import JobCard from "@/components/jobs/JobCard";
import JobResults from "@/components/jobs/JobResults";
import JobsFilters from "@/components/jobs/JobsFilters";
import {
  fetchJob,
  fetchJobs,
  fetchJobTaxonomy,
  formatJobDate,
  formatSalary,
} from "@/lib/jobs";
import { absoluteUrl, assetUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
const getJob = cache(fetchJob);
const label = (value = "") =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getJob(slug);
  const job = result?.data?.job;
  if (!job)
    return {
      title: "Job not found | asif.to",
      robots: { index: false, follow: false },
    };
  const title =
    job.seoTitle ||
    `${job.title} Jobs in ${job.location} | ${job.companyName} | asif.to`;
  const description =
    job.seoDescription ||
    `${job.title} opportunity at ${job.companyName} in ${job.location}, UAE. View requirements, salary details and how to apply.`;
  const canonical = job.canonicalUrl || `/jobs/${job.slug}`;
  const image = job.company?.logo || job.companyLogo || "/logo.png";
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: job.status === "published" && !job.isDemo, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [assetUrl(image)],
    },
    twitter: { card: "summary", title, description, images: [assetUrl(image)] },
  };
}

function decodeHtmlEntities(value = "") {
  let str = String(value ?? "");
  for (let i = 0; i < 3; i++) {
    if (!str.includes("&")) break;
    const prev = str;
    str = str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
        String.fromCharCode(parseInt(code, 16)),
      );
    if (str === prev) break;
  }
  return str;
}

function sanitizeHtml(value = "") {
  const decoded = decodeHtmlEntities(value);
  const SAFE_TAGS = new Set([
    "p",
    "br",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "div",
    "span",
  ]);
  return decoded
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(
      /<(script|style|form|iframe|object|embed|svg|link|meta|head|body|html)[^>]*>[\s\S]*?<\/\1\s*>/gi,
      "",
    )
    .replace(
      /<(script|style|form|iframe|object|embed|svg|link|meta|head|body|html)[^>]*\/?\s*>/gi,
      "",
    )
    .replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?>/gi, (match, name) => {
      const safeName = String(name).toLowerCase();
      if (!SAFE_TAGS.has(safeName)) return "";
      if (safeName === "br") return "<br>";
      return match.startsWith("</") ? `</${safeName}>` : `<${safeName}>`;
    })
    .trim();
}

function renderJobDescription(job) {
  const raw = job?.descriptionHtml || job?.description || "";
  const decoded = decodeHtmlEntities(raw);
  const hasTags = /<[a-z0-9]+(?:\s[^>]*)?>/i.test(decoded);

  if (hasTags) {
    const html = sanitizeHtml(decoded);
    return (
      <div
        className="prose prose-zinc mt-4 max-w-none text-sm leading-7 dark:prose-invert *:my-2"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="mt-4 whitespace-pre-line text-sm leading-7 text-zinc-600 dark:text-zinc-300">
      {decoded}
    </div>
  );
}

function listSection(title, items) {
  if (!items?.length) return null;
  return (
    <section>
      <h2 className="font-outfit text-xl font-black tracking-tight">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function JobPage({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [result, jobsResult, taxonomyResult] = await Promise.all([
    getJob(slug),
    fetchJobs({ ...query, page: query.page || 1, limit: 15 }),
    fetchJobTaxonomy(),
  ]);
  const job = result?.data?.job;
  if (!job) notFound();
  const jobs = jobsResult?.data || [];
  const pagination = jobsResult?.pagination || {
    page: 1,
    totalPages: 1,
    totalCount: 0,
  };
  const taxonomy = taxonomyResult?.data || {};
  const company = job.company || {};
  const canonical = absoluteUrl(job.canonicalUrl, `/jobs/${job.slug}`);
  const employmentMap = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    temporary: "TEMPORARY",
    internship: "INTERN",
    freelance: "OTHER",
  };
  const structuredJob = {
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.postedAt,
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    employmentType: employmentMap[job.employmentType] || undefined,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
      ...(company.website ? { sameAs: company.website } : {}),
      ...(company.logo || job.companyLogo
        ? { logo: assetUrl(company.logo || job.companyLogo) }
        : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressRegion: job.emirate,
        addressCountry: "AE",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "United Arab Emirates",
    },
    directApply: job.applicationType === "internal",
    ...(job.salaryVisible &&
    (job.minimumSalary != null || job.maximumSalary != null)
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "AED",
            value: {
              "@type": "QuantitativeValue",
              ...(job.minimumSalary != null
                ? { minValue: job.minimumSalary }
                : {}),
              ...(job.maximumSalary != null
                ? { maxValue: job.maximumSalary }
                : {}),
              unitText: String(job.salaryPeriod || "month").toUpperCase(),
            },
          },
        }
      : {}),
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      structuredJob,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Jobs",
            item: absoluteUrl("", "/jobs"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: job.location,
            item: absoluteUrl("", `/jobs/location/${job.locationSlug}`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: job.title,
            item: canonical,
          },
        ],
      },
    ],
  };
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 sm:px-6 sm:pt-28">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold text-zinc-400">
          <Link href="/jobs" className="hover:text-blue-600">
            Jobs
          </Link>
          <span>/</span>
          <Link
            href={`/jobs/location/${job.locationSlug}`}
            className="hover:text-blue-600"
          >
            {job.location}
          </Link>
          <span>/</span>
          <span className="truncate text-zinc-600 dark:text-zinc-300">
            {job.title}
          </span>
        </nav>
        {job.isDemo && (
          <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Demo/test listing — this is not a genuine live vacancy.
          </div>
        )}
        {job.status === "expired" && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
            This position is no longer accepting applications.
          </div>
        )}
        <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="hidden space-y-4 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-2 lg:pb-6">
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
              >
                <span aria-hidden="true">&larr;</span> All jobs
              </Link>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                Browse jobs
              </span>
            </div>
            <details className="group rounded-3xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
              <summary className="cursor-pointer list-none px-5 py-4 text-xs font-black text-zinc-700 dark:text-zinc-200">
                Refine this search{" "}
                <span className="float-right text-blue-600 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-zinc-100 p-3 dark:border-zinc-800">
                <JobsFilters values={query} taxonomy={taxonomy} />
              </div>
            </details>
            <JobResults
              jobs={jobs}
              pagination={pagination}
              searchParams={query}
              selectedSlug={job.slug}
              compact
            />
          </aside>
          <div className="min-w-0 space-y-6">
            <article className="min-w-0 space-y-8">
              <header className="rounded-4xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
                    {company.logo || job.companyLogo ? (
                      <img
                        src={assetUrl(company.logo || job.companyLogo)}
                        alt={`${job.companyName} logo`}
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <Building2 className="h-7 w-7 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      {job.featured && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700">
                          Featured
                        </span>
                      )}
                      {job.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black uppercase text-blue-700 dark:bg-blue-950">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h1 className="mt-3 font-outfit text-3xl font-black tracking-tight sm:text-5xl">
                      {job.title}
                    </h1>
                    <p className="mt-2 text-sm font-bold text-zinc-500">
                      {company.slug ? (
                        <Link
                          href={`/jobs/company/${company.slug}`}
                          className="hover:text-blue-600"
                        >
                          {job.companyName}
                        </Link>
                      ) : (
                        job.companyName
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-zinc-100 pt-5 text-xs font-semibold text-zinc-500 dark:border-zinc-800">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {job.location}, UAE
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-4 w-4" />
                    {label(job.employmentType)} · {label(job.workMode)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4" />
                    {formatJobDate(job.postedAt)}
                  </span>
                </div>
              </header>
              <div className="space-y-10 rounded-4xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-8">
                <section>
                  <h2 className="font-outfit text-xl font-black tracking-tight">
                    About the role
                  </h2>
                  {renderJobDescription(job)}
                </section>
                {listSection("Responsibilities", job.responsibilities)}
                {listSection("Requirements", job.requirements)}
                {listSection("Benefits", job.benefits)}
                {job.skills?.length > 0 && (
                  <section>
                    <h2 className="font-outfit text-xl font-black">Skills</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </article>
            <section className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90 sm:p-6">
              <h2 className="font-outfit text-xl font-black">Job details</h2>
              <dl className="mt-4 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                {[
                  ["Salary", formatSalary(job)],
                  ["Category", job.category],
                  ["Experience", label(job.experienceLevel)],
                  ["Employment", label(job.employmentType)],
                  ["Work mode", label(job.workMode)],
                  ["Location", `${job.location}, UAE`],
                  [
                    "Posted",
                    new Intl.DateTimeFormat("en-AE", {
                      dateStyle: "medium",
                    }).format(new Date(job.postedAt)),
                  ],
                  ...(job.expiresAt
                    ? [
                        [
                          "Deadline",
                          new Intl.DateTimeFormat("en-AE", {
                            dateStyle: "medium",
                          }).format(new Date(job.expiresAt)),
                        ],
                      ]
                    : []),
                  ["Original source", job.source?.name || job.sourceName],
                ].map(([term, value]) => (
                  <div
                    key={term}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <dt className="font-semibold text-zinc-400">{term}</dt>
                    <dd className="text-right font-bold text-zinc-700 dark:text-zinc-200">
                      {value || "Not specified"}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className="rounded-4xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="font-outfit text-lg font-black">
                  About {company.name || job.companyName}
                </h2>
              </div>
              {company.description && (
                <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {company.description}
                </p>
              )}
              <dl className="mt-4 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
                {[
                  ["Industry", company.industry],
                  ["Company size", company.size],
                  ["Headquarters", company.headquarters],
                ]
                  .filter(([, value]) => value)
                  .map(([term, value]) => (
                    <div
                      key={term}
                      className="flex items-start justify-between gap-4 py-3"
                    >
                      <dt className="font-semibold text-zinc-400">{term}</dt>
                      <dd className="text-right font-bold text-zinc-700 dark:text-zinc-200">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-black text-blue-600">
                {company.slug && (
                  <Link href={`/jobs/company/${company.slug}`}>
                    View company jobs
                  </Link>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Company website
                  </a>
                )}
                {company.careersUrl && (
                  <a
                    href={company.careersUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Careers page
                  </a>
                )}
              </div>
            </section>
            {result.data.related?.length > 0 && (
              <section className="mt-12">
                <h2 className="font-outfit text-2xl font-black">
                  Related active jobs
                </h2>
                <div className="mt-5 grid gap-3 xl:grid-cols-2">
                  {result.data.related.map((item) => (
                    <JobCard key={item._id} job={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none py-3">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
            <div className="hidden lg:block" aria-hidden="true" />
            <div className="min-w-0 flex justify-center pointer-events-auto">
              <div className="w-full max-w-2xl">
                <JobActions job={job} layout="bar" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
