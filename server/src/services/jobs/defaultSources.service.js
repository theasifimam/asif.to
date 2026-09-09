import JobSource from "../../models/JobSource.js";

// Curated public career feeds. These identifiers and endpoints are public,
// require no account/API key, and are only used through documented ATS APIs.
export const DEFAULT_PUBLIC_JOB_SOURCES = [
  {
    name: "Careem", slug: "careem-greenhouse", type: "greenhouse", providerOrganizationId: "careem",
    baseUrl: "https://www.careem.com/", careersUrl: "https://www.careem.com/en-AE/careers/",
  },
  {
    name: "Turner & Townsend", slug: "turner-townsend-smartrecruiters", type: "smartrecruiters", providerOrganizationId: "TurnerTownsend",
    baseUrl: "https://www.turnerandtownsend.com/", careersUrl: "https://www.turnerandtownsend.com/careers/",
  },
  {
    name: "Foodics", slug: "foodics-workable", type: "workable", providerOrganizationId: "foodics",
    baseUrl: "https://www.foodics.com/", careersUrl: "https://apply.workable.com/foodics/",
  },
];

export async function ensureDefaultPublicJobSources() {
  if (process.env.JOB_DEFAULT_PUBLIC_SOURCES_ENABLED === "false") return { registered: 0 };
  let registered = 0;
  for (const source of DEFAULT_PUBLIC_JOB_SOURCES) {
    const result = await JobSource.updateOne(
      { slug: source.slug },
      { $setOnInsert: {
        ...source, enabled: true, trusted: true, autoPublish: true, qualityThreshold: 90,
        syncFrequency: "daily", syncIntervalHours: 12, syncStatus: "idle", availabilityStatus: "available",
      } },
      { upsert: true },
    );
    if (result.upsertedCount) registered += 1;
  }
  return { registered };
}
