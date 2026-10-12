import { JobProvider } from "./base.provider.js";
import { activeJobCountries, normalizeRegionLocation } from "../jobNormalization.service.js";

export class SmartRecruitersJobProvider extends JobProvider {
  async fetchJobs() {
    const id = this.source.providerOrganizationId;
    if (!id && !this.source.endpointUrl) throw new Error("SmartRecruiters company identifier is not configured.");
    const base = this.source.endpointUrl || `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings`;
    const summaries = [];
    let jobsFound = 0;
    const separator = base.includes("?") ? "&" : "?";
    // Returns true when the whole result set fit in the pages read, false when it is larger than a page.
    const collect = async (country) => {
      for (let offset = 0; ; offset += 100) {
        if (offset >= 10000) throw new Error("SmartRecruiters pagination exceeded its safety limit; refusing a partial sync.");
        const body = await this.requestJson(`${base}${separator}limit=100&offset=${offset}&destination=PUBLIC${country ? `&country=${country}` : ""}`);
        const page = body?.content;
        if (!Array.isArray(page)) throw new Error("SmartRecruiters response did not contain content.");
        if (!country) jobsFound = Math.max(jobsFound, Number(body.totalFound) || offset + page.length);
        summaries.push(...page.filter((item) => {
          const location = [item.location?.city, item.location?.region, item.location?.country].filter(Boolean).join(", ");
          return Boolean(normalizeRegionLocation(location, item.location?.country));
        }));
        if (page.length < 100) return true;
        // The public Posting API documents a country filter. After the global count is known, a board
        // larger than one page is read per accepted country so it is never truncated.
        if (!country) return false;
      }
    };
    if (!await collect(null)) for (const code of activeJobCountries()) await collect(code.toLowerCase());
    const uniqueSummaries = [...new Map(summaries.map((job) => [job.id, job])).values()];
    const jobs = [];
    for (let start = 0; start < uniqueSummaries.length; start += 5) {
      const batch = uniqueSummaries.slice(start, start + 5).map((summary) => {
        const parsed = new URL(base); parsed.search = ""; parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/${encodeURIComponent(summary.id)}`;
        return this.requestJson(parsed.toString());
      });
      jobs.push(...await Promise.all(batch));
    }
    this.lastFetchStats = { jobsFound, uaeJobsFound: jobs.length };
    return jobs;
  }

  normalizeJob(raw) {
    const sections = raw.jobAd?.sections || {};
    return {
      sourceJobId: raw.id, sourceCompanyId: raw.company?.identifier || this.source.providerOrganizationId,
      title: raw.name, companyName: raw.company?.name || this.source.name, companyLogo: raw.company?.logoUrl,
      companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      companyDescription: sections.companyDescription?.text,
      description: [sections.jobDescription?.text, sections.qualifications?.text, sections.additionalInformation?.text].filter(Boolean).join("\n"),
      requirements: sections.qualifications?.text, location: [raw.location?.city, raw.location?.region, raw.location?.country].filter(Boolean).join(", "),
      country: raw.location?.country, employmentType: raw.typeOfEmployment?.label, experienceText: raw.experienceLevel?.label,
      category: raw.department?.label || raw.function?.label,
      applicationUrl: raw.applyUrl || raw.ref, sourceUrl: raw.ref || raw.applyUrl, postedAt: raw.releasedDate, raw,
    };
  }
}
