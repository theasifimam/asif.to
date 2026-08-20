import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../configs/db.js";
import Course from "../models/Course.js";
import TopicCategory from "../models/TopicCategory.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 140);
}

function parseList(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : String(value || "").split(",");
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

function computeCanonicalUrl(courseSlug, categorySlug, customUrl = "") {
  if (customUrl && /^https?:\/\//i.test(customUrl)) {
    return customUrl.trim();
  }

  const siteBase = "https://asif.to";
  const basePath = courseSlug
    ? `/${courseSlug}/interview-questions`
    : `/interview-questions`;

  return `${siteBase}${basePath}/${categorySlug}`;
}

/**
 * Normalizes input JSON into a flat array of category items with resolved courseSlug.
 */
function normalizePayload(rawData) {
  const items = [];

  const processBlock = (block, parentCourseSlug = "") => {
    if (!block || typeof block !== "object") return;

    const courseSlug = block.courseSlug || parentCourseSlug || "";

    if (Array.isArray(block.categories)) {
      for (const cat of block.categories) {
        items.push({
          ...cat,
          courseSlug: cat.courseSlug || courseSlug,
        });
      }
    } else if (block.name || block.slug) {
      items.push({
        ...block,
        courseSlug,
      });
    }
  };

  if (Array.isArray(rawData)) {
    for (const entry of rawData) {
      processBlock(entry);
    }
  } else if (typeof rawData === "object" && rawData !== null) {
    processBlock(rawData);
  }

  return items;
}

// Memory cache to avoid querying MongoDB for the same course multiple times
const courseCache = new Map();

async function getCourseBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  if (courseCache.has(cleanSlug)) return courseCache.get(cleanSlug);

  const course = await Course.findOne({ slug: cleanSlug });
  courseCache.set(cleanSlug, course);
  return course;
}

async function seedCourseCategories({
  filePath,
  isDryRun = false,
  skipDuplicates = false,
  validateOnly = false,
}) {
  console.log("=================================================");
  console.log("🚀 Course Categories Seeder");
  console.log(`📄 Input File: ${filePath}`);
  console.log(`⚙️  Options: validateOnly=${validateOnly}, dryRun=${isDryRun}, skipDuplicates=${skipDuplicates}`);
  console.log("=================================================\n");

  if (!fs.existsSync(filePath)) {
    throw new Error(`Input JSON file not found at: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  let rawData;
  try {
    rawData = JSON.parse(fileContent);
  } catch (err) {
    throw new Error(`Failed to parse JSON file: ${err.message}`);
  }

  const items = normalizePayload(rawData);
  if (!items.length) {
    console.warn("⚠️ No categories found in the JSON file.");
    return;
  }

  console.log(`📊 Found ${items.length} category(ies) to process.\n`);

  if (validateOnly) {
    console.log("🔍 Running offline schema and syntax validation...");
    let validCount = 0;
    const errors = [];

    items.forEach((item, idx) => {
      const issues = [];
      if (!item.name || !item.name.trim()) issues.push("Missing category name");
      if (!item.slug && !item.name) issues.push("Missing slug/name");
      if (item.status && !["draft", "published"].includes(item.status.toLowerCase())) {
        issues.push(`Invalid status: "${item.status}" (must be "draft" or "published")`);
      }

      if (issues.length > 0) {
        errors.push({ index: idx + 1, category: item.name || "(unnamed)", issues });
      } else {
        validCount++;
      }
    });

    console.log(`✅ Valid Categories: ${validCount}/${items.length}`);
    if (errors.length > 0) {
      console.log(`❌ Found ${errors.length} item(s) with validation issues:`);
      errors.forEach((e) => console.log(`  - [#${e.index}] ${e.category}: ${e.issues.join(", ")}`));
    } else {
      console.log("🎉 All categories passed offline schema validation!");
    }
    return;
  }

  await connectDB();

  const stats = {
    total: items.length,
    inserted: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const indexStr = `[#${i + 1}]`;

    try {
      if (!item.name || !item.name.trim()) {
        throw new Error("Category name is required.");
      }

      // 1. Resolve Course (if provided)
      let courseDoc = null;
      if (item.courseSlug) {
        courseDoc = await getCourseBySlug(item.courseSlug);
        if (!courseDoc) {
          throw new Error(`Course with slug "${item.courseSlug}" not found in database.`);
        }
      }

      const categorySlug = slugify(item.slug || item.name);
      if (!categorySlug) {
        throw new Error("Could not generate valid slug for category.");
      }

      const keywords = parseList(item.keywords);
      const canonicalUrl = computeCanonicalUrl(
        courseDoc?.slug,
        categorySlug,
        item.canonicalUrl,
      );

      const categoryData = {
        name: item.name.trim().slice(0, 120),
        slug: categorySlug,
        description: item.description ? String(item.description).trim().slice(0, 500) : "",
        content: item.content || "",
        thumbnail: item.thumbnail || "",
        course: courseDoc ? courseDoc._id : null,
        order: typeof item.order === "number" ? item.order : i + 1,
        status: item.status === "draft" ? "draft" : "published",
        seoTitle: item.seoTitle ? String(item.seoTitle).trim().slice(0, 70) : `${item.name.trim()} - Interview Questions`,
        seoDescription: item.seoDescription ? String(item.seoDescription).trim().slice(0, 170) : (item.description ? String(item.description).trim().slice(0, 170) : ""),
        keywords,
        canonicalUrl,
        ogTitle: item.ogTitle ? String(item.ogTitle).trim().slice(0, 100) : "",
        ogDescription: item.ogDescription ? String(item.ogDescription).trim().slice(0, 200) : "",
        ogImage: item.ogImage || "",
        twitterTitle: item.twitterTitle ? String(item.twitterTitle).trim().slice(0, 100) : "",
        twitterDescription: item.twitterDescription ? String(item.twitterDescription).trim().slice(0, 200) : "",
        twitterImage: item.twitterImage || "",
        noindex: Boolean(item.noindex),
        nofollow: Boolean(item.nofollow),
      };

      // 2. Check for existing category by slug under same course
      const query = {
        slug: categorySlug,
        course: courseDoc ? courseDoc._id : null,
      };

      const existingCategory = await TopicCategory.findOne(query);

      if (existingCategory) {
        if (skipDuplicates) {
          console.log(`⏩ ${indexStr} Skipped (already exists): "${item.name}" (slug: ${categorySlug})`);
          stats.skipped++;
          continue;
        }

        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Would UPDATE existing category: "${item.name}" (slug: ${categorySlug})`);
          stats.updated++;
        } else {
          Object.assign(existingCategory, categoryData);
          await existingCategory.save();
          console.log(`🔄 ${indexStr} Updated: "${item.name}" (slug: ${categorySlug})`);
          stats.updated++;
        }
      } else {
        if (isDryRun) {
          console.log(`🔍 [DRY-RUN] Would INSERT new category: "${item.name}" (slug: ${categorySlug})`);
          stats.inserted++;
        } else {
          await TopicCategory.create(categoryData);
          console.log(`✅ ${indexStr} Inserted: "${item.name}" (slug: ${categorySlug})`);
          stats.inserted++;
        }
      }
    } catch (err) {
      stats.failed++;
      stats.errors.push({
        index: i + 1,
        category: item?.name || "(unknown)",
        error: err.message,
      });
      console.error(`❌ ${indexStr} Failed: "${item?.name || 'Unknown'}" -> ${err.message}`);
    }
  }

  console.log("\n=================================================");
  console.log("📈 Seeding Summary:");
  console.log(`   Total Read:    ${stats.total}`);
  console.log(`   Inserted:      ${stats.inserted}`);
  console.log(`   Updated:       ${stats.updated}`);
  console.log(`   Skipped:       ${stats.skipped}`);
  console.log(`   Failed/Errors: ${stats.failed}`);
  console.log("=================================================");

  if (stats.errors.length > 0) {
    console.log("\n⚠️ Error Details:");
    stats.errors.forEach((e) => {
      console.log(` - Item #${e.index}: [${e.category}] => ${e.error}`);
    });
  }

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected from database.");
}

// Command-line execution support
const args = process.argv.slice(2);
const defaultFilePath = path.resolve(__dirname, "./data/sample_course_categories.json");

let customFilePath = "";
let isDryRun = false;
let skipDuplicates = false;
let validateOnly = false;

for (const arg of args) {
  if (arg === "--dry-run") isDryRun = true;
  else if (arg === "--validate-only") validateOnly = true;
  else if (arg === "--skip-duplicates") skipDuplicates = true;
  else if (arg.startsWith("--file=")) customFilePath = arg.replace("--file=", "").trim();
  else if (!arg.startsWith("--")) customFilePath = arg.trim();
}

const targetFilePath = customFilePath
  ? path.isAbsolute(customFilePath)
    ? customFilePath
    : path.resolve(process.cwd(), customFilePath)
  : defaultFilePath;

seedCourseCategories({
  filePath: targetFilePath,
  isDryRun,
  skipDuplicates,
  validateOnly,
}).catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});
