# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Monorepo with no root `package.json`; each package has its own `node_modules` and is run from its own directory.

- `server/` — Express 5 + Mongoose 9 REST API (ESM, plain JS). Entry: `server/src/index.js`.
- `apps/web/` — public site, Next.js 16 App Router, React 19, Tailwind 4, Redux Toolkit (RTK Query in `lib/api/`), Auth.js (`auth.js`). Path alias `@/*` → app root.
- `apps/admin/` — admin/CMS dashboard, separate Next.js app (`src/app/(admin)`, `(auth)`), Redux, Tiptap/Quill/MD editors, socket.io client.
- `apps/mobile/` — Expo 54 / React Native (expo-router, TypeScript, react-query).
- `docs/` — feature docs (`jobs-module.md`, `communications.md`); `apps/web/docs/adsense-phase-1.md`. Read these before touching Jobs, Communications or ads.
- `media/` — design assets (gitignored contents); not code.

## Commands

Server (`cd server`; default port 5000, API under `/api/v1`):
- `npm run dev` (nodemon) / `npm start`
- `npm test` — `node --test --test-isolation=none src/tests/*.test.js`
- Single test: `node --test --test-isolation=none src/tests/jobs.test.js`
- Seed/migration scripts live in `src/scripts/` and are exposed as npm scripts (`seed:courses`, `seed:*-exam`, `migrate:jobs`, `seed:job-sources`, `verify:job-sources`, …). See `package.json`.
- Ad-hoc ops scripts at the server root (`create-admin.js`, `backup.js`, `restore.js`, `reset_jobs.mjs`, `diag_queue.mjs`, …).

Web (`cd apps/web`; port 3000): `npm run dev` (turbopack), `npm run build`, `npm run lint`, `npm test` (node:test over a fixed list of `lib/**/*.test.*` files; run one with `node --test --test-isolation=none lib/jobDescription.test.mjs`).

Admin (`cd apps/admin`; run on a different port than web, e.g. `npm run dev -- -p 3001`): `npm run dev`, `build`, `lint`. No tests.

Mobile (`cd apps/mobile`): `npm start`, `npm run android|ios`.

## Environment

- `server/env.example` and `apps/web/env.example` document all variables. Server loads `server/.env` (via dotenv in `index.js`). Never copy real-looking values from the example files into commits.
- `AUTH_INTERNAL_SECRET` must be identical on the Express API and the Next web server (server-to-server session bridging for Auth.js OAuth); never expose it with `NEXT_PUBLIC_`.
- Web talks to the API through `NEXT_PUBLIC_API_URL` (includes `/api/v1`); uploaded files are served from the API's `/uploads` (`NEXT_PUBLIC_STORAGE_URL`). `/uploads/private` is deliberately 404 — private files (CVs, communications attachments) go through authenticated routes.

## Server architecture

`src/index.js` mounts every router under `/api/v1/<area>`, then starts background workers/schedulers alongside the HTTP server (which also hosts Socket.IO). Layering is `routes/` → `controllers/` → `services/` + `models/`; RBAC is via `middlewares/auth.middleware.js`, `utils/permissions.js` and the `RolePermission` model/controller (admin permissions are data-driven, and the admin app mirrors them in `src/lib/permissions.js`).

Major subsystems (each spans several models/services/controllers):
- **Content**: articles, topics/topic-categories, courses/chapters/course-topics, cheatsheets (migrated into articles), interview questions, quizzes/exams, pages, related-content and internal-link rules, SEO/site settings, search (`search.controller` + admin index).
- **Assets/media library**: `Asset`, `AssetFolder`, `AssetUsage`; storage providers in `services/storage` (local only in V1); multer in `middlewares/assetUpload.middleware.js`.
- **Jobs (GCC; `/jobs` itself stays UAE-only)**: `services/jobs/*` (ingestion from public ATS boards — Greenhouse, Lever, SmartRecruiters, Ashby, Workable — plus discovery, scheduler, job alerts). Controlled by `JOB_SYNC_ENABLED` etc.; credentials are referenced by env-key name on `JobSource`, never stored. See `docs/jobs-module.md`.
- **Communications**: external email (inbox, campaigns, subscribers, automations, queue, webhooks) in `models/Communication.js` and `services/communications/` with a durable `EmailJob` queue worker (`startCommunicationsWorker`). Reuses the internal messaging models for Team/Discussions rather than duplicating them. See `docs/communications.md`.
- **Messaging**: internal chat via `Conversation/Message/...` models, `realtime/messaging.socket.js`, `messaging*.service.js`.
- **Social publishing**: `SocialPost`/`SocialPublication`/`SocialIntegration` with a scheduler service.
- **Analytics/monetization**: first-party analytics (pseudonymized with `ANALYTICS_HASH_SECRET`), GA4 + Search Console services, AdSense gated by `ADS_MASTER_ENABLED` (web mirrors with `NEXT_PUBLIC_ADS_ENABLED`; DB settings cannot override a false master switch).
- Kanban, library bookmarks, personal notes, announcements, activity/audit logs, account deletion lifecycle.

Tests (`src/tests/*.test.js`) use the built-in `node:test` runner and mostly exercise services/models directly.

## Web / admin notes

- Web public routes are in `apps/web/app` (articles, courses, tutorials, jobs, interview-questions, playground, library, etc.); SEO helpers in `lib/seo.js`, `lib/pageMetadata.js`; `app/sitemap.js` and `robots.js` generate crawl files.
- Tailwind rules (from `GEMINI.md`): use the canonical star variant `*:` instead of `[&>*]:` (e.g. `*:grow`, `sm:*:grow-0`), and prefer standard utilities/variants over arbitrary selectors/properties.
- Scratch/one-off scripts exist in the repo (`apps/web/convert.js`, `test-md.jsx`, `update-dark-mode.js`, `server/scratch*.js`); they are not part of the app.
