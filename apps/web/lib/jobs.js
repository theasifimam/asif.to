const API = process.env.NEXT_PUBLIC_API_URL;

export async function fetchJobs(params = {}, options = {}) {
  if (!API) return null;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  try {
    const response = await fetch(`${API}/jobs?${query}`, { next: { revalidate: options.revalidate ?? 60 } });
    return response.ok ? response.json() : null;
  } catch { return null; }
}

export async function fetchJob(slug) {
  if (!API || !slug) return null;
  try {
    const response = await fetch(`${API}/jobs/slug/${encodeURIComponent(slug)}`, { cache: "no-store" });
    return response.ok ? response.json() : null;
  } catch { return null; }
}

export async function fetchJobCompany(slug, params = {}) {
  if (!API || !slug) return null;
  try {
    const response = await fetch(`${API}/jobs/company/${encodeURIComponent(slug)}?${new URLSearchParams(params)}`, { next: { revalidate: 60 } });
    return response.ok ? response.json() : null;
  } catch { return null; }
}

export async function fetchJobTaxonomy() {
  if (!API) return null;
  try {
    const response = await fetch(`${API}/jobs/taxonomy`, { next: { revalidate: 300 } });
    return response.ok ? response.json() : null;
  } catch { return null; }
}

// Countries jobs are listed for. `slug` is the /jobs/country/<slug> route; `short` is how a place is
// written on cards ("Dubai, UAE"). "gulf" is the all-countries hub and has no code.
export const JOB_COUNTRIES = [
  { code: "AE", slug: "uae", name: "United Arab Emirates", short: "UAE", label: "UAE" },
  { code: "SA", slug: "saudi-arabia", name: "Saudi Arabia", short: "Saudi Arabia", label: "Saudi Arabia" },
  { code: "QA", slug: "qatar", name: "Qatar", short: "Qatar", label: "Qatar" },
  { code: "KW", slug: "kuwait", name: "Kuwait", short: "Kuwait", label: "Kuwait" },
  { code: "BH", slug: "bahrain", name: "Bahrain", short: "Bahrain", label: "Bahrain" },
  { code: "OM", slug: "oman", name: "Oman", short: "Oman", label: "Oman" },
];
export const GULF_HUB = { slug: "gulf", name: "the Gulf", label: "All Gulf" };

export const jobCountryBySlug = (slug) => JOB_COUNTRIES.find((country) => country.slug === slug) || null;
export const jobCountryByCode = (code) => JOB_COUNTRIES.find((country) => country.code === String(code || "").toUpperCase()) || JOB_COUNTRIES[0];

/** "Dubai, UAE" / "Riyadh, Saudi Arabia"; a country-wide location is not repeated ("Kuwait"). */
export function jobPlace(job) {
  const country = jobCountryByCode(job?.country);
  const location = String(job?.location || "").trim();
  if (!location || location === country.name || location === country.short) return country.short;
  return `${location}, ${country.short}`;
}

// `source` is the job's postedAtSource. "first_seen" means the employer gave no posting date,
// so the date is when we first listed the job and is worded "Added", never "Posted".
export function formatJobDate(value, source = "provider") {
  const added = source === "first_seen";
  if (!value) return added ? "Recently added" : "Recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return added ? "Added today" : "Today";
  if (days === 1) return added ? "Added yesterday" : "1 day ago";
  if (days < 30) return added ? `Added ${days} days ago` : `${days} days ago`;
  const date = new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
  return added ? `Added ${date}` : date;
}

export const JOB_TAG_LABELS = {
  visa: "Visa provided",
  "walk-in": "Walk-in",
  "arabic-speaking": "Arabic speaker",
  "fresh-graduate": "Fresh graduate",
  urgent: "Urgent hiring",
};

const OLDER_LISTING_DAYS = 45;
/** Jobs listed for a long time are often already filled; flag them instead of hiding them. */
export function isOlderListing(job) {
  if (!job?.postedAt) return false;
  return Date.now() - new Date(job.postedAt).getTime() > OLDER_LISTING_DAYS * 86_400_000;
}

/** Where a salary figure came from, when it is not a structured field. */
export function salaryNote(job) {
  return job?.salaryVisible && job.salarySource === "description" ? "Salary stated in the job description" : "";
}

export function formatSalary(job) {
  if (!job?.salaryVisible || (job.minimumSalary == null && job.maximumSalary == null)) return "Salary not disclosed";
  const formatter = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
  const min = job.minimumSalary != null ? formatter.format(job.minimumSalary) : null;
  const max = job.maximumSalary != null ? formatter.format(job.maximumSalary) : null;
  const range = min && max ? `${min}–${max}` : min ? `From ${min}` : `Up to ${max}`;
  return `AED ${range} / ${job.salaryPeriod || "month"}`;
}


export async function fetchSalaryOverview() {
  if (!API) return null;
  try {
    const response = await fetch(`${API}/jobs/salaries`, { next: { revalidate: 600 } });
    return response.ok ? (await response.json())?.data || null : null;
  } catch { return null; }
}

export async function fetchSalaryCategory(category) {
  if (!API || !category) return null;
  try {
    const response = await fetch(`${API}/jobs/salaries/${encodeURIComponent(category)}`, { next: { revalidate: 600 } });
    return response.ok ? (await response.json())?.data || null : null;
  } catch { return null; }
}

/** "AED 4,000" (monthly-equivalent figures are whole hundreds). */
export function formatAed(value) {
  return value == null ? "–" : `AED ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value)}`;
}
