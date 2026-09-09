import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import { seedJobSourceDefinitions } from "../services/jobs/jobSourceSeed.service.js";
import { UAE_JOB_SOURCE_DEFINITIONS } from "../services/jobs/uaeSourceRegistry.js";

dotenv.config();

async function run() {
  const extra = JSON.parse(process.env.JOB_SOURCE_REGISTRY_JSON || "[]");
  if (!Array.isArray(extra)) throw new Error("JOB_SOURCE_REGISTRY_JSON must be an array.");
  const verify = process.argv.includes("--verify");
  await connectDB();
  const summary = await seedJobSourceDefinitions([...UAE_JOB_SOURCE_DEFINITIONS, ...extra], { verify });
  console.log(JSON.stringify({
    total: summary.total, created: summary.created, updated: summary.updated,
    verified: summary.verified, disabled: summary.disabled, verificationRun: verify,
  }, null, 2));
  process.exit(0);
}

run().catch((error) => { console.error(error); process.exit(1); });
