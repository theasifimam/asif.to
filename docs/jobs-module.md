# Jobs module

The UAE-only Jobs module uses the existing Express/Mongoose API, asif.to user sessions, admin permissions, public layout, analytics, and private CV storage. Automated ingestion extends those existing paths; it does not expose application destinations before authentication or create a parallel jobs system.

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
[{"name":"Example Company","type":"greenhouse","providerOrganizationId":"example-board-token","careersUrl":"https://example.com/careers","enabled":true,"trusted":false,"autoPublish":false,"syncFrequency":"daily","syncIntervalHours":12,"qualityThreshold":90}]
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

## Adding another provider

Create a `JobProvider` adapter in `server/src/services/jobs/providers/`, implement bounded `fetchJobs()` and source-specific `normalizeJob()`, and register it in `providers/index.js`. Use the shared safe JSON request helper, return the common normalized shape, add mocked response tests, and keep all credentials server-side.

## Authentication and authorization

The current permissions remain authoritative: `jobs.view`, `jobs.manage`, `jobs.delete`, `job_sources.manage`, and `job_applications.review`. External application URLs remain absent from public payloads. The existing protected apply endpoint records the click and only then returns the ATS/company destination. Internal CVs remain private and duplicate applications retain the existing unique user/job constraint.
