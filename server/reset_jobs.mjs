import mongoose from "mongoose";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000, family: 4 });
console.log("✅ Connected");

const EmailJob = mongoose.model("EmailJob", new mongoose.Schema({}, { strict: false }));

const result = await EmailJob.updateMany(
  { status: "QUEUED", error: "Communications signing secret is not configured." },
  { $set: { availableAt: new Date(), attempts: 0, error: "" } }
);
console.log(`✅ Reset ${result.modifiedCount} jobs to retry immediately`);

await mongoose.disconnect();
