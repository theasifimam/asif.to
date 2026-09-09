import { JobProvider } from "./base.provider.js";

export class AshbyJobProvider extends JobProvider {
  async fetchJobs() {
    const id = this.source.providerOrganizationId;
    if (!id && !this.source.endpointUrl) throw new Error("Ashby organization identifier is not configured.");
    const endpoint = this.source.endpointUrl || `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}`;
    const body = await this.requestJson(endpoint);
    if (!Array.isArray(body?.jobs)) throw new Error("Ashby response did not contain a jobs array.");
    return this.onlyUaeJobs(body.jobs.filter((job) => job.isListed !== false).slice(0, 2000));
  }

  normalizeJob(raw) {
    const secondaryLocations = (raw.secondaryLocations || []).map((item) => item.location || item.name).filter(Boolean);
    const country = raw.address?.postalAddress?.addressCountry;
    return {
      sourceJobId: raw.id, sourceCompanyId: this.source.providerOrganizationId, title: raw.title,
      companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: raw.descriptionHtml || raw.descriptionPlain,
      location: [raw.location, ...secondaryLocations].filter(Boolean).join(", "), country,
      category: raw.department || raw.team, employmentType: raw.employmentType,
      workMode: raw.workplaceType || (raw.isRemote ? "remote" : ""), applicationUrl: raw.applyUrl || raw.jobUrl,
      sourceUrl: raw.jobUrl || raw.applyUrl, postedAt: raw.publishedAt, raw,
    };
  }
}
