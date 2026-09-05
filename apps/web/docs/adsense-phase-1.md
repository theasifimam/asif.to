# Monetization and AdSense

The platform uses one database-backed monetization control center at
`admin.asif.to/monetization`. Ad serving remains disabled by default. Auto Ads,
anchor ads, vignette ads, manual click tracking, and inferred revenue are not
implemented.

## Runtime controls

An ad renders only when every layer permits it:

1. `NEXT_PUBLIC_ADS_ENABLED=true` in the web deployment.
2. `ADS_MASTER_ENABLED=true` in the API deployment.
3. The database `adsEnabled` switch is on.
4. The content type and placement are enabled.
5. The route, content length, density, premium, safety, and consent inputs permit
   the placement.

The admin database switch and all placement changes require
`monetization.manage`. Updates are audited and clear the API cache immediately.
The public runtime endpoint has a five-second cache, so the emergency OFF switch
propagates without a build or deployment and may take up to about five seconds
to reach an already-cached web request.

The web layout retrieves this public configuration once. Individual ad slots do
not query the API. One shared client context refreshes every 30 seconds and when
the page regains focus, allowing emergency changes to reach already-open pages.
If the API is unavailable or returns invalid/incomplete configuration, the web
app fails closed and renders no ad.

## Environment configuration

Web deployment (`apps/web/env.example`):

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADS_ENABLED=false
NEXT_PUBLIC_ADSENSE_TEST_MODE=true
```

API deployment (`server/env.example`):

```env
ADS_MASTER_ENABLED=false
ADSENSE_CLIENT_ID=
```

The client ID can be entered in **Monetization -> Settings**. The environment
value remains a server-side fallback. Keep both master switches false until the
AdSense account and manual placements have been reviewed. Test mode prevents
real Google requests in a production preview; normal local development also
uses placeholders instead of requesting ads.

## Placement configuration

AdSense slot IDs belong in **Monetization -> Placements**. They are validated as
numeric ad-unit IDs and are returned only through the public runtime
configuration. Do not add raw slot IDs to page components.

Current semantic placements are Article Middle, Article Bottom, Course Middle,
Course Bottom, Cheatsheet Bottom, and Interview Question Bottom. Sidebar is
reserved for future mounting and cannot be enabled yet. Page components use
semantic wrappers (`ArticleAd`, `CourseAd`, `CheatsheetAd`, and
`InterviewQuestionAd`) above the AdSense-specific renderer, leaving a clean seam
for sponsorships, affiliates, and house ads later.

Density bands are editable in **Monetization -> Settings**. The conservative
defaults are:

- fewer than 400 words: 0 ads
- 400-699 words: at most 1 ad
- 700-1499 words: at most 2 ads
- 1500 words or more: at most 3 ads

Excluded routes and nearby interactive controls always win over placement
configuration. Ads are suppressed near forms, buttons, quizzes, editors,
playgrounds, and executable code areas.

## Analytics and reporting

The module currently reports real first-party page views, browser identifiers,
sessions, engagement, device mix, eligible-page estimates, and opportunity
estimates. GA4 data is reused when the existing GA4 connection is configured.
Eligibility and opportunities are labelled as estimates; they are not AdSense
impressions.

The official AdSense Reporting API is not connected, so revenue, RPM,
impressions, clicks, CTR, CPC, and revenue breakdowns display **Not connected**.
The integration boundary is `server/src/services/adsenseReporting.service.js`.
Add official Google credentials and reporting calls there after approval. Never
substitute GA4 revenue, manual click handlers, iframe inspection, or fabricated
values.

Recommendations are deterministic and use only available settings and traffic.
They never apply changes automatically and describe trends as possible
correlations rather than causation.

## ads.txt and Google CMP

`apps/web/public/ads.txt` already contains a Google publisher record. Verify it
against the record shown by the connected AdSense account and replace the line
there only if the account differs. The required format is:

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Deployment serves the file at `https://asif.to/ads.txt`; no middleware
intercepts it.

Configure the consent message outside this repository in:

```text
Google AdSense -> Privacy & messaging
```

Use Google's certified CMP where consent is required. The policy already accepts
an explicit `hasAdConsent` denial and Google remains responsible for regional
consent handling until a resolved site consent signal is integrated. Do not add
a parallel fake-consent system.

## Security headers

The web app has no document-level CSP. Its existing CSP header applies only to
Next.js image optimization responses, so no CSP was changed. If a document CSP
is introduced, verify Google's current AdSense/CMP host requirements and add
narrow `script-src`, `frame-src`, `connect-src`, and `img-src` entries without
wildcards.

Chapter and playground responses use cross-origin isolation headers. Playground
and practice routes are excluded from monetization. Validate live AdSense in
supported browsers on a staging chapter before enabling any production
placement.

## After AdSense approval

1. Verify the existing `ads.txt` publisher record against AdSense.
2. Enter the `ca-pub-...` client ID under Monetization Settings.
3. Create manual AdSense ad units and paste their slot IDs under Placements.
4. Configure Privacy & messaging in AdSense.
5. Set the two deployment master switches, while leaving the database switch off.
6. Preview and enable one conservative bottom placement, then enable the database
   switch after verifying layout, consent, and reporting.
