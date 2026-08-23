import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function seed() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  console.log("Finding admin user...");
  const admin = await User.findOne({ role: { $in: ["admin", "super_admin"] } });
  if (!admin) {
    console.error("No admin user found. Cannot create posts.");
    process.exit(1);
  }

  console.log(`Found admin: ${admin.username} (${admin._id})`);

  // Start from next Saturday at 18:00
  let nextSaturday = new Date();
  const daysUntilSaturday = (6 - nextSaturday.getDay() + 7) % 7;
  const extraDays = daysUntilSaturday === 0 && nextSaturday.getHours() >= 18 ? 7 : daysUntilSaturday;
  nextSaturday.setDate(nextSaturday.getDate() + extraDays);
  nextSaturday.setHours(18, 0, 0, 0);

  console.log(`First post will be scheduled for: ${nextSaturday.toLocaleString()}`);

  const sampleTitles = [
    "5 Tips for React Performance",
    "Understanding Node.js Event Loop",
    "CSS Grid vs Flexbox",
    "MongoDB Aggregation Pipelines",
    "Next.js 14 Features Explained",
    "Typescript Generics Demystified",
    "Docker Basics for Web Developers",
    "Kubernetes in 10 Minutes",
    "REST vs GraphQL",
    "Authentication in Next.js"
  ];

  const PLATFORMS = ["instagram", "linkedin", "facebook"];

  let currentDate = new Date(nextSaturday.getTime());
  let createdCount = 0;

  for (let i = 0; i < 50; i++) {
    const title = sampleTitles[i % sampleTitles.length] + ` (Part ${Math.floor(i / sampleTitles.length) + 1})`;
    
    // Create the Post
    const post = await SocialPost.create({
      name: title,
      category: "Web Development",
      caption: `Check out our latest post about ${title}! Let us know your thoughts below. \n\n#webdev #coding #programming`,
      hashtags: ["webdev", "coding", "programming"],
      platform: "general",
      format: "square-1080",
      status: "scheduled",
      slides: [
        {
          id: `slide-${i}-1`,
          order: 0,
          template: "developer-tip",
          title: title,
          body: "This is a placeholder body for the scheduled post. Stay tuned for more!",
        }
      ],
      createdBy: admin._id,
    });

    // Create the Publication schedules
    for (const platform of PLATFORMS) {
      await SocialPublication.create({
        socialPost: post._id,
        platform,
        status: "scheduled",
        caption: post.caption,
        scheduledAt: currentDate,
        publishedBy: admin._id,
      });
    }

    // Advance by 7 days for the next post
    currentDate.setDate(currentDate.getDate() + 7);
    createdCount++;
  }

  console.log(`Successfully generated ${createdCount} scheduled social posts with associated publications.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
