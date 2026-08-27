import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import Question from "../models/Question.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function main() {
  await connectDB();
  const course = await Course.findOne({
    $or: [
      { slug: "reactjs" },
      { slug: "react-js" },
      { slug: "react" },
      { techId: "reactjs" },
      { title: /react/i },
    ],
  }).sort({ createdAt: 1 });

  console.log("Found React Course:", course ? { id: course._id, title: course.title, slug: course.slug } : "NONE");

  if (!course) {
    process.exit(1);
  }

  const chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });
  console.log(`Found ${chapters.length} chapters for ReactJS course:\n`);

  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    console.log(`${i + 1}. [${c.slug}] ${c.title}`);
    console.log(`   - codingProblems: ${c.codingProblems?.length || 0}`);
    console.log(`   - revisionQuestions: ${c.learningActivities?.revisionQuestions?.length || 0}`);
    console.log(`   - practiceQuestions: ${c.learningActivities?.practiceQuestions?.length || 0}`);
    console.log(`   - build: ${c.learningActivities?.build?.enabled ? c.learningActivities?.build?.title : "disabled"}`);
  }

  const questionsCount = await Question.countDocuments({ courses: course._id });
  console.log(`\nTotal questions linked to React course: ${questionsCount}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
