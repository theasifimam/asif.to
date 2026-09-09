import { cleanText } from "../../utils/jobValidation.js";
import { providerForSource } from "./providers/index.js";

const statusFromError = (error) => {
  const statusCode = Number(error?.statusCode);
  if ([401, 403, 429].includes(statusCode)) return "Blocked";
  if (statusCode === 404) return "Source Unavailable";
  if (/not configured|did not contain|was not an array|invalid/i.test(error?.message || "")) return "Requires Review";
  return "Source Unavailable";
};

export async function verifyJobSource(source, { providerOptions } = {}) {
  const checkedAt = new Date();
  try {
    const provider = providerForSource(source, providerOptions);
    const uaeJobs = await provider.fetchJobs();
    const stats = provider.lastFetchStats || { jobsFound: uaeJobs.length, uaeJobsFound: uaeJobs.length };
    const jobsFound = Math.max(0, Number(stats.jobsFound) || 0);
    const uaeJobsFound = Math.max(0, Number(stats.uaeJobsFound) || 0);
    const canSync = uaeJobsFound > 0;
    return {
      reachable: true, providerValid: true, jobsFound, uaeJobsFound, canSync,
      verificationStatus: canSync ? "Verified" : "No UAE Jobs Currently",
      checkedAt, error: null,
      notes: canSync
        ? `Public ${source.type} response is valid; ${uaeJobsFound} UAE job(s) found.`
        : `Public ${source.type} response is valid, but no current job has a normalized UAE location.`,
    };
  } catch (error) {
    const verificationStatus = statusFromError(error);
    return {
      reachable: false, providerValid: false, jobsFound: 0, uaeJobsFound: 0, canSync: false,
      verificationStatus, checkedAt, error: cleanText(error?.message || "Verification failed.", 1000),
      notes: `Automatic sync remains disabled: ${cleanText(error?.message || "verification failed", 900)}`,
    };
  }
}

export function verificationFields(result) {
  return {
    verificationStatus: result.verificationStatus,
    lastVerifiedAt: result.checkedAt,
    verificationNotes: cleanText(result.notes, 2000),
    verifiedJobsFound: result.jobsFound,
    verifiedUaeJobsFound: result.uaeJobsFound,
    availabilityStatus: result.reachable ? "available" : result.verificationStatus === "Requires Review" ? "misconfigured" : "unavailable",
    lastError: result.error || "",
  };
}

export async function verifyAndPersistJobSource(source, { JobSourceModel, providerOptions, enableWhenVerified = false } = {}) {
  const result = await verifyJobSource(source, { providerOptions });
  const update = verificationFields(result);
  if (!result.canSync) update.enabled = false;
  else if (enableWhenVerified) update.enabled = true;
  const Model = JobSourceModel || (await import("../../models/JobSource.js")).default;
  await Model.updateOne({ _id: source._id }, { $set: update });
  return result;
}
