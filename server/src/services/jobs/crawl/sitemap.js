import { XMLParser, XMLValidator } from "fast-xml-parser";

const array = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);
const parser = new XMLParser({ ignoreAttributes: true, removeNSPrefix: true, parseTagValue: false });

export const looksLikeXml = (text = "") => /^\s*(<\?xml|<urlset|<sitemapindex)/i.test(text);

/**
 * Reads a sitemap or sitemap index. DOCTYPE/ENTITY declarations are refused outright (XML entity expansion),
 * and only http(s) locations are returned.
 * @returns {{ sitemaps: string[], urls: { loc: string, lastmod: string|null }[] }}
 */
export function parseSitemap(xml = "") {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml) !== true) throw new Error("Invalid sitemap XML.");
  const doc = parser.parse(xml);
  const httpUrl = (value) => (/^https?:\/\//i.test(String(value || "").trim()) ? String(value).trim() : null);
  const sitemaps = array(doc?.sitemapindex?.sitemap).map((item) => httpUrl(item?.loc)).filter(Boolean);
  const urls = array(doc?.urlset?.url).map((item) => ({ loc: httpUrl(item?.loc), lastmod: item?.lastmod ? String(item.lastmod) : null })).filter((item) => item.loc);
  return { sitemaps, urls };
}
