# Jobs module

The Jobs module covers the Gulf (UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman; see "Country scope"). It uses the existing Express/Mongoose API, asif.to user sessions, admin permissions, public layout, analytics, and private CV storage. Automated ingestion extends those existing paths; it does not expose application destinations before authentication or create a parallel jobs system.

## Deployment

Run the idempotent migration after deploying the API:

```powershell
cd server
npm run migrate:jobs
```

It synchronizes indexes for companies, jobs, job sources, sync logs, applications, saves, and events; backfills company match keys and job origins; updates role permissions; and ensures the Manual source exists.

The optional demo seed remains development-only:

```powershell
npm run seed:jobs-demo
```

Those fictional records are clearly marked `isDemo`, use `example.com`, and are excluded from indexability counts.

## Environment

- `JOB_SYNC_ENABLED=true` enables background due-source checks every 15 minutes. Each source controls its own interval (6–168 hours; 12 by default).
- `JOB_DEFAULT_PUBLIC_SOURCES_ENABLED=true` bootstraps the curated, credential-free public Careem (Greenhouse), Turner & Townsend (SmartRecruiters), and Foodics (Workable) feeds. Set it to `false` to opt out. Once created, admin enable/disable and publication settings are never reset on restart.
- `JOB_SOURCE_REGISTRY_JSON=[]` optionally contains source definitions consumed by `npm run seed:job-sources`. This command registers configuration but does not fetch or publish jobs.
- Provider secrets stay in deployment secrets or `server/.env`. A source stores only a `credentialEnvKey`, such as `JOBS_VENDOR_API_TOKEN`, never the credential value.
- Existing `MONGO_URI`, `JWT_SECRET`, `AUTH_INTERNAL_SECRET`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STORAGE_URL`, and admin `NEXT_PUBLIC_WEB_URL` settings still apply.

Example source registry entry:

```json
[
  {
    "name": "Example Company",
    "type": "greenhouse",
    "providerOrganizationId": "example-board-token",
    "careersUrl": "https://example.com/careers",
    "enabled": true,
    "trusted": false,
    "autoPublish": false,
    "syncFrequency": "daily",
    "syncIntervalHours": 12,
    "qualityThreshold": 90
  }
]
```

Do not put credentials in that JSON. The three curated public sources above are registered automatically; no fake production jobs are seeded.

The UAE source registry contains 50 explicitly resolved public ATS boards (24 Lever, 8 SmartRecruiters, 13 Greenhouse, and 5 Ashby). Seed it idempotently with:

```powershell
cd server
npm run seed:job-sources
```

New registry sources are inserted disabled. To verify newly inserted endpoints and enable only boards that currently return normalized UAE jobs, run `npm run seed:job-sources -- --verify`. Existing admin enable/disable choices and intervals are preserved on later seed runs. `npm run verify:job-sources` refreshes verification metadata and disables sources that are unavailable or no longer return UAE jobs; it does not re-enable a source an admin deliberately disabled.

Verification statuses are `Verified`, `No UAE Jobs Currently`, `Source Unavailable`, `Requires Review`, `Provider Changed`, and `Blocked`. Verification uses only the public ATS endpoints, follows no redirects, supplies no credentials, and does not attempt to bypass access controls.

## Ingestion behavior

The pipeline is:

`fetchJobs()` → `normalizeJob()` → UAE validation → company resolution → classification → quality scoring → deduplication → `upsertJob()` → admin moderation.

Public adapters are implemented for Greenhouse, Lever, SmartRecruiters, Workable, and Ashby. Public company career JSON feeds use the generic mapped adapter. Remote requests are bounded, retried only for transient responses, checked against private-network targets, and never attempt to bypass CAPTCHA, authentication, Cloudflare, or bot restrictions.

Locations, category, employment type, work mode, experience, and explicit AED salary data are mapped to the existing public filters. Imported HTML is reduced to safe paragraphs, headings, lists, and emphasis with all attributes and active/embedded content removed.

Jobs record `creationOrigin` separately from public `status`, plus provider/source identifiers, import status, quality details, first import, last sync/seen, and source-removal state. Companies record the same origin/source context and match by provider organization ID, website domain, normalized legal name, then exact name.

Deduplication checks provider/source job ID, normalized application URL, then the normalized company/title/location/employment fingerprint. Exact identities update in place. Uncertain cross-source matches are held as pending duplicate-review records and do not auto-publish.

Trusted sources auto-publish only when the source enables auto publishing, validation passes, the record is not a duplicate, and the quality threshold is met. All other valid records enter pending review. A job missing from two successful syncs becomes `source_removed`; a published job then expires unless an admin protected its status. Historical jobs are never auto-deleted.

Admin edits protect only fields whose normalized values actually changed. Those `overrideFields` are skipped by later syncs. Bulk status and featured actions protect their respective fields as well. Every stored imported job remains editable, hideable, archivable, and deletable in the existing Jobs admin.

Each run writes a compact `JobSyncLog` with fetched, created, updated, unchanged, rejected, duplicate, error, and source-removal counts, plus at most 25 concise errors. Large raw responses are not retained.

## Country scope

Imports accept jobs in the six GCC countries. `JOB_COUNTRIES` (comma-separated ISO codes, default all six) narrows that; `JOB_COUNTRIES=AE` restores UAE-only imports. `normalizeRegionLocation()` resolves a provider location to `{ location, country, region }` (city rules first, then country names, then a provider-supplied ISO code); a posting outside the accepted countries is rejected with `unsupported_location`. `Job.country` is the ISO code and `Job.emirate` holds the city-level region label.

- **Salaries are AED-only.** A job outside the UAE never gets a salary figure: the provider amount carries no trustworthy currency, and salary filters and insights are AED. Salary insights stay `country: AE`.
- **API.** `GET /jobs` takes `?country=` (ISO code or slug such as `saudi-arabia`); without it, or with `gulf`/`all`, every accepted country is returned. `/jobs/taxonomy` returns `countries` with live counts and each location's `country`. `/jobs/sitemap` returns the `countries` that have enough jobs (20+) to be listed.
- **Web.** `/jobs`, `/jobs/category/*` and `/jobs/tech` stay UAE-only so their wording and search rankings are unchanged. `/jobs/country/<slug>` covers one other country, `/jobs/country/gulf` covers all of them, and `/jobs/location/<city>` reads its country from the city's jobs. A country-chip row (`JobCountryTabs`) links between them. `lib/jobs.js` `jobPlace()` writes "Riyadh, Saudi Arabia" / "Dubai, UAE".
- **Existing sources** pick up their non-UAE postings on the next sync; nothing is re-imported. `npm run preview:job-yield` shows beforehand what each enabled source would contribute per country (read-only).

## Workday

Many of the largest Gulf employers publish on Workday, which has no per-company board token like the other ATS platforms. A Workday source's `providerOrganizationId` is `tenant/wdN/site` (for `https://mastercard.wd1.myworkdayjobs.com/en-US/CorporateCareers` that is `mastercard/wd1/CorporateCareers`); `detectJobBoard()` extracts it from any career or job URL. `providers/workday.provider.js` uses the public CxS API that each career site's own search page calls:

1. `POST https://{tenant}.{wdN}.myworkdayjobs.com/wday/cxs/{tenant}/{site}/jobs` once per Gulf search term (country names and main cities of the countries in `JOB_COUNTRIES`), 20 postings per page. Workday has no portable country filter and its search is free text over the whole posting, so the result list is only a candidate set.
2. Postings are kept when their location text is in scope, or says only "N Locations" (which needs the detail to tell).
3. `GET` each kept posting (5 at a time) for the full description, `startDate` (used as the posted date; the relative "Posted 3 Days Ago" text is not), country and public URL; the full location check, including additional locations, then decides.

The host is always built from the validated `tenant`/`wdN`/`site` parts and only `/job/...` paths from responses are followed, so a source cannot point the importer elsewhere. Limits: `JOB_WORKDAY_MAX_PER_SEARCH` (400 postings per term) and `JOB_WORKDAY_MAX_JOBS` (1,500 detail fetches per sync).

Because a site name cannot be derived from a company name, boards are found with `npm run find:workday-boards` (read-only, no database): it tests the guesses in `workdayCandidates.js`, or known career URLs with `-- --urls=...`, and prints boards that exist and have Gulf jobs. Add those to `workdaySourceRegistry.js`; `npm run seed:job-sources -- --verify` registers them and enables the ones that return jobs.

## Career-site crawler (JSON-LD)

For employers that are not on a supported ATS, `providers/jsonld.provider.js` (source type `jsonld`) reads the schema.org `JobPosting` markup that Google for Jobs requires of every site that wants its jobs listed. A source needs:

- `endpointUrl`: a sitemap or sitemap index listing the job pages (or a careers page that links to them; if it yields nothing the sitemaps named in `robots.txt` are tried).
- `jobsPath` (optional): a substring of the URL path that identifies job pages, such as `/job/`. Set it on any site whose sitemap also lists non-job pages.

How it behaves, so it can be defended to a site owner:

- **robots.txt is law.** Disallowed paths are never fetched; `Crawl-delay` is respected (capped at 10s); a `403` robots.txt is read as "keep out", a missing one allows everything, and one that cannot be read at all stops the crawl.
- **Gentle.** Two requests at a time, at least `JOB_JSONLD_DELAY_MS` (500) between them, an honest user agent (`asif.to-jobs-importer/1.0 (+https://asif.to/jobs)`), bodies capped at `JOB_JSONLD_MAX_PAGE_BYTES` (2 MB), nothing cached. Source `syncIntervalHours` of 24 or more is recommended.
- **Same site only.** Sitemap entries, links and redirects must stay on the source's own host (www and non-www are one site) and use HTTPS. XML with DOCTYPE/entities is refused. Nothing is ever done about logins, captchas or bot protection.
- **Fails safe.** If more than 20% of job pages cannot be read, or the sitemap holds more than `JOB_JSONLD_MAX_URLS` (1,500) job URLs, the sync fails and keeps the existing jobs instead of reading a half-crawl as "everything was removed" (which would expire them). A page that returns 404/410 is a removed job. Closed postings (`validThrough` in the past) are skipped.
- **Attribution.** The apply link is the employer's own page, behind the existing authenticated apply endpoint, like every other source.

`JobPosting` fields map as: `title`, `description` (HTML is sanitised), `identifier` (or the page path) as the job id, `datePosted`, `validThrough` as expiry, `employmentType`, `jobLocation`/`jobLocationType`/`applicantLocationRequirements` as location and remote work, `hiringOrganization` as the employer, and `baseSalary` (hourly, daily, monthly, yearly) as salary. Gulf location filtering and AED-only salaries work as for every other source.

A crawl visits every job page on each sync, so use it for sites whose sitemap is mostly Gulf jobs. Check a site first with `npm run find:jsonld-sources -- --urls=<careers URLs>` (read-only, no database): it reports whether robots.txt allows crawling, which path holds the jobs, what share of a sample is in the Gulf, and an estimate of Gulf jobs. Register worthwhile sites in the admin (type "Career site crawler") or in `jsonldSourceRegistry.js`.

## Publishing policy

`jobPublishPolicy.js` decides each import's status: a valid record from a source with `autoPublish` and `trusted` publishes once it reaches the source's `qualityThreshold`; any other valid record of at least 70 waits in the review queue; the rest are rejected. New registry and discovery sources are created trusted with auto-publish on, so nothing needs a person. `JOB_AUTO_PUBLISH=false` is the emergency brake that sends every import to review. `npm run jobs:publish-pending` (dry run; `-- --apply` to act; `-- --include-review-first` also promotes enabled public-ATS sources still set to review-first) clears a backlog without touching admin-changed statuses, possible duplicates or expired jobs.

## Sync worker

Due sources are synced oldest-first through a bounded pool (`JOB_SYNC_CONCURRENCY`, default 6) with a per-provider cap (`JOB_SYNC_PER_PROVIDER`, default 2) because boards of one ATS share rate limits. A tick starts at most `JOB_SYNC_MAX_PER_TICK` sources and stops starting new ones after `JOB_SYNC_TICK_MINUTES`; the remainder stays due for the next 15-minute tick. Ticks never overlap. Each tick logs `synced / failed / deferred`.

## Measuring the pipeline

`npm run report:jobs` is a read-only baseline: active jobs by country, provider, location and category; why jobs are pending; source health, overdue and failing sources; sync success in the last 24 hours and 7 days; and discovery results. `-- --json` writes it as JSON for before/after comparison and `-- --target=N` sets the active-job target the gap is measured against. It never writes and never builds indexes.

## Adding another provider

Create a `JobProvider` adapter in `server/src/services/jobs/providers/`, implement bounded `fetchJobs()` and source-specific `normalizeJob()`, and register it in `providers/index.js`. Use the shared safe JSON request helper, return the common normalized shape, add mocked response tests, and keep all credentials server-side.

## Authentication and authorization

The current permissions remain authoritative: `jobs.view`, `jobs.manage`, `jobs.delete`, `job_sources.manage`, and `job_applications.review`. External application URLs remain absent from public payloads. The existing protected apply endpoint records the click and only then returns the ATS/company destination. Internal CVs remain private and duplicate applications retain the existing unique user/job constraint.

## Finding new companies (discovery)

Syncing only refreshes sources that already exist; **company discovery** is what adds new ones. Every `DISCOVERY_INTERVAL_HOURS` (6 by default) it:

1. Recycles signals already in the platform (jobs from non-ATS sources, existing sources).
2. Runs the **ATS board prober** (`atsBoardProbe.service.js`): turns names from `uaeCompanySeeds.js`, plus any company we hold without a source, into candidate board IDs and keeps those that exist on the public Greenhouse, Lever, Ashby, SmartRecruiters or Workable APIs. A rolling cursor (`DiscoveryState`, key `atsProbeCursor`) covers the full list across runs; a provider returning HTTP 429 is skipped for the rest of that run.
3. De-duplicates against every existing source and company, verifies the board has real UAE jobs, then creates the company and source and runs the first sync.

To widen the search, add employer names to `server/src/services/jobs/gccCompanySeeds.js` (Gulf-wide; `uaeCompanySeeds.js` holds the original UAE list and both feed the prober). A run that reports `candidatesDiscovered: 0` and only `skippedDuplicates` means the list is exhausted, so add more names. Tuning: `DISCOVERY_PROBE_BATCH`, `DISCOVERY_PROBE_CONCURRENCY`, `DISCOVERY_MAX_VERIFICATIONS_PER_RUN`.

## Job insights (dates, salary, skills, learning links)

- **Honest dates.** `postedAtSource` is `provider` when the source published a date and `first_seen` when it did not; the UI words the latter "Added ..." and a first-seen date never moves on later syncs. Listings older than 45 days show an "Older listing" badge. Imported jobs no sync has seen for `JOB_STALE_EXPIRY_DAYS` (30) are expired.
- **Extracted salary, experience and skills.** `jobExtraction.service.js` reads explicit AED amounts (salary context required; unlabelled six-figure amounts are skipped as ambiguous), "N years of experience" phrases and skills from the posting text. Extracted salaries have `salarySource: "description"` and are labelled in the UI. Skills come from `skillCatalog.js`; extend that file to recognise more.
- **Newest feed** interleaves employers within each posting day so one company cannot fill a page (`?groupByCompany=true` restores plain chronological order).
- **Skills to learning.** The job detail endpoint returns `learning`: for each skill that maps to a *published* asif.to course, the course, a practice quiz and an interview-question link (`jobLearning.service.js`). To teach a new skill, publish the course and set its slug on the catalog entry.
- **Back-filling existing jobs:** `npm run backfill:job-insights` previews; add `-- --apply` to write. Admin-edited fields are never touched.

## Search, similar jobs, quick filters and the application tracker

- **Smart search.** `GET /jobs/suggest?q=` returns skills, role titles, companies, categories and locations that exist on live jobs (`jobSearch.service.js`, vocabulary cached 10 minutes). Unknown words in a keyword search are corrected before searching ("sofware" becomes "software"); words under 5 letters or seen on fewer than 2 jobs are never corrected. The response carries `meta.correctedKeyword` / `meta.searchedKeyword`, and `?exact=true` searches the typed words. A keyword search defaults to best match; an explicit `sort` always wins.
- **Similar jobs.** The job detail endpoint ranks a pool of same-category or shared-skill jobs by shared skills, title words, seniority and location (`jobSimilarity.service.js`), at most two per employer, topped up with plain category/company/location matches.
- **Quick filters.** `tags` on a job are read from its text (`constants/jobTags.js`): Visa provided, Walk-in (the hiring event only), Arabic speaker, Fresh graduate, Urgent hiring. `?tag=visa,urgent` requires all of them; counts come from `/jobs/taxonomy`. Run `npm run backfill:job-insights` to tag existing jobs.
- **Application tracker.** `PATCH /jobs/me/applications/:id` sets the applicant's private `stage` (applied, interviewing, offer, accepted, rejected, withdrawn) and `note`. It is separate from the employer-side `status`. Pressing Apply on a job keeps one tracker row per user and job.

## Skill match, salary insights, company hiring insights and the tech landing page

- **Skill match.** `GET /jobs/slug/:slug/match` (signed in) scores a job against the skills the person marked as theirs (`PUT /jobs/me/skills`, stored as catalog labels in `User.expertise`, other entries are preserved) and their asif.to course progress (60% or more counts as having the skill, any progress counts half). Only skills in `skillCatalog.js` take part; non-technical jobs have no match. It is shown as guidance, not a hiring prediction.
- **Salary insights.** `GET /jobs/salaries` and `/jobs/salaries/:category` summarise postings that state a monthly or yearly salary (hourly and daily pay is excluded). Figures are the median and 25th/75th percentile of each posting's midpoint, always with the number of postings. A group is not published below 5 postings (3 for breakdowns inside a published group). Pages: `/jobs/salaries`, `/jobs/salaries/[category]`. Coverage grows with the share of postings that state pay; run the backfill to include figures read from posting text.
- **Company hiring insights.** The company endpoint returns `insights`: open roles, new this week, top categories and places, typical stated pay (3 or more postings) and a weekly trend. The trend uses only employer-published dates (`postedAtSource: "provider"`) and is hidden below 5 such postings, because first-seen dates cluster on the day a board was first imported. Following a company creates a job alert with `company` set; its match requires that company.
- **Tech jobs landing.** `/jobs/tech` is the job list with `track=tech` (categories software-development, web-development, IT) plus skill chips (`?skill=react`) built from skills found on live tech jobs.
- **Deploy step.** The job alert uniqueness index now includes `company`. Run `npm run migrate:jobs` once so the old index is replaced; until then a person cannot follow a second company.
