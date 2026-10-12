import { JobProvider } from "./base.provider.js";
import { allowAll, disallowAll, parseRobots } from "../crawl/robots.js";
import { looksLikeXml, parseSitemap } from "../crawl/sitemap.js";
import { findJobPostings, mapJobPosting } from "../crawl/jsonld.js";

// Reads job postings straight from an employer's own career site, using the schema.org JobPosting markup
// that Google for Jobs requires of every site that wants its jobs listed. The source's `endpointUrl` is a
// sitemap (or sitemap index) listing the job pages, or a page that links to them; `jobsPath` optionally
// limits which URLs count as job pages (a substring of path + query, e.g. "/job/").
//
// A polite crawler: robots.txt is honoured (disallowed paths are never fetched, Crawl-delay is respected),
// requests are few and spaced out, only pages on the source's own site are read, and no login, captcha or
// bot protection is ever worked around. Responses are capped in size and pages are never cached.

const intFromEnv = (name, fallback) => { const value = parseInt(process.env[name] ?? "", 10); return Number.isFinite(value) && value >= 0 ? value : fallback; };
const sleep = (ms) => (ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve());
const siteOf = (value) => new URL(value).hostname.toLowerCase().replace(/^www\./, "");
const JOB_LINK = /(job|career|vacanc|position|opening|opportunit|requisition)/i;
const NOT_A_PAGE = /\.(?:css|js|json|png|jpe?g|gif|svg|webp|ico|pdf|zip|xml|woff2?|mp4)(?:\?|$)/i;

export function extractLinks(html, baseUrl) {
  const links = new Set();
  for (const match of String(html).matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)[^"']*["']/gi)) {
    try { const url = new URL(match[1].replace(/&amp;/g, "&"), baseUrl); if (url.protocol === "https:") { url.hash = ""; links.add(url.href); } } catch { /* Not a URL. */ }
  }
  return [...links];
}

export class JsonLdJobProvider extends JobProvider {
  async fetchJobs() {
    const entry = this.entryUrl();
    const limits = {
      maxUrls: intFromEnv("JOB_JSONLD_MAX_URLS", 1500), maxSitemaps: intFromEnv("JOB_JSONLD_MAX_SITEMAPS", 25),
      maxBytes: intFromEnv("JOB_JSONLD_MAX_PAGE_BYTES", 2_000_000), delay: intFromEnv("JOB_JSONLD_DELAY_MS", 500),
    };
    const robots = await this.loadRobots(entry);
    const delayMs = Math.min(10_000, Math.max(limits.delay, (robots.crawlDelay || 0) * 1000));
    const { pageUrls, direct } = await this.discover(entry, robots, limits);

    const mapped = [...direct];
    let failed = 0; let notFound = 0; let skippedByRobots = 0; let index = 0;
    await Promise.all(Array.from({ length: 2 }, async () => {
      while (index < pageUrls.length) {
        const url = pageUrls[index++];
        if (!this.allowed(robots, url)) { skippedByRobots += 1; continue; }
        try {
          const page = await this.requestText(url, { maxBytes: limits.maxBytes });
          for (const posting of findJobPostings(page.text)) { const job = mapJobPosting(posting, page.url); if (job) mapped.push(job); }
        } catch (error) {
          // A page that is gone is a removed job; anything else is a failure we must not mistake for removals.
          if ([404, 410].includes(error.statusCode)) notFound += 1; else failed += 1;
        }
        await sleep(delayMs);
      }
    }));
    // A crawl that mostly failed would otherwise read as "every job was removed" and expire them.
    if (pageUrls.length && failed > Math.max(2, pageUrls.length * 0.2)) {
      throw new Error(`${failed} of ${pageUrls.length} job pages could not be read; keeping existing jobs.`);
    }
    const unique = [...new Map(mapped.map((job) => [job.sourceJobId, { ...job, companyName: job.companyName || this.source.name }])).values()];
    this.crawlStats = { urls: pageUrls.length, postings: unique.length, failed, notFound, skippedByRobots };
    return this.onlyUaeJobs(unique);
  }

  entryUrl() {
    let url;
    try { url = new URL(this.source.endpointUrl); } catch { throw new Error("A sitemap or careers page URL (endpointUrl) is required."); }
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("The crawl URL must be a plain https:// address.");
    return url.href;
  }

  allowed(robots, url) { const parsed = new URL(url); return robots.isAllowed(`${parsed.pathname}${parsed.search}`); }

  async loadRobots(entry) {
    const robotsUrl = new URL("/robots.txt", entry).href;
    try {
      const { text } = await this.requestText(robotsUrl, { maxBytes: 500_000, accept: "text/plain,*/*;q=0.5" });
      return parseRobots(text);
    } catch (error) {
      if ([404, 410].includes(error.statusCode)) return allowAll();
      if ([401, 403].includes(error.statusCode)) return disallowAll(); // a forbidden robots.txt means "keep out"
      throw new Error(`robots.txt could not be read (${error.message}); not crawling.`);
    }
  }

  /** Finds the job-page URLs (and any postings embedded on a listing page) starting from the entry URL. */
  async discover(entry, robots, limits) {
    const home = siteOf(entry); const filter = String(this.source.jobsPath || "").toLowerCase();
    const wanted = (url) => { try { const u = new URL(url); return siteOf(url) === home && u.protocol === "https:" && !NOT_A_PAGE.test(u.pathname) && (!filter || `${u.pathname}${u.search}`.toLowerCase().includes(filter)); } catch { return false; } };
    const documents = [entry]; const seenDocs = new Set(); const found = new Map(); const direct = [];
    const run = async (queue) => {
      while (queue.length && seenDocs.size < limits.maxSitemaps) {
        const url = queue.shift();
        if (seenDocs.has(url) || !this.allowed(robots, url)) continue;
        seenDocs.add(url);
        const page = await this.requestText(url, { maxBytes: Math.max(limits.maxBytes, 10_000_000) });
        if (looksLikeXml(page.text)) {
          const { sitemaps, urls } = parseSitemap(page.text);
          for (const child of sitemaps) if (siteOf(child) === home) queue.push(child);
          for (const item of urls) if (wanted(item.loc)) found.set(item.loc, item.lastmod || "");
        } else {
          // A listing page: it may embed the postings itself, and links to the individual job pages.
          for (const posting of findJobPostings(page.text)) { const job = mapJobPosting(posting, page.url); if (job) direct.push(job); }
          for (const link of extractLinks(page.text, page.url)) if (wanted(link) && (filter || JOB_LINK.test(new URL(link).pathname)) && link !== page.url) found.set(link, "");
        }
      }
    };
    await run(documents);
    if (!found.size && !direct.length && robots.sitemaps.length) await run(robots.sitemaps.filter((url) => siteOf(url) === home));
    // Newest first, then a hard stop: a partial crawl must fail loudly rather than expire the jobs it never reached.
    const pageUrls = [...found.entries()].sort((a, b) => String(b[1]).localeCompare(String(a[1]))).map(([url]) => url);
    if (pageUrls.length > limits.maxUrls) {
      throw new Error(`${pageUrls.length} job URLs exceed the limit of ${limits.maxUrls}; narrow "jobsPath" or raise JOB_JSONLD_MAX_URLS.`);
    }
    return { pageUrls, direct };
  }
}
