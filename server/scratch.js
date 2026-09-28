import connectDB from './src/configs/db.js';
import Job from './src/models/Job.js';
import JobSource from './src/models/JobSource.js';

async function run() {
  await connectDB();
  const jobs = await Job.aggregate([
    {
      $match: {
        sourceProvider: { $in: ["manual", "employer-career-page", "other"] },
        applicationUrl: { $exists: true, $ne: "" },
      },
    },
    {
      $group: {
        _id: "$company",
        companyName: { $first: "$companyName" },
        applicationUrl: { $first: "$applicationUrl" },
        sourceUrl: { $first: "$sourceUrl" },
        createdAt: { $first: "$createdAt" }
      },
    },
    { $limit: 10 },
  ]);
  console.log("Jobs matching criteria:", jobs.length);
  if (jobs.length > 0) {
    console.log(JSON.stringify(jobs, null, 2));
  }
  
  const sources = await JobSource.find({ enabled: true, careersUrl: { $ne: "" } })
    .select("name careersUrl baseUrl type providerOrganizationId")
    .limit(10)
    .lean();
  console.log("Sources matching criteria:", sources.length);
  if (sources.length > 0) {
    console.log(JSON.stringify(sources, null, 2));
  }
  process.exit(0);
}

run().catch(console.error);
