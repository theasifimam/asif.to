const endpointFor = (type, id) => {
  if (type === "lever") return `https://api.lever.co/v0/postings/${encodeURIComponent(id)}`;
  if (type === "smartrecruiters") return `https://api.smartrecruiters.com/v1/companies/${encodeURIComponent(id)}/postings`;
  if (type === "greenhouse") return `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(id)}/jobs?content=true`;
  if (type === "ashby") return `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(id)}`;
  return "";
};

const careersFor = (type, id) => {
  if (type === "lever") return `https://jobs.lever.co/${encodeURIComponent(id)}`;
  if (type === "smartrecruiters") return `https://jobs.smartrecruiters.com/${encodeURIComponent(id)}`;
  if (type === "greenhouse") return `https://job-boards.greenhouse.io/${encodeURIComponent(id)}`;
  if (type === "ashby") return `https://jobs.ashbyhq.com/${encodeURIComponent(id)}`;
  return "";
};

const source = (name, type, providerOrganizationId, resolutionNote = "") => ({
  name,
  slug: `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
  type,
  providerOrganizationId,
  careersUrl: careersFor(type, providerOrganizationId),
  endpointUrl: endpointFor(type, providerOrganizationId),
  syncFrequency: "daily",
  syncIntervalHours: 6,
  autoPublish: true,
  trusted: true,
  qualityThreshold: 90,
  verificationStatus: "Requires Review",
  verificationNotes: resolutionNote || "Public ATS identity resolved; live verification is required before enabling sync.",
});

// These identifiers were resolved from the companies' public ATS boards. They
// are deliberately explicit so a renamed or migrated board fails verification
// instead of silently switching to an unrelated organization.
export const UAE_JOB_SOURCE_DEFINITIONS = [
  source("Kpler", "lever", "kpler"),
  source("Contentsquare", "lever", "contentsquare"),
  source("e.construct", "lever", "econstruct"),
  source("WeRide.ai", "lever", "weride"),
  source("TSMG", "lever", "tsmg"),
  source("Lalamove", "lever", "lalamove"),
  source("Deliverect", "lever", "deliverect"),
  source("Pattern", "lever", "pattern"),
  source("Spotify", "lever", "spotify"),
  source("1inch", "lever", "1inch"),
  source("VEON", "lever", "veonhq", "The public Lever board uses the verified identifier veonhq."),
  source("Aldar Properties", "lever", "aldar"),
  source("Binance", "lever", "binance"),
  source("Paytm", "lever", "paytm"),
  source("Safran.AI", "lever", "safran-ai"),
  source("Ajax Systems", "lever", "ajax", "The public Lever board uses the verified identifier ajax."),
  source("Trendyol", "lever", "trendyol"),
  source("Loft Orbital", "lever", "loftorbital"),
  source("BTSE", "lever", "BTSE", "The verified Lever identifier is case-sensitive."),
  source("DiliTrust", "lever", "dilitrust"),
  source("Airalo", "lever", "airalo"),
  source("Xsolla", "lever", "xsolla"),
  source("Daos Hub", "lever", "daos-hub"),
  source("Institute of Foundation Models", "lever", "ifm-us", "The public Lever board uses the verified identifier ifm-us."),

  source("Ghobash Group", "smartrecruiters", "GhobashGroup"),
  source("GulfTalent", "smartrecruiters", "GulfTalent"),
  source("Iqarus", "smartrecruiters", "Iqarus"),
  source("Namshi", "smartrecruiters", "Namshi"),
  source("SellAnyCar.com", "smartrecruiters", "SellAnyCar"),
  source("Sicuro Group", "smartrecruiters", "SicuroGroup"),
  source("Travelstart", "smartrecruiters", "Travelstart"),
  source("Terra Solis Dubai", "smartrecruiters", "TerraSolisDubai"),

  source("AlphaSights", "greenhouse", "alphasights"),
  source("dmg events", "greenhouse", "dmgevents"),
  source("Cobblestone Energy", "greenhouse", "cobblestoneenergy"),
  source("Algorium", "greenhouse", "algorium"),
  source("AIFT", "greenhouse", "aift"),
  source("Vatic Labs", "greenhouse", "vaticlabs"),
  source("Atoms", "greenhouse", "atoms"),
  source("OpenFX", "greenhouse", "openfx"),
  source("HALA", "greenhouse", "hala"),
  source("Addepar", "greenhouse", "addepar1", "Addepar's current public Greenhouse board token is addepar1."),
  source("DriveWealth", "greenhouse", "drivewealth"),
  source("Guidepoint", "greenhouse", "guidepoint"),
  source("OKX", "greenhouse", "okx"),

  source("Deliveroo", "ashby", "deliveroo"),
  source("Cygnify", "ashby", "cygnify"),
  source("UiPath", "ashby", "uipath"),
  source("ePackPro", "ashby", "epackpro"),
  source("OnHires", "ashby", "onhires"),
];

export const UAE_JOB_SOURCE_SLUGS = UAE_JOB_SOURCE_DEFINITIONS.map((item) => item.slug);
