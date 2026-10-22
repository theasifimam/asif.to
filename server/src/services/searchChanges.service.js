// Pure helpers for comparing Search Console periods. No DB access here so the
// maths can be unit-tested; the controller feeds in aggregated rows.

export const SEARCH_SECTIONS = [
  "jobs",
  "articles",
  "interview-questions",
  "courses",
  "other",
];

const pathOf = (value) => {
  try {
    return new URL(value, "https://asif.to").pathname.toLowerCase();
  } catch {
    return String(value || "").toLowerCase();
  }
};

/** Classify a page URL/path into a coarse site section. */
export function classifySection(value) {
  const path = pathOf(value);
  if (/^\/jobs(\/|$)/.test(path)) return "jobs";
  if (/^\/articles(\/|$)/.test(path)) return "articles";
  // Covers /interview-questions and /{course}/interview-questions/{category}.
  if (/(^|\/)interview-questions(\/|$)/.test(path)) return "interview-questions";
  if (/^\/(courses|tutorials)(\/|$)/.test(path)) return "courses";
  return "other";
}

const pctChange = (current, previous) =>
  previous ? ((current - previous) / previous) * 100 : current ? 100 : 0;

const metrics = (row) => ({
  clicks: row?.clicks || 0,
  impressions: row?.impressions || 0,
  ctr: row?.ctr || 0,
  position: row?.position || 0,
});

/**
 * Merge current/previous aggregated rows ({_id|key, clicks, impressions, ctr,
 * position}) into one list with deltas. Rows that only exist in the previous
 * period are kept (that is how lost pages/queries show up).
 *
 * positionChange > 0 means the average position got worse (higher number).
 */
export function computeChanges(currentRows = [], previousRows = []) {
  const keyOf = (row) => row.key ?? row._id;
  const previousMap = new Map(previousRows.map((row) => [keyOf(row), row]));
  const seen = new Set();
  const merged = [];
  for (const row of currentRows) {
    const key = keyOf(row);
    seen.add(key);
    merged.push(buildChange(key, metrics(row), metrics(previousMap.get(key))));
  }
  for (const row of previousRows) {
    const key = keyOf(row);
    if (!seen.has(key)) merged.push(buildChange(key, metrics(null), metrics(row)));
  }
  return merged;
}

function buildChange(key, current, previous) {
  const hasBoth = current.impressions > 0 && previous.impressions > 0;
  return {
    key,
    ...current,
    previous,
    clicksChange: current.clicks - previous.clicks,
    impressionsChange: current.impressions - previous.impressions,
    impressionsChangePct: pctChange(current.impressions, previous.impressions),
    ctrChange: current.ctr - previous.ctr,
    positionChange: hasBoth ? current.position - previous.position : 0,
    lost: current.impressions === 0 && previous.impressions > 0,
    isNew: previous.impressions === 0 && current.impressions > 0,
  };
}

/** Roll a list of per-page change rows up into per-section totals. */
export function summarizeSections(changeRows = []) {
  const blank = () => ({
    pages: 0,
    current: { clicks: 0, impressions: 0, weightedPosition: 0 },
    previous: { clicks: 0, impressions: 0, weightedPosition: 0 },
  });
  const sections = Object.fromEntries(SEARCH_SECTIONS.map((name) => [name, blank()]));
  for (const row of changeRows) {
    const bucket = sections[classifySection(row.key)];
    bucket.pages += 1;
    bucket.current.clicks += row.clicks;
    bucket.current.impressions += row.impressions;
    bucket.current.weightedPosition += row.position * row.impressions;
    bucket.previous.clicks += row.previous.clicks;
    bucket.previous.impressions += row.previous.impressions;
    bucket.previous.weightedPosition += row.previous.position * row.previous.impressions;
  }
  return SEARCH_SECTIONS.map((section) => {
    const { pages, current, previous } = sections[section];
    const position = (side) => (side.impressions ? side.weightedPosition / side.impressions : 0);
    const ctr = (side) => (side.impressions ? (side.clicks / side.impressions) * 100 : 0);
    return {
      section,
      pages,
      clicks: current.clicks,
      impressions: current.impressions,
      ctr: ctr(current),
      position: position(current),
      previous: {
        clicks: previous.clicks,
        impressions: previous.impressions,
        ctr: ctr(previous),
        position: position(previous),
      },
      clicksChangePct: pctChange(current.clicks, previous.clicks),
      impressionsChangePct: pctChange(current.impressions, previous.impressions),
    };
  });
}
