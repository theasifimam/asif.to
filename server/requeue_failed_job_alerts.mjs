/**
 * requeue_failed_job_alerts.mjs
 * 
 * Re-queues EmailJob records for job-alert emails that failed due to the
 * `ReferenceError: url is not defined` bug in deliverJob() (email.service.js).
 * 
 * Run AFTER deploying the fix:
 *   node requeue_failed_job_alerts.mjs
 */
import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error("Set MONGO_URI env var first."); process.exit(1); }

await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, family: 4 });
console.log("✅ Connected\n");

const EmailJob = mongoose.model("EmailJob", new mongoose.Schema({}, { strict: false }));

// Find failed job-alert emails (key format: "job-alert:<alertId>:<jobId>")
const failed = await EmailJob.find({
  key: /^job-alert:/,
  status: "FAILED",
  safeToRetry: true,
}).lean();

console.log(`Found ${failed.length} failed job-alert email job(s) to re-queue.`);

if (failed.length) {
  const result = await EmailJob.updateMany(
    { _id: { $in: failed.map((j) => j._id) } },
    { $set: { status: "QUEUED", attempts: 0, error: null, availableAt: new Date() } },
  );
  console.log(`Re-queued ${result.modifiedCount} job(s).`);
} else {
  console.log("Nothing to re-queue.");
}

await mongoose.disconnect();
console.log("Done.");
