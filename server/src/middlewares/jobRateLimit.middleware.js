const buckets = new Map();

export const jobRateLimit = ({ windowMs = 60_000, max = 60 } = {}) => (req, res, next) => {
  const key = `${req.ip || req.socket?.remoteAddress || "unknown"}:${req.user?._id || "guest"}:${req.route?.path || req.path}`;
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }
  current.count += 1;
  if (current.count > max) {
    res.setHeader("Retry-After", Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ success: false, message: "Too many requests. Please try again shortly." });
  }
  return next();
};

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of buckets) if (value.resetAt <= now) buckets.delete(key);
}, 10 * 60_000).unref();

