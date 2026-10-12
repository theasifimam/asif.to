export const JOB_STATUSES = ["draft", "pending", "published", "hidden", "expired", "rejected", "archived"];
export const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "temporary", "internship", "freelance", "not-specified"];
export const WORK_MODES = ["on-site", "hybrid", "remote", "not-specified"];
export const EXPERIENCE_LEVELS = ["entry", "junior", "mid", "senior", "lead", "manager", "director", "executive", "not-specified"];
export const APPLICATION_TYPES = ["external", "internal"];
export const SALARY_PERIODS = ["hour", "day", "month", "year"];
export const SOURCE_TYPES = ["manual", "employer-career-page", "greenhouse", "lever", "smartrecruiters", "workable", "ashby", "recruitee", "pinpoint", "teamtailor", "workday", "jsonld", "api", "other"];
export const SOURCE_VERIFICATION_STATUSES = [
  "Verified", "No UAE Jobs Currently", "Source Unavailable", "Requires Review", "Requires Credentials", "Provider Changed", "Blocked",
];
export const CREATION_ORIGINS = ["admin_created", "manual_import", "automated_import", "ats_import", "api_import"];
export const IMPORT_STATUSES = ["imported", "updated", "unchanged", "duplicate", "validation_failed", "source_removed", "sync_error"];

export const UAE_LOCATIONS = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Al Ain", "United Arab Emirates",
];

// Gulf Cooperation Council countries the platform lists jobs for. `JOB_COUNTRIES` (comma-separated
// codes) narrows this at runtime; see activeJobCountries() in jobNormalization.service.js.
export const GCC_COUNTRIES = [
  { code: "AE", name: "United Arab Emirates", slug: "uae" },
  { code: "SA", name: "Saudi Arabia", slug: "saudi-arabia" },
  { code: "QA", name: "Qatar", slug: "qatar" },
  { code: "KW", name: "Kuwait", slug: "kuwait" },
  { code: "BH", name: "Bahrain", slug: "bahrain" },
  { code: "OM", name: "Oman", slug: "oman" },
];
export const JOB_COUNTRY_CODES = GCC_COUNTRIES.map((country) => country.code);

export const GCC_LOCATIONS = {
  AE: UAE_LOCATIONS,
  SA: ["Riyadh", "Jeddah", "Dammam", "Al Khobar", "Dhahran", "Jubail", "Makkah", "Madinah", "Yanbu", "Tabuk", "Abha", "NEOM", "Saudi Arabia"],
  QA: ["Doha", "Lusail", "Al Wakrah", "Qatar"],
  KW: ["Kuwait City", "Kuwait"],
  BH: ["Manama", "Bahrain"],
  OM: ["Muscat", "Salalah", "Sohar", "Oman"],
};

export const UAE_JOB_CATEGORIES = [
  "Software Development", "IT", "Engineering", "Sales", "Marketing", "Finance", "Accounting", "Administration",
  "Document Control", "Operations", "Customer Service", "HR", "Hospitality", "Healthcare", "Construction", "Logistics",
  "Legal", "Management",
];

export const INTERNAL_APPLICATION_STATUSES = ["submitted", "reviewed", "shortlisted", "rejected", "hired"];
