import { JobProvider } from "./base.provider.js";

const getPath = (value, path) => {
  if (!path) return value;
  return String(path).split(".").filter(Boolean).reduce((current, key) => current?.[key], value);
};

const mapped = (raw, mapping, key, fallbacks = []) => {
  const path = mapping?.[key];
  if (path) return getPath(raw, path);
  for (const fallback of fallbacks) {
    const value = getPath(raw, fallback);
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

export class GenericApiJobProvider extends JobProvider {
  async fetchJobs() {
    const headers = { Accept: "application/json", "User-Agent": "asif.to-jobs-importer/1.0" };
    if (this.source.credentialEnvKey) {
      const secret = process.env[this.source.credentialEnvKey];
      if (!secret) throw new Error(`Credential environment variable ${this.source.credentialEnvKey} is not configured.`);
      headers.Authorization = secret.startsWith("Bearer ") ? secret : `Bearer ${secret}`;
    }
    const body = await this.requestJson(this.source.endpointUrl, { headers });
    const jobs = getPath(body, this.source.jobsPath) ?? body?.jobs ?? body?.data ?? body;
    if (!Array.isArray(jobs)) throw new Error("The configured jobs path did not resolve to an array.");
    return jobs.slice(0, 2000);
  }

  normalizeJob(raw) {
    const mapping = this.source.fieldMapping || {};
    return {
      sourceJobId: mapped(raw, mapping, "sourceJobId", ["id", "jobId", "externalId"]),
      title: mapped(raw, mapping, "title", ["title", "name", "position"]),
      companyName: mapped(raw, mapping, "companyName", ["company.name", "company", "organization.name"]),
      companyLogo: mapped(raw, mapping, "companyLogo", ["company.logo", "companyLogo", "logo"]),
      companyWebsite: mapped(raw, mapping, "companyWebsite", ["company.website", "website"]),
      companyCareersUrl: mapped(raw, mapping, "companyCareersUrl", ["company.careersUrl", "careersUrl"]),
      companyDescription: mapped(raw, mapping, "companyDescription", ["company.description"]),
      companyHeadquarters: mapped(raw, mapping, "companyHeadquarters", ["company.headquarters"]),
      sourceCompanyId: mapped(raw, mapping, "sourceCompanyId", ["company.id", "organization.id"]),
      description: mapped(raw, mapping, "description", ["description", "content", "body"]),
      responsibilities: mapped(raw, mapping, "responsibilities", ["responsibilities"]),
      requirements: mapped(raw, mapping, "requirements", ["requirements", "qualifications"]),
      benefits: mapped(raw, mapping, "benefits", ["benefits"]),
      skills: mapped(raw, mapping, "skills", ["skills", "tags"]),
      category: mapped(raw, mapping, "category", ["category", "department"]),
      location: mapped(raw, mapping, "location", ["location.name", "location", "city"]),
      emirate: mapped(raw, mapping, "emirate", ["emirate", "state"]),
      employmentType: mapped(raw, mapping, "employmentType", ["employmentType", "type"]),
      workMode: mapped(raw, mapping, "workMode", ["workMode", "workplaceType"]),
      experienceLevel: mapped(raw, mapping, "experienceLevel", ["experienceLevel", "seniority"]),
      experienceText: mapped(raw, mapping, "experienceText", ["experienceText", "experience", "requirements.experience"]),
      minimumSalary: mapped(raw, mapping, "minimumSalary", ["salary.min", "minimumSalary"]),
      maximumSalary: mapped(raw, mapping, "maximumSalary", ["salary.max", "maximumSalary"]),
      salaryPeriod: mapped(raw, mapping, "salaryPeriod", ["salary.period", "salaryPeriod"]),
      salaryCurrency: mapped(raw, mapping, "salaryCurrency", ["salary.currency", "salaryCurrency"]),
      salaryText: mapped(raw, mapping, "salaryText", ["salary.text", "salaryText"]),
      country: mapped(raw, mapping, "country", ["location.country", "country"]),
      applicationUrl: mapped(raw, mapping, "applicationUrl", ["applicationUrl", "applyUrl", "url"]),
      sourceUrl: mapped(raw, mapping, "sourceUrl", ["sourceUrl", "url"]),
      postedAt: mapped(raw, mapping, "postedAt", ["postedAt", "publishedAt", "createdAt"]),
      expiresAt: mapped(raw, mapping, "expiresAt", ["expiresAt", "validThrough", "deadline"]),
      raw,
    };
  }
}
