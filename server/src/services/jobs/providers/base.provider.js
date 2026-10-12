import { normalizeRegionLocation } from "../jobNormalization.service.js";

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

  // Despite the historical name this keeps jobs in every accepted country (the GCC by default,
  // narrowed by JOB_COUNTRIES). `uaeJobsFound` in lastFetchStats therefore means "in-scope jobs".
  onlyUaeJobs(rawJobs) {
    const jobs = rawJobs.filter((raw) => {
      try {
        const normalized = this.normalizeJob(raw);
        return Boolean(normalizeRegionLocation(normalized.location, normalized.country));
      } catch {
        return false;
      }
    });
    this.lastFetchStats = { jobsFound: rawJobs.length, uaeJobsFound: jobs.length };
    return jobs;
  }

  /**
   * GETs a page as text for the crawler. Unlike requestJson it follows redirects, but only within the same site
   * (www and non-www count as one), only over HTTPS, and re-checks every hop; the body is capped at `maxBytes`.
   * Returns `{ status, url, text }`; throws with `statusCode` on a non-2xx answer.
   */
  async requestText(url, { maxBytes = 2_000_000, maxRedirects = 3, accept = "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8" } = {}) {
    const { assertSafeRemoteHost } = await import("../../../utils/jobValidation.js");
    const site = (value) => new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    const origin = site(url);
    let current = url;
    for (let hop = 0; hop <= maxRedirects; hop += 1) {
      const endpoint = this.validateRemoteHost ? await assertSafeRemoteHost(current) : current;
      const response = await this.fetchImpl(endpoint, {
        headers: { Accept: accept, "User-Agent": "asif.to-jobs-importer/1.0 (+https://asif.to/jobs)" },
        redirect: "manual", signal: AbortSignal.timeout(20_000),
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers?.get?.("location");
        const next = location ? new URL(location, current) : null;
        if (!next || next.protocol !== "https:" || site(next.href) !== origin) throw Object.assign(new Error("The page redirected somewhere other than its own site."), { statusCode: response.status });
        current = next.href;
        continue;
      }
      if (!response.ok) throw Object.assign(new Error(`Source returned HTTP ${response.status}.`), { statusCode: response.status });
      let body = "";
      if (response.body?.getReader) {
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let received = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.byteLength; body += decoder.decode(value, { stream: true });
          if (received > maxBytes) { await reader.cancel(); break; } // an oversized page is truncated, never buffered whole
        }
      } else body = (await response.text()).slice(0, maxBytes);
      return { status: response.status, url: current, text: body };
    }
    throw Object.assign(new Error("Too many redirects."), { statusCode: 310 });
  }

  async requestJson(url, { headers = {}, retries = 2, responseType = "json", method = "GET", body } = {}) {
    const { assertSafeRemoteHost } = await import("../../../utils/jobValidation.js");
    const endpoint = this.validateRemoteHost ? await assertSafeRemoteHost(url) : url;
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await this.fetchImpl(endpoint, {
          method,
          // A JSON body is only ever sent to search endpoints that require POST (Workday); never credentials.
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
          headers: { Accept: "application/json", "User-Agent": "asif.to-jobs-importer/1.0", ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
          redirect: "error", signal: AbortSignal.timeout(20_000),
        });
        if (!response.ok) {
          const error = new Error(`Source returned HTTP ${response.status}.`);
          error.statusCode = response.status;
          const retryAfter = response.headers?.get?.("retry-after");
          if (retryAfter) error.retryAfterMs = /^\d+$/.test(retryAfter) ? Number(retryAfter) * 1000 : Math.max(0, Date.parse(retryAfter) - Date.now());
          throw error;
        }
        return responseType === "text" ? await response.text() : await response.json();
      } catch (error) {
        lastError = error;
        if (attempt >= retries || ![429, 500, 502, 503, 504].includes(error.statusCode)) break;
        const retryDelay = Math.max(1000 * 2 ** attempt, error.retryAfterMs || 0);
        // Longer cooldowns are left to the next scheduled run, never shortened.
        if (retryDelay > 60_000) break;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
    throw lastError;
  }
}
