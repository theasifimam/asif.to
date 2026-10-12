// Workday career sites verified (2026-10-12, `npm run find:workday-boards`) to exist and return Gulf jobs
// through the real importer. providerOrganizationId is `tenant/wdN/site`. New entries are inserted
// disabled by `npm run seed:job-sources`; `-- --verify` enables the ones that currently return jobs.
// Find more with `npm run find:workday-boards -- --urls=<career page URLs>` and add them here.
const board = (name, tenant, pod, site, extra = {}) => ({
  name, slug: `workday-${tenant}`, type: "workday", providerOrganizationId: `${tenant}/${pod}/${site}`,
  careersUrl: `https://${tenant}.${pod}.myworkdayjobs.com/${site}`,
  // A Workday sync is one search per Gulf term plus one request per posting, so refresh daily, not every 6 hours.
  syncFrequency: "daily", syncIntervalHours: 24, ...extra,
});

export const WORKDAY_JOB_SOURCE_DEFINITIONS = [
  board("KBR", "kbr", "wd5", "KBR_Careers"),
  board("KONE", "kone", "wd3", "Careers"),
  board("Thales", "thales", "wd3", "Careers"),
  board("Citi", "citi", "wd5", "2"),
  board("Visa", "visa", "wd5", "visa"),
  board("Baker Hughes", "bakerhughes", "wd5", "BakerHughes"),
  board("RTX", "globalhr", "wd5", "REC_RTX_Ext_Gateway"),
  board("Mastercard", "mastercard", "wd1", "CorporateCareers"),
  board("Salesforce", "salesforce", "wd12", "External_Career_Site"),
  board("Abbott", "abbott", "wd5", "abbottcareers"),
  board("Boeing", "boeing", "wd1", "EXTERNAL_CAREERS"),
  board("Carrier", "carrier", "wd5", "Jobs"),
  board("Cisco", "cisco", "wd5", "Cisco_Careers"),
  board("Hewlett Packard Enterprise", "hpe", "wd5", "Jobsathpe"),
  board("GSK", "gsk", "wd5", "GSKCareers"),
  board("Adobe", "adobe", "wd5", "external_experienced"),
  board("Medtronic", "medtronic", "wd1", "medtronicCareers"),
  board("Philips", "philips", "wd3", "jobs-and-careers"),
  board("Stryker", "stryker", "wd1", "strykerCareers"),
  board("AstraZeneca", "astrazeneca", "wd3", "Careers"),
];
