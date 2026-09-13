import { JobProvider } from "./base.provider.js";

export class RecruiteeJobProvider extends JobProvider {
  async fetchJobs() {
    const body = await this.requestJson(this.source.endpointUrl || `https://${this.source.providerOrganizationId}.recruitee.com/api/offers/`);
    if (!Array.isArray(body?.offers)) throw new Error("Recruitee response did not contain offers.");
    return this.onlyUaeJobs(body.offers.filter((job) => (!job.status || job.status === "published") && job.kind !== "talent_pool"));
  }
  normalizeJob(raw) {
    return {
      sourceJobId: raw.id || raw.guid, sourceCompanyId: this.source.providerOrganizationId, title: raw.title,
      companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: [raw.description, raw.requirements].filter(Boolean).join("\n"), requirements: raw.requirements,
      location: [raw.location, raw.city, ...(raw.locations || []).map((location) => [location.city, location.name, location.country].filter(Boolean).join(", "))].filter(Boolean).join(", "), country: raw.country_code || raw.country,
      employmentType: String(raw.employment_type_code || "").replace("fulltime", "full-time").replace("parttime", "part-time"),
      workMode: raw.remote ? "remote" : raw.hybrid ? "hybrid" : raw.on_site ? "on-site" : "",
      category: raw.department, experienceText: raw.experience_code,
      applicationUrl: raw.careers_apply_url || raw.careers_url, sourceUrl: raw.careers_url,
      postedAt: raw.published_at || raw.created_at, expiresAt: raw.close_at,
      minimumSalary: raw.salary?.min, maximumSalary: raw.salary?.max, salaryCurrency: raw.salary?.currency, salaryPeriod: raw.salary?.period, raw,
    };
  }
}
