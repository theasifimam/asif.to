import { JobProvider } from "./base.provider.js";
import { activeJobCountries, normalizeRegionLocation } from "../jobNormalization.service.js";

// Workday career sites are served by a public JSON "CxS" API, the same one the site's own search page calls:
//   POST https://{tenant}.{wdN}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs   (search, 20 per page)
//   GET  https://{tenant}.{wdN}.myworkdayjobs.com/wday/cxs/{tenant}/{site}{externalPath}   (one posting)
// The source's providerOrganizationId is "tenant/wdN/site". The host is always built from those validated
// parts, never taken from a free-form URL, so a source cannot point the importer at an arbitrary server.

const PAGE_SIZE = 20;
const TENANT = /^[a-z0-9][a-z0-9-]{0,62}$/i;
const POD = /^wd\d{1,4}$/i;
const SITE = /^[A-Za-z0-9_-]{1,100}$/;
const JOB_PATH = /^\/job\/[\w%.~+/-]+$/;

// Workday's search is free text over the whole posting and has no portable country filter, so each accepted
// country is searched by its name and main cities; the location text then decides what is kept.
const SEARCH_TERMS = {
  AE: ["United Arab Emirates", "Dubai", "Abu Dhabi", "Sharjah"],
  SA: ["Saudi Arabia", "Riyadh", "Jeddah", "Dammam", "Al Khobar"],
  QA: ["Qatar", "Doha"],
  KW: ["Kuwait"],
  BH: ["Bahrain", "Manama"],
  OM: ["Oman", "Muscat"],
};

export function parseWorkdayId(id) {
  const [tenant, pod, site, ...rest] = String(id || "").split("/");
  if (rest.length || !TENANT.test(tenant || "") || !POD.test(pod || "") || !SITE.test(site || "")) {
    throw new Error("Workday source id must look like tenant/wdN/site.");
  }
  return { tenant: tenant.toLowerCase(), pod: pod.toLowerCase(), site };
}

export const workdayBase = ({ tenant, pod, site }) => `https://${tenant}.${pod}.myworkdayjobs.com/wday/cxs/${tenant}/${encodeURIComponent(site)}`;

export class WorkdayJobProvider extends JobProvider {
  async fetchJobs() {
    const parts = parseWorkdayId(this.source.providerOrganizationId);
    const base = workdayBase(parts);
    const perTermCap = Math.max(PAGE_SIZE, parseInt(process.env.JOB_WORKDAY_MAX_PER_SEARCH || "400", 10));
    const maxJobs = Math.max(PAGE_SIZE, parseInt(process.env.JOB_WORKDAY_MAX_JOBS || "1500", 10));

    // 1. Search every term and collect distinct postings.
    const summaries = new Map();
    let boardTotal = 0;
    const terms = activeJobCountries().flatMap((code) => SEARCH_TERMS[code] || []);
    for (const searchText of terms) {
      let total = Infinity;
      for (let offset = 0; offset < Math.min(perTermCap, total); offset += PAGE_SIZE) {
        const body = await this.requestJson(`${base}/jobs`, { method: "POST", body: { appliedFacets: {}, limit: PAGE_SIZE, offset, searchText } });
        if (!Array.isArray(body?.jobPostings)) throw new Error("Workday response did not contain jobPostings.");
        // Workday reports the total on the first page only; later pages say 0.
        if (offset === 0) total = Number(body.total) || body.jobPostings.length;
        // Only plain /job/... paths are followed, so a response cannot steer a request elsewhere on the host.
        for (const posting of body.jobPostings) if (JOB_PATH.test(posting.externalPath || "") && !summaries.has(posting.externalPath)) summaries.set(posting.externalPath, posting);
        boardTotal = Math.max(boardTotal, total === Infinity ? 0 : total);
        if (body.jobPostings.length < PAGE_SIZE) break;
      }
    }

    // 2. Keep postings whose location text is in scope, or says only "3 Locations" and needs the detail to tell.
    const wanted = [...summaries.values()].filter((posting) => {
      const text = String(posting.locationsText || "");
      return Boolean(normalizeRegionLocation(text)) || /^\d+\s+locations?$/i.test(text.trim());
    }).slice(0, maxJobs);

    // 3. Fetch each posting's detail, a few at a time, then apply the full location check.
    const details = [];
    for (let start = 0; start < wanted.length; start += 5) {
      const batch = await Promise.all(wanted.slice(start, start + 5).map(async (summary) => {
        const detail = await this.requestJson(`${base}${summary.externalPath}`);
        return detail?.jobPostingInfo ? { summary, info: detail.jobPostingInfo, organization: detail.hiringOrganization } : null;
      }));
      details.push(...batch.filter((item) => item && item.info.canApply !== false));
    }
    const jobs = this.onlyUaeJobs(details);
    this.lastFetchStats = { jobsFound: boardTotal, uaeJobsFound: jobs.length };
    return jobs;
  }

  normalizeJob(raw) {
    const info = raw.info || {}; const parts = parseWorkdayId(this.source.providerOrganizationId);
    return {
      sourceJobId: info.jobReqId || info.id || raw.summary?.bulletFields?.[0], sourceCompanyId: this.source.providerOrganizationId,
      title: info.title || raw.summary?.title, companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: info.jobDescription,
      location: [info.location, ...(Array.isArray(info.additionalLocations) ? info.additionalLocations : [])].filter(Boolean).join(", "),
      country: info.country?.descriptor, employmentType: info.timeType, workMode: info.remoteType,
      applicationUrl: info.externalUrl || `https://${parts.tenant}.${parts.pod}.myworkdayjobs.com/${parts.site}${raw.summary?.externalPath || ""}`,
      sourceUrl: info.externalUrl,
      // startDate is the posting's own start date; the relative "Posted 3 Days Ago" text is not used.
      postedAt: info.startDate, raw: { id: info.id, jobReqId: info.jobReqId, title: info.title, location: info.location, startDate: info.startDate },
    };
  }
}
