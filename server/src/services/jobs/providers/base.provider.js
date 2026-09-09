import { normalizeUaeLocation } from "../jobNormalization.service.js";

export class JobProvider {
  constructor(source, { fetchImpl = globalThis.fetch, validateRemoteHost = true } = {}) {
    this.source = source;
    this.fetchImpl = fetchImpl;
    this.validateRemoteHost = validateRemoteHost;
  }

  async fetchJobs() {
    throw new Error("fetchJobs() must be implemented by the provider.");
  }

  normalizeJob(raw) {
    return raw;
  }

  onlyUaeJobs(rawJobs) {
    const jobs = rawJobs.filter((raw) => {
      try {
        const normalized = this.normalizeJob(raw);
        return Boolean(normalizeUaeLocation(normalized.location, normalized.country));
      } catch {
        return false;
      }
    });
    this.lastFetchStats = { jobsFound: rawJobs.length, uaeJobsFound: jobs.length };
    return jobs;
  }

  async requestJson(url, { headers = {}, retries = 2 } = {}) {
    const { assertSafeRemoteHost } = await import("../../../utils/jobValidation.js");
    const endpoint = this.validateRemoteHost ? await assertSafeRemoteHost(url) : url;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.fetchImpl(endpoint, {
          headers: { Accept: "application/json", "User-Agent": "asif.to-jobs-importer/1.0", ...headers },
          redirect: "error", signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) {
          const error = new Error(`Source returned HTTP ${response.status}.`); error.statusCode = response.status; throw error;
        }
        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt >= retries || ![429, 500, 502, 503, 504].includes(error.statusCode)) break;
        await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      }
    }
    throw lastError;
  }
}
