const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://asif.to").replace(
  /\/$/,
  "",
);

const apiOrigin = (() => {
  const target = process.env.NEXT_PUBLIC_STORAGE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!target) return siteUrl;

  try {
    return new URL(target).origin;
  } catch {
    return target.replace(/\/$/, "");
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

  let clean = candidate.replace(/^\/+/, "");
  if (!clean.startsWith("uploads/")) {
    if (clean.startsWith("article-")) {
      clean = `uploads/articles/${clean}`;
    } else if (clean.startsWith("avatar-")) {
      clean = `uploads/avatars/${clean}`;
    }
  }

  const origin = clean.startsWith("uploads/") ? apiOrigin : siteUrl;
  return `${origin}/${clean}`;
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
