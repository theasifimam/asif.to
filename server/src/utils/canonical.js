/**
 * Normalizes and computes a canonical URL.
 * If customSuffixOrUrl is a full URL (http:// or https://), it is preserved.
 * Otherwise, customSuffixOrUrl or defaultSlug is appended to basePath.
 *
 * @param {string} basePath - e.g. "/javascript", "/javascript/interview-questions/fundamentals", "/articles", "/courses"
 * @param {string} [customSuffixOrUrl] - e.g. "/my-slug", "my-slug", or "https://..."
 * @param {string} [defaultSlug] - e.g. "chapter-1"
 * @returns {string} - Full canonical URL e.g. "https://asif.to/javascript/chapter-1"
 */
export function formatCanonicalUrl(basePath = "", customSuffixOrUrl = "", defaultSlug = "") {
  const raw = String(customSuffixOrUrl || "").trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw;
  }

  const cleanBase = `/${String(basePath || "").trim().replace(/^\/+/, "").replace(/\/+$/, "")}`;
  let cleanSuffix = raw.replace(/^\/+/, "").replace(/\/+$/, "");

  const normalizedBase = cleanBase.replace(/^\/+/, "");
  if (normalizedBase && cleanSuffix.startsWith(normalizedBase)) {
    cleanSuffix = cleanSuffix.slice(normalizedBase.length).replace(/^\/+/, "");
  }

  const finalSlug = cleanSuffix || String(defaultSlug || "").trim().replace(/^\/+/, "");
  const siteBase = "https://asif.to";

  if (!finalSlug) {
    return cleanBase === "/" ? siteBase : `${siteBase}${cleanBase}`;
  }

  return cleanBase === "/" ? `${siteBase}/${finalSlug}` : `${siteBase}${cleanBase}/${finalSlug}`;
}
