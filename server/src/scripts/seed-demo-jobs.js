import dotenv from "dotenv";
import connectDB from "../configs/db.js";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobSource from "../models/JobSource.js";
import { normalizedJobFingerprint } from "../utils/jobValidation.js";

dotenv.config();

const addDays = (days) => new Date(Date.now() + days * 86_400_000);

const companies = [
  { name: "Demo Mobility Labs", slug: "demo-mobility-labs", industry: "Technology", size: "201–500", headquarters: "Dubai, UAE", description: "A fictional company used only to verify the asif.to Jobs module.", verified: true, active: true },
  { name: "Demo Gulf Projects", slug: "demo-gulf-projects", industry: "Construction", size: "501–1,000", headquarters: "Abu Dhabi, UAE", description: "A fictional project services company for testing job discovery and applications.", active: true },
  { name: "Demo Hospitality Group", slug: "demo-hospitality-group", industry: "Hospitality", size: "1,001–5,000", headquarters: "Dubai, UAE", description: "A fictional hospitality group used as clearly marked test data.", active: true },
];

const jobs = [
  {
    title: "Demo Frontend Developer", slug: "demo-frontend-developer-dubai", companySlug: "demo-mobility-labs", description: "This is a demonstration listing for testing the asif.to Jobs module. Build accessible React interfaces, collaborate with API engineers, and improve frontend performance. Do not treat this as a live vacancy.",
    responsibilities: ["Build responsive React user interfaces", "Review code and improve web performance", "Collaborate with design and backend teams"], requirements: ["Strong JavaScript and React fundamentals", "Experience with accessible, responsive interfaces", "Clear written communication"], benefits: ["Flexible hybrid schedule", "Learning budget"], skills: ["React", "JavaScript", "Accessibility"], category: "Software Development", categorySlug: "software-development", location: "Dubai", locationSlug: "dubai", emirate: "Dubai", employmentType: "full-time", workMode: "hybrid", experienceLevel: "mid", minimumExperience: 2, maximumExperience: 5, minimumSalary: 14000, maximumSalary: 19000, salaryVisible: true, applicationType: "external", applicationUrl: "https://example.com/asif-jobs-demo/frontend-developer", sourceUrl: "https://example.com/asif-jobs-demo/frontend-developer", postedAt: addDays(-2), expiresAt: addDays(30), status: "published", featured: true,
  },
  {
    title: "Demo Document Controller", slug: "demo-document-controller-abu-dhabi", companySlug: "demo-gulf-projects", description: "This clearly marked demonstration job tests direct applications and private CV upload. Maintain document registers, coordinate revisions, and support project controls. This is not a genuine vacancy.",
    responsibilities: ["Maintain controlled document registers", "Coordinate document review and revision workflows", "Prepare weekly status reports"], requirements: ["Two years of document control experience", "Comfort with project filing conventions"], benefits: ["Transport allowance"], skills: ["Document Control", "Excel", "Aconex"], category: "Document Control", categorySlug: "document-control", location: "Abu Dhabi", locationSlug: "abu-dhabi", emirate: "Abu Dhabi", employmentType: "contract", workMode: "on-site", experienceLevel: "junior", minimumExperience: 2, maximumExperience: 4, salaryVisible: false, applicationType: "internal", postedAt: addDays(-4), expiresAt: addDays(21), status: "published",
  },
  {
    title: "Demo Finance Analyst", slug: "demo-finance-analyst-sharjah", companySlug: "demo-mobility-labs", description: "A fictional finance vacancy for verifying featured cards, salary filters, and company pages. This test listing is not accepting genuine candidates.",
    responsibilities: ["Prepare monthly variance analysis", "Maintain financial models"], requirements: ["Degree in finance or accounting", "Advanced spreadsheet skills"], skills: ["Financial Analysis", "Excel", "Forecasting"], category: "Finance", categorySlug: "finance", location: "Sharjah", locationSlug: "sharjah", emirate: "Sharjah", employmentType: "full-time", workMode: "hybrid", experienceLevel: "mid", minimumExperience: 3, maximumExperience: 6, minimumSalary: 11000, maximumSalary: 15000, salaryVisible: true, applicationType: "external", applicationUrl: "https://example.com/asif-jobs-demo/finance-analyst", sourceUrl: "https://example.com/asif-jobs-demo/finance-analyst", postedAt: addDays(-7), expiresAt: addDays(24), status: "published", featured: true,
  },
  {
    title: "Demo Hospitality Operations Supervisor", slug: "demo-hospitality-operations-supervisor", companySlug: "demo-hospitality-group", description: "An expired fictional vacancy included to verify expired URL behavior and related-job fallback.", responsibilities: ["Coordinate daily outlet operations"], requirements: ["Previous hospitality supervision experience"], skills: ["Hospitality", "Operations"], category: "Hospitality", categorySlug: "hospitality", location: "Dubai", locationSlug: "dubai", emirate: "Dubai", employmentType: "full-time", workMode: "on-site", experienceLevel: "senior", salaryVisible: false, applicationType: "external", applicationUrl: "https://example.com/asif-jobs-demo/expired", sourceUrl: "https://example.com/asif-jobs-demo/expired", postedAt: addDays(-45), expiresAt: addDays(-1), status: "expired",
  },
];

async function run() {
  await connectDB();
  const source = await JobSource.findOneAndUpdate(
    { slug: "manual-demo" },
    { $set: { name: "Manual Demo Data", type: "manual", enabled: true, syncFrequency: "manual" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const companyMap = new Map();
  for (const data of companies) {
    const company = await Company.findOneAndUpdate({ slug: data.slug }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    companyMap.set(data.slug, company);
  }
  for (const data of jobs) {
    const company = companyMap.get(data.companySlug);
    const { companySlug, ...values } = data;
    const normalizedApplicationUrl = values.applicationUrl ? values.applicationUrl.toLowerCase().replace(/\/$/, "") : "";
    await Job.findOneAndUpdate(
      { slug: values.slug },
      { $set: { ...values, company: company._id, companyName: company.name, companyLogo: company.logo || "", country: "AE", salaryCurrency: "AED", salaryPeriod: values.salaryPeriod || "month", source: source._id, sourceName: source.name, sourceJobId: `demo:${values.slug}`, normalizedApplicationUrl, fingerprint: normalizedJobFingerprint({ title: values.title, companyName: company.name, location: values.location }), verified: true, isDemo: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
  }
  console.log(`Seeded ${jobs.length} clearly marked demo jobs and ${companies.length} demo companies.`);
  process.exit(0);
}

run().catch((error) => { console.error(error); process.exit(1); });

