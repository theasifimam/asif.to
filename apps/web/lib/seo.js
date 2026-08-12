const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to").replace(
  /\/$/,
  "",
);

const apiOrigin = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return siteUrl;

  try {
    return new URL(apiUrl).origin;
  } catch {
    return siteUrl;
  }
})();

export function getSiteUrl() {
  return siteUrl;
}

export function absoluteUrl(value, fallbackPath = "/") {
  const candidate = String(value || fallbackPath).trim();
  if (/^https?:\/\//i.test(candidate)) return candidate;

  return `${siteUrl}/${candidate.replace(/^\/+/, "")}`;
}

export function assetUrl(value) {
  const candidate = String(value || "/logo.png").trim();
  if (/^https?:\/\//i.test(candidate)) return candidate;

  const origin = candidate.startsWith("/uploads/") ? apiOrigin : siteUrl;
  return `${origin}/${candidate.replace(/^\/+/, "")}`;
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
