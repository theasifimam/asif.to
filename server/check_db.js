import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
import Course from "./src/models/Course.js";
import Chapter from "./src/models/Chapter.js";

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const courses = await Course.find();
    const chapters = await Chapter.find();
    console.log("Total courses:", courses.length);
    console.log("Total chapters:", chapters.length);
    
    for (const c of courses) {
      const courseChapters = chapters.filter(ch => ch.course.toString() === c._id.toString());
      const views = courseChapters.reduce((acc, ch) => acc + (ch.viewCount || 0), 0);
      console.log(`- ${c.title} (${c.techId}): ${views} reads`);
    }
    
    process.exit(0);
  });
