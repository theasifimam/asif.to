// Career sites crawled for schema.org JobPosting JSON-LD (source type "jsonld"). Each entry needs the sitemap
// (or careers page) as `endpointUrl` and, when the sitemap also lists non-job pages, a `jobsPath` substring.
// Check a site first with `npm run find:jsonld-sources -- --urls=<careers URL>`; register it only if robots.txt
// allows crawling, it has JobPosting markup and a useful Gulf share. `npm run seed:job-sources -- --verify`
// inserts these disabled and enables the ones that currently return Gulf jobs.
//
//   { name: "Example Group", slug: "jsonld-example", type: "jsonld",
//     endpointUrl: "https://careers.example.com/sitemap.xml", jobsPath: "/job/",
//     careersUrl: "https://careers.example.com", baseUrl: "https://example.com",
//     syncFrequency: "daily", syncIntervalHours: 24 },
//
// Left empty on purpose: no site has been registered yet. Sites can also be added in the admin
// (Job sources > type "Career site crawler").
export const JSONLD_JOB_SOURCE_DEFINITIONS = [];
