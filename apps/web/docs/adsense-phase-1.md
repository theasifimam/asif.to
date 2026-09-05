# AdSense and monetization foundation

Phase 1 provides opt-in infrastructure only. It does not place ads on content
pages, enable Auto Ads, or enable anchor, vignette, or automatic in-article ads.

## Environment configuration

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=
NEXT_PUBLIC_ADS_ENABLED=false
NEXT_PUBLIC_ADSENSE_TEST_MODE=true
```

`NEXT_PUBLIC_ADS_ENABLED=true` enables the monetization layer. Real Google ad
requests happen only in a production build when a client ID is configured and
`NEXT_PUBLIC_ADSENSE_TEST_MODE=false`. Development and test-mode renders use a
small placeholder, so routine local development does not contact AdSense.

Ad-unit slot IDs are optional and map to semantic placements in
`config/ads.mjs`. Set the relevant variables after creating manual ad units:

```env
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MIDDLE=
NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_BOTTOM=
NEXT_PUBLIC_ADSENSE_SLOT_COURSE_MIDDLE=
NEXT_PUBLIC_ADSENSE_SLOT_COURSE_BOTTOM=
NEXT_PUBLIC_ADSENSE_SLOT_CHEATSHEET_BOTTOM=
NEXT_PUBLIC_ADSENSE_SLOT_INTERVIEW_BOTTOM=
NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=
```

Do not add raw publisher or slot IDs to page components. Future page code should
select a semantic placement from `ADS_CONFIG.placements`, call `shouldShowAds`,
and render `AdSlot` only when the page policy allows it. This boundary also
leaves room for future sponsor, affiliate, and house-ad renderers.

## Content and route policy

`lib/ads/shouldShowAds.mjs` is the page decision layer. It checks the global
configuration, excluded routes, monetizable page type, premium state, an
explicitly denied consent signal, and minimum content length. Unknown consent
is not treated as consent; regional consent is delegated to Google's certified
CMP. The policy is ready to receive a resolved `hasAdConsent` value later.

`lib/ads/getMaxAdsForContent.mjs` applies the initial word-count density policy:

- fewer than 400 words: 0 ads
- 400–699 words: at most 1 ad
- 700–1499 words: at most 2 ads
- 1500 or more words: at most 3 ads

The result is additionally capped by page type in `config/ads.mjs`.

## ads.txt

Replace the commented placeholder in `public/ads.txt` with the exact publisher
record supplied by AdSense. It normally has this shape:

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

Because it lives in the web app's `public` directory, deployment serves it at
`https://asif.to/ads.txt`. No middleware currently intercepts that path.

## Google CMP and manual AdSense setup

Configure the consent message outside this repository in:

```text
Google AdSense -> Privacy & messaging
```

Use Google's certified CMP for regions that require consent. Do not add a fake
or parallel consent system in the app. Also keep Auto Ads, anchor ads, and
vignette ads disabled for Phase 1.

## Phase 2

Phase 2 can add manually controlled semantic placements to sufficiently long
articles, course chapters, cheatsheets, and interview-question pages. Each page
must provide its pathname, page type, and word count to the policy and respect
the returned density limit. Avoid placements in code blocks and near Run, Copy,
or Submit controls.

## Security headers

The web app currently has no document-level Content Security Policy. The CSP in
`next.config.mjs` applies only to Next.js image optimization responses, so Phase
1 does not modify it. If a page CSP is introduced, validate the exact current
AdSense and CMP domain requirements before adding narrowly scoped `script-src`,
`frame-src`, `connect-src`, and `img-src` entries; do not add wildcard sources.

Chapter and playground routes use cross-origin isolation headers. Playground
routes are excluded from ads. Before Phase 2 enables a chapter placement, test
AdSense behavior on the cross-origin-isolated chapter response in supported
browsers.
