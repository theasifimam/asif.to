import { JobProvider } from "./base.provider.js";

export class GreenhouseJobProvider extends JobProvider {
  async fetchJobs() {
    const id = this.source.providerOrganizationId;
    if (!id && !this.source.endpointUrl) throw new Error("Greenhouse board token is not configured.");
    const endpoint = this.source.endpointUrl || `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs?content=true`;
    const body = await this.requestJson(endpoint);
    if (!Array.isArray(body?.jobs)) throw new Error("Greenhouse response did not contain a jobs array.");
    return this.onlyUaeJobs(body.jobs.slice(0, 2000));
  }

  normalizeJob(raw) {
    const metadata = Object.fromEntries((raw.metadata || []).map((item) => [String(item.name || "").toLowerCase(), item.value]));
    return {
      sourceJobId: raw.id, sourceCompanyId: this.source.providerOrganizationId, title: raw.title,
      companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: raw.content, location: raw.location?.name || raw.offices?.map((item) => item.name).join(", "),
      category: raw.departments?.map((item) => item.name).join(", "), employmentType: metadata["employment type"] || metadata.commitment,
      workMode: metadata["workplace type"] || metadata["work mode"], experienceText: metadata.experience || metadata.seniority,
      applicationUrl: raw.absolute_url,
      sourceUrl: raw.absolute_url, postedAt: raw.first_published || raw.updated_at, raw,
    };
  }
}
