import { SOURCE_TYPES } from "../../constants/jobs.js";
import JobSource from "../../models/JobSource.js";
import { slugify } from "../../utils/slugify.js";
import { verifyAndPersistJobSource } from "./jobSourceVerification.service.js";

export async function seedJobSourceDefinitions(definitions, {
  JobSourceModel = JobSource, verify = false, verifySource = verifyAndPersistJobSource,
} = {}) {
  if (!Array.isArray(definitions)) throw new Error("Job source definitions must be an array.");
  const seen = new Set();
  const summary = { total: definitions.length, created: 0, updated: 0, verified: 0, disabled: 0, results: [] };
  for (const item of definitions) {
    if (!item.name || !SOURCE_TYPES.includes(item.type)) throw new Error("Each source needs a name and supported type.");
    const slug = slugify(item.slug || `${item.type}-${item.name}`);
    if (!slug || seen.has(slug)) throw new Error(`Duplicate or invalid job source slug: ${slug || "(empty)"}`);
    seen.add(slug);
    const metadata = {
      name: item.name, type: item.type, providerOrganizationId: item.providerOrganizationId || "", providerRegion: item.providerRegion || "global",
      baseUrl: item.baseUrl || "", careersUrl: item.careersUrl || "", endpointUrl: item.endpointUrl || "", jobsPath: item.jobsPath || "",
      fieldMapping: item.fieldMapping || {}, credentialEnvKey: item.credentialEnvKey || "",
    };
    const insertDefaults = {
      slug, enabled: false, autoPublish: item.autoPublish !== false, trusted: item.trusted !== false,
      qualityThreshold: item.qualityThreshold || 90, syncFrequency: item.syncFrequency || "daily", syncIntervalHours: item.syncIntervalHours || 6,
      verificationStatus: item.verificationStatus || "Requires Review", verificationNotes: item.verificationNotes || "Pending live verification.",
    };
    const write = await JobSourceModel.updateOne({ slug }, { $set: metadata, $setOnInsert: insertDefaults }, { upsert: true });
    const created = Boolean(write.upsertedCount);
    summary[created ? "created" : "updated"] += 1;
    const stored = await JobSourceModel.findOne({ slug });
    let verification = null;
    if (verify) {
      verification = await verifySource(stored, { JobSourceModel, enableWhenVerified: created });
      if (verification.canSync) summary.verified += 1;
      else summary.disabled += 1;
    }
    summary.results.push({ slug, created, verification });
  }
  return summary;
}
