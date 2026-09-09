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

export function formatJobDate(value) {
  if (!value) return "Recently";
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-AE", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export function formatSalary(job) {
  if (!job?.salaryVisible || (job.minimumSalary == null && job.maximumSalary == null)) return "Salary not disclosed";
  const formatter = new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 });
  const min = job.minimumSalary != null ? formatter.format(job.minimumSalary) : null;
  const max = job.maximumSalary != null ? formatter.format(job.maximumSalary) : null;
  const range = min && max ? `${min}–${max}` : min ? `From ${min}` : `Up to ${max}`;
  return `AED ${range} / ${job.salaryPeriod || "month"}`;
}

