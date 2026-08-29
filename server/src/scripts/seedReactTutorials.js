import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import TopicCategory from "../models/TopicCategory.js";
import { buildReactSocialPost, REACT_SOCIAL_POST_CONTENT } from "../data/reactSocialPostContent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function repairReactSocialPosts() {
  console.log("Connecting to database...");
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);

  const admin = await User.findOne({ role: { $in: ["admin", "super_admin"] } }).sort({ createdAt: 1 });
  if (!admin) throw new Error("No admin user found. Cannot create posts.");

  let reactCourse = await Course.findOne({ slug: "reactjs" });
  if (!reactCourse) {
    reactCourse = await Course.create({ title: "React.js Mastery", slug: "reactjs", subtitle: "The complete guide to React.js and modern frontend development.", techId: "react", status: "published" });
  }

  let reactCategory = await TopicCategory.findOne({ course: reactCourse._id, slug: "react-core" });
  if (!reactCategory) {
    reactCategory = await TopicCategory.create({ name: "React Core Concepts", slug: "react-core", description: "Essential React and Next.js concepts.", course: reactCourse._id, status: "published" });
  }

  let created = 0;
  let updated = 0;
  let cancelledSchedules = 0;
  const topics = Object.keys(REACT_SOCIAL_POST_CONTENT);

  for (const [index, topic] of topics.entries()) {
    const content = buildReactSocialPost(topic, index);
    const matchingPosts = await SocialPost.find({ name: content.name }).sort({ createdAt: 1 });
    const post = matchingPosts[0];
    const values = { ...content, course: reactCourse._id, category: reactCategory._id, platform: "general", format: "square-1080", status: "ready", scheduledAt: null, updatedAt: new Date() };

    if (post) {
      post.set(values);
      await post.save();
      updated += 1;
    } else {
      await SocialPost.create({ ...values, createdBy: admin._id });
      created += 1;
    }

    const ids = matchingPosts.map((row) => row._id);
    if (ids.length) {
      const result = await SocialPublication.updateMany(
        { socialPost: { $in: ids }, status: { $in: ["scheduled", "failed"] }, $or: [{ assetPaths: { $exists: false } }, { assetPaths: { $size: 0 } }] },
        { $set: { status: "cancelled", errorMessage: "Cancelled during content repair because the schedule had no rendered image assets." } },
      );
      cancelledSchedules += result.modifiedCount;
    }
  }

  console.log(JSON.stringify({ topics: topics.length, created, updated, cancelledSchedules }, null, 2));
  await mongoose.disconnect();
}

repairReactSocialPosts().catch(async (error) => {
  console.error("React social-post repair failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
