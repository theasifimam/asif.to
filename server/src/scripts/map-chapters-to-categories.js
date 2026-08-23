import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import TopicCategory from "../models/TopicCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function slugify(v = "") {
  return String(v)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 140);
}

const STOP = new Set(
  "a an and are as at be been but by can do does for from how if in into is it of on or should that the this to use used using what when where which why with you your course chapter guide tutorial complete master".split(" ")
);

function norm(v = "") {
  return String(v)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(v = "") {
  return Array.from(
    new Set(norm(v).split(" ").filter((t) => t.length >= 2 && !STOP.has(t)))
  );
}

function computeSimilarity(textA, textB) {
  const normA = norm(textA);
  const tokensA = tokens(textA);
  const tokensB = tokens(textB);

  if (!tokensA.length || !tokensB.length) return 0;

  let matches = 0;
  tokensB.forEach((t) => {
    if (tokensA.includes(t)) matches++;
  });

  let score = (matches / Math.max(tokensB.length, 1)) * 70;

  tokensB.forEach((t) => {
    if (t.length >= 4 && normA.includes(t)) score += 10;
  });

  return Math.min(100, Math.round(score));
}

// Default Category Templates for Courses that don't have categories yet
const DEFAULT_COURSE_CATEGORIES = {
  html: [
    { name: "HTML Fundamentals & Structure", chapters: [1, 2, 3] },
    { name: "Forms & User Inputs", chapters: [4, 5] },
    { name: "Semantic HTML & Accessibility", chapters: [6, 7, 8] },
    { name: "SEO & Best Practices", chapters: [9, 10, 11, 12] },
  ],
  nodejs: [
    { name: "Node.js Core Fundamentals", chapters: [1, 2, 3, 4] },
    { name: "Express.js & Routing", chapters: [5, 6, 7] },
    { name: "REST APIs & Middleware", chapters: [8, 9, 10] },
    { name: "Authentication & Security", chapters: [11, 12, 13] },
    { name: "Database Integration & Testing", chapters: [14, 15, 16, 17] },
  ],
  mongodb: [
    { name: "MongoDB Basics & CRUD", chapters: [1, 2, 3, 4] },
    { name: "Indexing & Performance", chapters: [5, 6, 7] },
    { name: "Mongoose ODM & Schemas", chapters: [8, 9, 10] },
    { name: "Aggregation Framework", chapters: [11, 12, 13] },
    { name: "Security & Production Setup", chapters: [14, 15] },
  ],
  tailwindcss: [
    { name: "Tailwind CSS Setup & Utility First", chapters: [1, 2] },
    { name: "Layouts & Responsive Design", chapters: [3, 4] },
    { name: "Customization & Production", chapters: [5, 6] },
  ],
  css: [
    { name: "CSS Fundamentals & Selectors", chapters: [1, 2, 3, 4, 5] },
    { name: "Box Model & Flexbox Layouts", chapters: [6, 7, 8, 9, 10] },
    { name: "CSS Grid & Responsive Design", chapters: [11, 12, 13, 14, 15] },
    { name: "Animations, Transitions & Effects", chapters: [16, 17, 18, 19, 20] },
    { name: "Modern CSS Architecture & Variables", chapters: [21, 22, 23, 24, 25, 26, 27] },
  ],
};

async function processCourseChapters(course) {
  console.log(`\n-------------------------------------------------------`);
  console.log(`Course: ${course.title} [techId: ${course.techId || course.slug}]`);
  console.log(`-------------------------------------------------------`);

  let chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });
  let categories = await TopicCategory.find({ course: course._id }).sort({ order: 1 });

  if (!chapters.length) {
    console.log(`⚠️ No chapters found for "${course.title}". Skipping.`);
    return { title: course.title, chaptersMapped: 0, categoriesCount: 0 };
  }

  // If course has no categories, seed them based on templates or automatic groupings
  if (!categories.length) {
    const techKey = course.techId || course.slug;
    const template = DEFAULT_COURSE_CATEGORIES[techKey];

    if (template) {
      console.log(`Creating ${template.length} topic categories for ${course.title}...`);
      for (let i = 0; i < template.length; i++) {
        const catInfo = template[i];
        const catSlug = slugify(`${course.slug}-${catInfo.name}`);
        let categoryDoc = await TopicCategory.findOne({ course: course._id, slug: catSlug });

        if (!categoryDoc) {
          categoryDoc = await TopicCategory.create({
            name: catInfo.name,
            slug: catSlug,
            description: `Topic category covering ${catInfo.name} in ${course.title}.`,
            course: course._id,
            order: i + 1,
            status: "published",
            canonicalUrl: `https://asif.to/${course.slug}/interview-questions/${catSlug}`,
          });
        }

        // Link chapters specified in template
        for (const orderIdx of catInfo.chapters) {
          const ch = chapters.find((c) => c.order === orderIdx || chapters.indexOf(c) + 1 === orderIdx);
          if (ch) {
            ch.category = categoryDoc._id;
            await ch.save();
          }
        }
      }

      // Refresh categories and chapters
      categories = await TopicCategory.find({ course: course._id }).sort({ order: 1 });
      chapters = await Chapter.find({ course: course._id }).sort({ order: 1 });
    }
  }

  if (!categories.length) {
    console.log(`⚠️ No categories available for ${course.title}. Skipped.`);
    return { title: course.title, chaptersMapped: 0, categoriesCount: 0 };
  }

  console.log(`Found ${chapters.length} chapters and ${categories.length} topic categories.`);

  let mappedCount = 0;

  // Track featuredChapters per category
  const categoryChaptersMap = new Map();
  categories.forEach((cat) => categoryChaptersMap.set(String(cat._id), new Set(cat.featuredChapters.map(String))));

  for (const ch of chapters) {
    let bestCategory = null;

    // Check if chapter already has valid category
    if (ch.category && categories.some((cat) => String(cat._id) === String(ch.category))) {
      bestCategory = categories.find((cat) => String(cat._id) === String(ch.category));
    }

    // Match by text similarity if not set
    if (!bestCategory) {
      const chText = [ch.title, ch.summary, ...(ch.keywords || [])].join(" ");
      let bestScore = -1;

      for (const cat of categories) {
        const catTextStr = [cat.name, cat.description, ...(cat.keywords || [])].join(" ");
        const score = computeSimilarity(chText, catTextStr);
        if (score > bestScore) {
          bestScore = score;
          bestCategory = cat;
        }
      }
    }

    // Fallback to first category if unassigned
    if (!bestCategory && categories.length) {
      bestCategory = categories[0];
    }

    if (bestCategory) {
      ch.category = bestCategory._id;
      await ch.save();
      mappedCount++;

      const set = categoryChaptersMap.get(String(bestCategory._id));
      if (set) set.add(String(ch._id));

      console.log(`  ✓ Chapter: "${ch.title}" -> Category: "${bestCategory.name}"`);
    }
  }

  // Update TopicCategory.featuredChapters for each category
  for (const cat of categories) {
    const chapterIds = Array.from(categoryChaptersMap.get(String(cat._id)) || []);
    cat.featuredChapters = chapterIds;
    await cat.save();
  }

  console.log(`✅ Successfully categorized all ${mappedCount} chapters for ${course.title}!`);

  return { title: course.title, chaptersMapped: mappedCount, categoriesCount: categories.length };
}

async function main() {
  await connectDB();
  console.log("\n=======================================================");
  console.log("Categorizing Chapters by Topic Categories for All Courses");
  console.log("=======================================================");

  const courses = await Course.find({}).sort({ order: 1, createdAt: 1 });
  const summary = [];

  for (const course of courses) {
    const res = await processCourseChapters(course);
    summary.push(res);
  }

  console.log("\n=======================================================");
  console.log("CHAPTER CATEGORIZATION SUMMARY:");
  console.log("=======================================================");
  console.table(summary);
  console.log("=======================================================\n");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
