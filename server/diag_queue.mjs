import mongoose from "mongoose";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

const MONGO_URI = process.env.MONGO_URI;
await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000, family: 4 });
console.log("✅ Connected\n");

const EmailJob = mongoose.model("EmailJob", new mongoose.Schema({}, { strict: false }));
const CommunicationSettings = mongoose.model("CommunicationSettings", new mongoose.Schema({}, { strict: false }));

const settings = await CommunicationSettings.findOne({ key: "default" }).lean();
console.log("=== CommunicationSettings ===");
console.log("  workerOwner      :", settings?.workerOwner);
console.log("  workerLeaseUntil :", settings?.workerLeaseUntil, " -- expired?", settings?.workerLeaseUntil < new Date());
console.log("  nextSendAt       :", settings?.nextSendAt, " -- past?", !settings?.nextSendAt || settings?.nextSendAt <= new Date());
console.log("  senders          :", JSON.stringify(settings?.senders));
console.log("  ratePerMinute    :", settings?.ratePerMinute);
console.log();

const jobs = await EmailJob.find({ status: { $in: ["QUEUED", "SENDING", "FAILED"] } })
  .sort({ createdAt: -1 }).limit(10).lean();

console.log(`=== Last ${jobs.length} non-SENT jobs ===`);
for (const job of jobs) {
  console.log(`  [${job.status}] to=${job.recipient} attempts=${job.attempts ?? 0}`);
  console.log(`           availableAt=${job.availableAt}  ready? ${job.availableAt <= new Date()}`);
  console.log(`           error="${job.error || "(none)"}"`);
  console.log(`           leaseUntil=${job.leaseUntil || "(none)"}`);
}

await mongoose.disconnect();
