import { communityConfig } from "../configs/community.js";

const buckets = new Map();

export const communityRateLimit = (kind) => (req, res, next) => {
  const limits = {
    post: communityConfig.postRateLimit,
    comment: communityConfig.commentRateLimit,
    report: communityConfig.reportRateLimit,
    follow: communityConfig.followRateLimit,
  };
  const now = Date.now();
  const key = `${kind}:${req.user?._id || req.ip}`;
  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + communityConfig.rateWindowMs }
    : current;
  if (bucket.count >= limits[kind]) {
    res.set("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
    return res.status(429).json({ success: false, message: "Too many community actions. Please try again later." });
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  if (buckets.size > 10000) {
    for (const [bucketKey, value] of buckets) if (value.resetAt <= now) buckets.delete(bucketKey);
  }
  next();
};
