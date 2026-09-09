import { UAE_JOB_CATEGORIES } from "../../constants/jobs.js";
import { cleanText, decodeHtmlEntities, parseNullableNumber, sanitizeJobHtml } from "../../utils/jobValidation.js";
import { slugify } from "../../utils/slugify.js";

const locationRules = [
  ["Dubai", /\bdubai\b/i], ["Abu Dhabi", /\babu[ -]?dhabi\b/i], ["Sharjah", /\bsharjah\b/i],
  ["Ajman", /\bajman\b/i], ["Ras Al Khaimah", /\b(ras al khaimah|ras al-khaimah|rak)\b/i],
  ["Fujairah", /\bfujairah\b/i], ["Umm Al Quwain", /\b(umm al quwain|umm al-quwain|uaq)\b/i],
  ["Al Ain", /\bal[ -]?ain\b/i],
];
const uaePattern = /\b(uae|u\.a\.e\.?|united arab emirates|ae)\b/i;
const foreignPattern = /\b(saudi arabia|ksa|qatar|bahrain|kuwait|oman|egypt|india|pakistan|united kingdom|uk|united states|usa|canada|australia|singapore)\b/i;

export function normalizeUaeLocation(value, country = "") {
  const raw = cleanText([value, country].filter(Boolean).join(", "), 300);
  for (const [canonical, pattern] of locationRules) if (pattern.test(raw)) return canonical;
  if (uaePattern.test(raw) || /^(AE|ARE)$/i.test(cleanText(country, 10))) return "United Arab Emirates";
  if (foreignPattern.test(raw)) return null;
  return null;
}

const categoryRules = [
  ["Document Control", /\b(document controller|document control)\b/i],
  ["Legal", /\b(legal|lawyer|attorney|counsel|paralegal|compliance)\b/i],
  ["Management", /\b(vice president|president|chief operating officer|general manager|managing director)\b/i],
  ["Construction", /\b(construction|civil engineer|quantity surveyor|cost manager|site engineer|mep|architect)\b/i],
  ["Software Development", /\b(software|frontend|front-end|backend|back-end|full.?stack|developer|programmer|mobile app|ios|android|devops|qa engineer)\b/i],
  ["IT", /\b(information technology|it support|systems? administrator|network|cyber.?security|helpdesk|technical support|cloud)\b/i],
  ["Accounting", /\b(accountant|accounting|bookkeep|accounts payable|accounts receivable|audit)\b/i],
  ["Finance", /\b(finance|financial|treasury|investment|banking|credit analyst)\b/i],
  ["Sales", /\b(sales|business development|account executive|relationship manager)\b/i],
  ["Marketing", /\b(marketing|seo|content creator|social media|brand|growth)\b/i],
  ["Customer Service", /\b(customer service|customer support|call cent(?:er|re)|client service)\b/i],
  ["HR", /\b(human resources|recruiter|recruitment|talent acquisition|people operations|hr\b)\b/i],
  ["Healthcare", /\b(doctor|nurse|medical|healthcare|pharmac|clinical|dentist|therapist)\b/i],
  ["Hospitality", /\b(hotel|hospitality|restaurant|chef|waiter|waitress|front desk|housekeep)\b/i],
  ["Logistics", /\b(logistics|supply chain|warehouse|freight|shipping|fleet|procurement)\b/i],
  ["Engineering", /\b(engineer|engineering|mechanical|electrical|chemical|technician)\b/i],
  ["Administration", /\b(admin(?:istration|istrative)?|office assistant|secretary|receptionist|personal assistant)\b/i],
  ["Operations", /\b(operations?|project manager|program manager|quality control)\b/i],
];

export function classifyCategory({ title = "", category = "" }) {
  const supplied = UAE_JOB_CATEGORIES.find((item) => slugify(item) === slugify(category));
  if (supplied) return supplied;
  // A role's title and provider department are authoritative. Descriptions often
  // mention incidental tools (for example, legal roles at software companies),
  // which previously polluted the Software Development category.
  const roleText = `${title} ${category}`;
  return categoryRules.find(([, pattern]) => pattern.test(roleText))?.[0] || "Operations";
}

export function normalizeEmploymentType(value = "") {
  const text = cleanText(value, 100).toLowerCase().replace(/_/g, "-");
  if (!text) return "not-specified";
  if (/part[ -]?time/.test(text)) return "part-time";
  if (/intern(ship)?|trainee|graduate program/.test(text)) return "internship";
  if (/freelance/.test(text)) return "freelance";
  if (/temporary|temp\b|seasonal/.test(text)) return "temporary";
  if (/contract|fixed[ -]?term/.test(text)) return "contract";
  if (/full[ -]?time|permanent/.test(text)) return "full-time";
  return "not-specified";
}

export function normalizeWorkMode(value = "", location = "") {
  const text = `${value} ${location}`.toLowerCase().replace(/_/g, "-");
  if (/hybrid/.test(text)) return "hybrid";
  if (/remote|work from home|wfh|telecommut/.test(text)) return "remote";
  if (/on[ -]?site|in[ -]?office|office[ -]?based/.test(text)) return "on-site";
  return "not-specified";
}

export function normalizeExperience(value = "", title = "") {
  const original = cleanText(value, 500);
  const text = `${original} ${title}`.toLowerCase();
  let minimumExperience = null; let maximumExperience = null;
  const range = text.match(/(\d{1,2})\s*(?:-|–|—|to)\s*(\d{1,2})\s*(?:years?|yrs?)/i);
  const plus = text.match(/(\d{1,2})\s*\+\s*(?:years?|yrs?)/i);
  const single = text.match(/(?:minimum|min\.?|at least)?\s*(\d{1,2})\s*(?:years?|yrs?)/i);
  if (range) { minimumExperience = Number(range[1]); maximumExperience = Number(range[2]); }
  else if (plus) minimumExperience = Number(plus[1]);
  else if (single) minimumExperience = Number(single[1]);
  else if (/fresh graduate|no experience|entry[ -]?level|junior/.test(text)) minimumExperience = 0;
  const years = minimumExperience;
  let experienceLevel = "not-specified";
  if (years !== null) experienceLevel = years < 1 ? "entry" : years < 2 ? "junior" : years < 4 ? "mid" : years < 6 ? "senior" : "lead";
  else if (/\b(executive|chief|c-level)\b/.test(text)) experienceLevel = "executive";
  else if (/\bdirector\b/.test(text)) experienceLevel = "director";
  else if (/\b(manager|head of)\b/.test(text)) experienceLevel = "manager";
  else if (/\b(lead|principal)\b/.test(text)) experienceLevel = "lead";
  else if (/\bsenior\b/.test(text)) experienceLevel = "senior";
  return { experienceLevel, minimumExperience, maximumExperience, originalExperienceText: original };
}

export function normalizeSalary(data = {}) {
  let minimumSalary = parseNullableNumber(data.minimumSalary); let maximumSalary = parseNullableNumber(data.maximumSalary);
  let salaryPeriod = ["hour", "day", "month", "year"].includes(data.salaryPeriod) ? data.salaryPeriod : "month";
  const currency = cleanText(data.salaryCurrency, 20).toUpperCase();
  if ((minimumSalary === null && maximumSalary === null) && data.salaryText) {
    const text = cleanText(data.salaryText, 500);
    if (/\b(AED|UAE\s*dirhams?|dirhams?)\b/i.test(text)) {
      const values = [...text.matchAll(/(?:AED\s*)?([\d,.]+)\s*(k)?/gi)].map((match) => Number(match[1].replace(/,/g, "")) * (match[2] ? 1000 : 1)).filter(Number.isFinite);
      [minimumSalary, maximumSalary] = values.length > 1 ? values.slice(0, 2) : [values[0] ?? null, values[0] ?? null];
      if (/per\s*year|annual|annum/i.test(text)) salaryPeriod = "year";
      else if (/per\s*hour|hourly/i.test(text)) salaryPeriod = "hour";
      else if (/per\s*day|daily/i.test(text)) salaryPeriod = "day";
    }
  }
  if (currency && currency !== "AED") return { minimumSalary: null, maximumSalary: null, salaryCurrency: "AED", salaryPeriod, salaryVisible: false };
  return { minimumSalary, maximumSalary, salaryCurrency: "AED", salaryPeriod, salaryVisible: minimumSalary !== null || maximumSalary !== null };
}

export function prepareDescription(value) {
  const decoded = decodeHtmlEntities(value);
  const descriptionHtml = sanitizeJobHtml(decoded);
  const description = cleanText(descriptionHtml || decoded || value, 30_000);
  return { descriptionHtml: descriptionHtml || "", description };
}

export function scoreImport(data) {
  const checks = {
    title: { points: data.title?.length >= 3 ? 10 : 0, max: 10 }, company: { points: data.companyName?.length >= 2 ? 10 : 0, max: 10 },
    uaeLocation: { points: data.location ? 20 : 0, max: 20 }, description: { points: data.description?.length >= 100 ? 20 : data.description?.length >= 50 ? 10 : 0, max: 20 },
    applicationUrl: { points: data.applicationUrl ? 15 : 0, max: 15 }, sourceUrl: { points: data.sourceUrl ? 10 : 0, max: 10 },
    postedAt: { points: data.postedAt ? 5 : 0, max: 5 }, expiry: { points: data.expiresAt ? 5 : 0, max: 5 },
    taxonomy: { points: data.category && data.employmentType !== "not-specified" && data.workMode !== "not-specified" ? 5 : 0, max: 5 },
  };
  return { score: Object.values(checks).reduce((sum, item) => sum + item.points, 0), checks };
}

export function validateNormalizedJob(data, now = new Date()) {
  const errors = [];
  if (!data.title || data.title.length < 3) errors.push("missing_title");
  if (!data.companyName || data.companyName.length < 2) errors.push("missing_company");
  if (!data.location) errors.push("non_uae_location");
  if (!data.description || data.description.length < 50) errors.push("malformed_description");
  if (!data.applicationUrl) errors.push("invalid_application_url");
  if (!data.sourceUrl) errors.push("invalid_source_url");
  if (data.expiresAt && data.expiresAt <= now) errors.push("expired_job");
  if (/^(test|untitled|null|undefined|n\/a)$/i.test(data.title || "")) errors.push("malformed_title");
  return { valid: errors.length === 0, errors };
}
