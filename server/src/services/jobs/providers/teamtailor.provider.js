import { XMLParser, XMLValidator } from "fast-xml-parser";
import { JobProvider } from "./base.provider.js";

const array = (value) => value == null ? [] : Array.isArray(value) ? value : [value];
const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true, parseTagValue: false });

export class TeamtailorJobProvider extends JobProvider {
  async fetchJobs() {
    const base = this.source.endpointUrl || `https://${this.source.providerOrganizationId}.teamtailor.com/jobs.rss`;
    const jobs = [];
    const seen = new Set();
    for (let offset = 0; offset < 10000; offset += 100) {
      const url = new URL(base); url.searchParams.set("offset", offset); url.searchParams.set("per_page", 100);
      const xml = await this.requestJson(url.toString(), { responseType: "text", headers: { Accept: "application/rss+xml, application/xml, text/xml" } });
      if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error("Invalid Teamtailor RSS response.");
      const channel = parser.parse(xml)?.rss?.channel;
      if (!channel) throw new Error("Teamtailor response did not contain an RSS channel.");
      const page = array(channel.item);
      for (const job of page) {
        const key = job.guid || job.link;
        if (!key || seen.has(key)) throw new Error("Teamtailor pagination returned repeated or missing job identities.");
        seen.add(key); jobs.push(job);
      }
      if (page.length < 100) return this.onlyUaeJobs(jobs);
    }
    throw new Error("Teamtailor pagination exceeded its safety limit.");
  }
  normalizeJob(raw) {
    return {
      sourceJobId: raw.guid || raw.link, sourceCompanyId: this.source.providerOrganizationId,
      title: raw.title, description: raw.description, companyName: this.source.name,
      companyWebsite: this.source.baseUrl, companyCareersUrl: this.source.careersUrl,
      location: array(raw.locations?.location).map((location) => [location.name, location.city, location.country].filter(Boolean).join(", ")).join(", "),
      workMode: raw.remoteStatus === "fully" ? "remote" : raw.remoteStatus === "hybrid" ? "hybrid" : "on-site",
      category: raw.department, applicationUrl: raw.link, sourceUrl: raw.link, postedAt: raw.pubDate, raw,
    };
  }
}
