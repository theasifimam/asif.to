const SCRIPT = /<script\b[^>]*\btype\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
const array = (value) => (value == null ? [] : Array.isArray(value) ? value : [value]);
const text = (value) => {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  return text(value.name ?? value["@value"] ?? value.value ?? "");
};

/** Every JSON-LD object on a page, flattened through arrays, @graph and ItemList entries. */
export function extractJsonLd(html = "") {
  const out = [];
  const visit = (node, depth = 0) => {
    if (!node || typeof node !== "object" || depth > 6) return;
    if (Array.isArray(node)) { node.forEach((item) => visit(item, depth + 1)); return; }
    out.push(node);
    if (node["@graph"]) visit(node["@graph"], depth + 1);
    if (node.itemListElement) array(node.itemListElement).forEach((entry) => visit(entry.item || entry, depth + 1));
  };
  for (const match of String(html).matchAll(SCRIPT)) {
    const raw = match[1].trim().replace(/^<!--|-->$/g, "").replace(/^\/\*<!\[CDATA\[\*\/|\/\*\]\]>\*\/$/g, "");
    try { visit(JSON.parse(raw)); } catch { /* Malformed block: skip it, the page may have others. */ }
  }
  return out;
}

export const isJobPosting = (node) => array(node?.["@type"]).some((type) => String(type).replace(/^.*[/#]/, "").toLowerCase() === "jobposting");
export const findJobPostings = (html) => extractJsonLd(html).filter(isJobPosting);

const PERIODS = { HOUR: "hour", DAY: "day", MONTH: "month", YEAR: "year" }; // WEEK has no equivalent in the job model.

function placeText(place) {
  const address = place?.address || place || {};
  if (typeof address === "string") return { location: address, country: "" };
  const country = text(address.addressCountry);
  return { location: [text(address.addressLocality), text(address.addressRegion), country].filter(Boolean).join(", "), country };
}

function salaryOf(base) {
  if (!base) return {};
  const value = base.value && typeof base.value === "object" ? base.value : { value: base.value };
  const min = value.minValue ?? value.value; const max = value.maxValue ?? value.value;
  const period = PERIODS[String(value.unitText || base.unitText || "").toUpperCase()];
  if (!period || (min == null && max == null)) return {};
  return { minimumSalary: Number(min), maximumSalary: Number(max), salaryPeriod: period, salaryCurrency: text(base.currency) };
}

/**
 * Maps a schema.org JobPosting to the importer's common shape. `pageUrl` is the page it was found on, used for
 * the job's link and as a stable id when the posting has no identifier. Returns null for an unusable posting.
 */
export function mapJobPosting(posting, pageUrl, { now = new Date() } = {}) {
  const title = text(posting.title);
  const description = typeof posting.description === "string" ? posting.description : text(posting.description);
  if (!title || !description) return null;
  const validThrough = posting.validThrough ? new Date(posting.validThrough) : null;
  const closes = validThrough && !Number.isNaN(validThrough.getTime()) ? validThrough : null;
  if (closes && closes <= now) return null; // already closed

  const places = array(posting.jobLocation).map(placeText);
  const remote = String(posting.jobLocationType || "").toUpperCase() === "TELECOMMUTE";
  const required = array(posting.applicantLocationRequirements).map((item) => text(item)).filter(Boolean);
  const location = places.map((place) => place.location).filter(Boolean).join(", ") || (remote ? ["Remote", ...required].join(", ") : "");
  const organization = posting.hiringOrganization || {};
  const link = /^https?:\/\//i.test(text(posting.url)) ? text(posting.url) : pageUrl;
  const identifier = text(posting.identifier);
  const canonical = (() => { try { const url = new URL(pageUrl); return `${url.hostname}${url.pathname}`; } catch { return pageUrl; } })();
  const months = posting.experienceRequirements?.monthsOfExperience;
  return {
    sourceJobId: (identifier || canonical).slice(0, 300), title, description, // the importer decodes entities and sanitises the HTML
    companyName: text(organization), companyWebsite: text(organization.sameAs || organization.url), companyLogo: text(organization.logo?.url || organization.logo),
    location, country: places.find((place) => place.country)?.country || "",
    employmentType: array(posting.employmentType).map(text).join(" "), workMode: remote ? "remote" : "",
    category: text(posting.occupationalCategory || posting.industry), experienceText: months ? `${Math.round(Number(months) / 12)} years` : "",
    ...salaryOf(posting.baseSalary),
    applicationUrl: link, sourceUrl: pageUrl, postedAt: posting.datePosted || null, expiresAt: closes,
    raw: { title, identifier, url: pageUrl, datePosted: posting.datePosted || null, validThrough: posting.validThrough || null },
  };
}
