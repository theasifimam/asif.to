import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import JobSource from "../models/JobSource.js";
import { verifyAndPersistJobSource } from "../services/jobs/jobSourceVerification.service.js";
import { UAE_JOB_SOURCE_SLUGS } from "../services/jobs/uaeSourceRegistry.js";

dotenv.config();

async function run() {
  await connectDB();
  const reportOnly = process.argv.includes("--report-only");
  const sources = await JobSource.find({ slug: { $in: UAE_JOB_SOURCE_SLUGS } }).sort({ type: 1, name: 1 });
  const rows = [];
  for (const source of sources) {
    const result = reportOnly ? {
      verificationStatus: source.verificationStatus,
      jobsFound: source.verifiedJobsFound,
      uaeJobsFound: source.verifiedUaeJobsFound,
      canSync: source.verificationStatus === "Verified",
      error: source.lastError || null,
    } : await verifyAndPersistJobSource(source);
    rows.push({
      name: source.name, provider: source.type, status: result.verificationStatus,
      jobsFound: result.jobsFound, uaeJobsFound: result.uaeJobsFound, canSync: result.canSync,
      enabled: source.enabled, error: result.error,
    });
  }
  const statusCounts = rows.reduce((out, row) => ({ ...out, [row.status]: (out[row.status] || 0) + 1 }), {});
  const providers = rows.reduce((out, row) => {
    const current = out[row.provider] || { total: 0, verified: 0, enabled: 0, uaeJobsFound: 0 };
    current.total += 1;
    current.verified += row.status === "Verified" ? 1 : 0;
    current.enabled += row.enabled ? 1 : 0;
    current.uaeJobsFound += row.uaeJobsFound;
    out[row.provider] = current;
    return out;
  }, {});
  console.log(JSON.stringify({ total: rows.length, reportOnly, statusCounts, providers, rows }, null, 2));
  process.exit(0);
}

run().catch((error) => { console.error(error); process.exit(1); });
