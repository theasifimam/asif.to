const positiveInt = (name, fallback) => {
  const value = Number.parseInt(process.env[name], 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const communityConfig = Object.freeze({
  autoHideReportThreshold: positiveInt("COMMUNITY_AUTO_HIDE_REPORT_THRESHOLD", 3),
  postRateLimit: positiveInt("COMMUNITY_POST_RATE_LIMIT", 6),
  commentRateLimit: positiveInt("COMMUNITY_COMMENT_RATE_LIMIT", 20),
  reportRateLimit: positiveInt("COMMUNITY_REPORT_RATE_LIMIT", 10),
  followRateLimit: positiveInt("COMMUNITY_FOLLOW_RATE_LIMIT", 30),
  rateWindowMs: positiveInt("COMMUNITY_RATE_LIMIT_WINDOW_MS", 60 * 60 * 1000),
  duplicateWindowMs: positiveInt("COMMUNITY_DUPLICATE_WINDOW_MS", 2 * 60 * 1000),
});
