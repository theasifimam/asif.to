import { JobProvider } from "./base.provider.js";

export class PinpointJobProvider extends JobProvider {
  async fetchJobs() {
    const body = await this.requestJson(this.source.endpointUrl || `https://${this.source.providerOrganizationId}.pinpointhq.com/postings.json`);
    if (!Array.isArray(body?.data)) throw new Error("Pinpoint response did not contain postings data.");
    return this.onlyUaeJobs(body.data);
  }
  normalizeJob(raw) {
    return {
      sourceJobId: raw.id, sourceCompanyId: this.source.providerOrganizationId, title: raw.title,
      companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: [raw.description, raw.key_responsibilities, raw.skills_knowledge_expertise, raw.benefits].filter(Boolean).join("\n"),
      requirements: raw.skills_knowledge_expertise, benefits: raw.benefits,
      location: [raw.location?.city, raw.location?.province, raw.location?.name].filter(Boolean).join(", "), country: raw.location?.country,
      category: raw.job?.department?.name, employmentType: raw.employment_type_text || raw.employment_type, workMode: raw.workplace_type,
      applicationUrl: raw.url, sourceUrl: raw.url, postedAt: raw.published_at, expiresAt: raw.deadline_at,
      minimumSalary: raw.compensation_visible ? raw.compensation_minimum : undefined, maximumSalary: raw.compensation_visible ? raw.compensation_maximum : undefined,
      salaryCurrency: raw.compensation_currency, salaryPeriod: raw.compensation_frequency, raw,
    };
  }
}
