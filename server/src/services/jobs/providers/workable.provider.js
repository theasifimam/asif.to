import { JobProvider } from "./base.provider.js";

export class WorkableJobProvider extends JobProvider {
  async fetchJobs() {
    const id = this.source.providerOrganizationId;
    if (!id && !this.source.endpointUrl) throw new Error("Workable account subdomain is not configured.");
    const endpoint = this.source.endpointUrl || `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(id)}?details=true`;
    const body = await this.requestJson(endpoint);
    if (!Array.isArray(body?.jobs)) throw new Error("Workable response did not contain a jobs array.");
    const jobs = body.jobs.slice(0, 2000).map((job) => ({ ...job, _account: { name: body.name, description: body.description } }));
    return this.onlyUaeJobs(jobs);
  }

  normalizeJob(raw) {
    return {
      sourceJobId: raw.shortcode || raw.id, sourceCompanyId: this.source.providerOrganizationId, title: raw.title,
      companyName: raw._account?.name || this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      companyDescription: raw._account?.description, description: raw.description,
      requirements: raw.requirements, benefits: raw.benefits, location: raw.location?.location_str || raw.location || raw.city,
      country: raw.location?.country_code || raw.country, employmentType: raw.employment_type, workMode: raw.workplace || raw.location?.workplace_type,
      category: raw.department, applicationUrl: raw.application_url || raw.url, sourceUrl: raw.url || raw.application_url,
      postedAt: raw.created_at || raw.published_at, raw,
    };
  }
}
