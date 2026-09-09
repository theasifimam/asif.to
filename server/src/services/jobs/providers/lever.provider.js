import { JobProvider } from "./base.provider.js";

export class LeverJobProvider extends JobProvider {
  async fetchJobs() {
    const id = this.source.providerOrganizationId;
    if (!id && !this.source.endpointUrl) throw new Error("Lever site identifier is not configured.");
    const host = this.source.providerRegion === "eu" ? "api.eu.lever.co" : "api.lever.co";
    const base = this.source.endpointUrl || `https://${host}/v0/postings/${encodeURIComponent(id)}`;
    const jobs = [];
    for (let skip = 0; skip < 5000; skip += 100) {
      const separator = base.includes("?") ? "&" : "?";
      const page = await this.requestJson(`${base}${separator}mode=json&limit=100&skip=${skip}`);
      if (!Array.isArray(page)) throw new Error("Lever response was not an array.");
      jobs.push(...page); if (page.length < 100) break;
    }
    return this.onlyUaeJobs(jobs);
  }

  normalizeJob(raw) {
    const sections = (raw.lists || []).map((item) => `<h3>${item.text || ""}</h3>${item.content || ""}`).join("");
    return {
      sourceJobId: raw.id, sourceCompanyId: this.source.providerOrganizationId, title: raw.text,
      companyName: this.source.name, companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      description: [raw.description, sections, raw.additional].filter(Boolean).join("\n"),
      requirements: raw.lists?.flatMap((item) => item.content || []), category: raw.categories?.team || raw.categories?.department,
      location: raw.categories?.location || raw.categories?.allLocations?.join(", "), employmentType: raw.categories?.commitment,
      workMode: raw.workplaceType, applicationUrl: raw.applyUrl || raw.hostedUrl, sourceUrl: raw.hostedUrl,
      postedAt: raw.createdAt ? new Date(raw.createdAt) : null, raw,
    };
  }
}
