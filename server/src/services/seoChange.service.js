// Pure helpers for the SEO change log: path normalising and evaluation windows.

const DAY = 86400000;
const utcDay = (date) => new Date(`${new Date(date).toISOString().slice(0, 10)}T00:00:00.000Z`);

/** "https://asif.to/articles/x/?a=1" -> "/articles/x". */
export function normalizePath(value) {
  try {
    return new URL(String(value), "https://asif.to").pathname.replace(/\/+$/, "") || "/";
  } catch {
    return "";
  }
}

/** Window of `days` ending the day before the change (end is exclusive). */
export function baselineWindow(changedAt, days = 28) {
  const end = utcDay(changedAt);
  return { from: new Date(end.getTime() - days * DAY), to: end };
}

/**
 * Window after the change, ending at the latest day Search Console has final
 * data for (today minus `lagDays`), capped at the baseline length so the two
 * periods are comparable. Returns null until `minDays` of data exist.
 * Impressions must be compared per day when the windows differ in length.
 */
export function afterWindow(changedAt, now = Date.now(), { days = 28, lagDays = 3, minDays = 7 } = {}) {
  const from = new Date(utcDay(changedAt).getTime() + DAY);
  const latest = new Date(utcDay(now).getTime() - lagDays * DAY);
  const available = Math.floor((latest - from) / DAY) + 1;
  if (available < minDays) return null;
  const length = Math.min(days, available);
  return { from, to: new Date(from.getTime() + length * DAY), days: length };
}

/** Per-day rates so unequal windows compare fairly; position is already an average. */
export function compareWindows(before, after, beforeDays, afterDays) {
  const perDay = (value, d) => (d ? value / d : 0);
  const pct = (a, b) => (b ? ((a - b) / b) * 100 : a ? 100 : 0);
  const clicks = pct(perDay(after.clicks, afterDays), perDay(before.clicks, beforeDays));
  const impressions = pct(perDay(after.impressions, afterDays), perDay(before.impressions, beforeDays));
  return {
    clicksPerDayChangePct: clicks,
    impressionsPerDayChangePct: impressions,
    ctrChange: after.ctr - before.ctr,
    positionChange: before.impressions && after.impressions ? after.position - before.position : 0,
  };
}
