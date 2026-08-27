import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sharp from "sharp";

import connectDB from "../configs/db.js";
import Asset from "../models/Asset.js";
import AssetUsage from "../models/AssetUsage.js";
import Article from "../models/Article.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import Page from "../models/Page.js";
import Question from "../models/Question.js";
import SeoSetting from "../models/SeoSetting.js";
import SocialPublication from "../models/SocialPublication.js";
import TopicCategory from "../models/TopicCategory.js";
import User from "../models/User.js";
import { assetTypeDefinitions, describeAssetFile } from "../utils/assetFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const apply = process.argv.includes("--apply");

const sources = [
  [Article, "article", "title", (doc) => `/articles/edit/${doc._id}`],
  [Course, "course", "title", (doc) => `/courses/${doc._id}/edit`],
  [CourseTopic, "course_topic", "title", (doc) => `/courses/${doc.course}`],
  [TopicCategory, "topic_category", "name", (doc) => `/categories/${doc._id}/edit`],
  [Question, "question", "question", (doc) => `/quiz/${doc._id}/edit`],
  [SeoSetting, "seo_setting", "path", () => "/seo-settings"],
  [SocialPublication, "social_publication", "platform", (doc) => `/social-posts/${doc.socialPost}`],
  [User, "user", "fullName", (doc) => `/users/${doc._id}`],
  [Page, "page", "title", (doc) => `/legal/${doc.slug}`],
];

function relativeUploadPath(value) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\\/g, "/").split(/[?#]/)[0];
  const marker = normalized.toLowerCase().indexOf("/uploads/");
  if (marker < 0) return null;
  try {
    return decodeURIComponent(normalized.slice(marker + 9)).replace(/^\/+/, "");
  } catch {
    return normalized.slice(marker + 9).replace(/^\/+/, "");
  }
}

function collectReferences(value, field = "", output = [], seen = new WeakSet()) {
  if (typeof value === "string") {
    const storageKey = relativeUploadPath(value);
    if (storageKey) output.push({ storageKey, field: field || "content" });
    return output;
  }
  if (!value || typeof value !== "object" || seen.has(value)) return output;
  seen.add(value);
  if (Array.isArray(value)) value.forEach((item, index) => collectReferences(item, `${field}[${index}]`, output, seen));
  else Object.entries(value).forEach(([key, item]) => collectReferences(item, field ? `${field}.${key}` : key, output, seen));
  return output;
}

async function listFiles(directory, prefix = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const output = [];
  for (const entry of entries) {
    const storageKey = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) output.push(...(await listFiles(path.join(directory, entry.name), storageKey)));
    else if (assetTypeDefinitions[path.extname(entry.name).toLowerCase()]) output.push(storageKey);
  }
  return output;
}

async function main() {
  await connectDB();
  const summary = { scanned: 0, existing: 0, indexed: 0, skipped: 0, usages: 0 };
  const files = await listFiles(uploadsRoot);
  const assetsByKey = new Map();

  for (const storageKey of files) {
    if (storageKey.startsWith("assets/thumbnails/")) continue;
    summary.scanned += 1;
    let asset = await Asset.findOne({ storageKey });
    if (asset) {
      summary.existing += 1;
      assetsByKey.set(storageKey, asset);
      continue;
    }
    try {
      const buffer = await fs.readFile(path.join(uploadsRoot, storageKey));
      const description = describeAssetFile({ originalname: path.basename(storageKey), buffer });
      let width = null;
      let height = null;
      if (description.category === "image") {
        const metadata = await sharp(buffer, { animated: description.extension === ".gif" }).metadata();
        width = metadata.width || null;
        height = metadata.height || null;
      }
      summary.indexed += 1;
      if (apply) {
        asset = await Asset.create({
          name: path.basename(storageKey),
          originalName: path.basename(storageKey),
          storageKey,
          storageProvider: "local",
          mimeType: description.mimeType,
          extension: description.extension,
          category: description.category,
          size: buffer.length,
          width,
          height,
          visibility: "public",
          checksum: crypto.createHash("sha256").update(buffer).digest("hex"),
          uploadedBy: null,
        });
        assetsByKey.set(storageKey, asset);
      } else {
        assetsByKey.set(storageKey, { _id: null });
      }
    } catch (error) {
      summary.skipped += 1;
      console.warn(`[assets:index] skipped ${storageKey}: ${error.message}`);
    }
  }

  for (const [Model, entityType, titleField, route] of sources) {
    const documents = await Model.find({}).lean();
    for (const document of documents) {
      const references = collectReferences(document);
      for (const reference of references) {
        const asset = assetsByKey.get(reference.storageKey);
        if (!asset) continue;
        summary.usages += 1;
        if (apply) {
          await AssetUsage.updateOne(
            { asset: asset._id, entityType, entityId: document._id, field: reference.field },
            { $set: {
              entityTitle: String(document[titleField] || document._id),
              entityStatus: String(document.status || ""),
              route: route(document),
            } },
            { upsert: true },
          );
        }
      }
    }
  }

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...summary }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("[assets:index] failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
