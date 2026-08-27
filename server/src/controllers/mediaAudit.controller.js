import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import Article from "../models/Article.js";
import Course from "../models/Course.js";
import CourseTopic from "../models/CourseTopic.js";
import Question from "../models/Question.js";
import SeoSetting from "../models/SeoSetting.js";
import SocialPublication from "../models/SocialPublication.js";
import TopicCategory from "../models/TopicCategory.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

const SOURCES = [
  { model: Article, label: "Article", title: "title", route: (doc) => `/articles/${doc.slug}` },
  { model: Course, label: "Course", title: "title", route: (doc) => `/courses/${doc.slug}` },
  { model: CourseTopic, label: "Course topic", title: "title", route: (doc) => `/courses/${doc.course}/${doc.slug}` },
  { model: TopicCategory, label: "Topic category", title: "name", route: (doc) => `/categories/${doc._id}` },
  { model: User, label: "User avatar", title: "fullName", route: (doc) => `/users/${doc._id}` },
  { model: Question, label: "Question", title: "question", route: (doc) => `/quiz/${doc._id}/edit` },
  { model: SeoSetting, label: "SEO setting", title: "siteName", route: () => "/seo-settings" },
  { model: SocialPublication, label: "Social publication", title: "platform", route: (doc) => `/social-posts/${doc.socialPost}` },
];

const toRelative = (value) => {
  if (typeof value !== "string" || !value) return null;
  const normalized = value.replace(/\\/g, "/");
  const marker = normalized.toLowerCase().indexOf("/uploads/");
  let raw = marker >= 0 ? normalized.slice(marker + "/uploads/".length) : normalized.replace(/^\/?uploads\//i, "");
  if (raw === normalized && !/^(articles|courses|avatars|social-publishing|topic-categories|questions)\//i.test(raw)) return null;
  raw = raw.split(/[?#]/)[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw).replace(/^\/+/, "");
  } catch {
    return raw.replace(/^\/+/, "");
  }
};

const collectReferences = (value, field, output, seen = new WeakSet()) => {
  if (typeof value === "string") {
    const relative = toRelative(value);
    if (relative) output.push({ relative, field });
    return;
  }
  if (!value || typeof value !== "object") return;
  if (seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectReferences(item, `${field}[${index}]`, output, seen));
  } else {
    Object.entries(value).forEach(([key, item]) =>
      collectReferences(item, field ? `${field}.${key}` : key, output, seen),
    );
  }
};

async function listImageFiles(directory, prefix = "") {
  const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listImageFiles(absolute, relative)));
    else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) files.push({ relative, absolute });
  }
  return files;
}

async function buildAudit() {
  const [files, ...documents] = await Promise.all([
    listImageFiles(uploadsRoot),
    ...SOURCES.map(({ model }) => model.find({}).lean()),
  ]);
  const references = new Map();

  SOURCES.forEach((source, sourceIndex) => {
    for (const document of documents[sourceIndex] || []) {
      const found = [];
      collectReferences(document, "", found);
      for (const item of found) {
        const list = references.get(item.relative) || [];
        list.push({
          type: source.label,
          title: String(document[source.title] || document.platform || document._id),
          id: String(document._id),
          field: item.field || "content",
          route: source.route(document),
        });
        references.set(item.relative, list);
      }
    }
  });

  const rows = await Promise.all(files.map(async (file) => {
    const stats = await fs.stat(file.absolute);
    const associatedWith = references.get(file.relative) || [];
    return {
      path: file.relative,
      url: `/uploads/${file.relative}`,
      filename: path.basename(file.relative),
      directory: path.dirname(file.relative) === "." ? "uploads" : `uploads/${path.dirname(file.relative)}`,
      size: stats.size,
      modifiedAt: stats.mtime,
      associated: associatedWith.length > 0,
      associatedWith,
    };
  }));
  rows.sort((a, b) => Number(a.associated) - Number(b.associated) || new Date(b.modifiedAt) - new Date(a.modifiedAt));
  const referenced = rows.filter((row) => row.associated).length;
  return {
    summary: { total: rows.length, referenced, orphaned: rows.length - referenced },
    files: rows,
  };
}

const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== "super_admin") return res.status(403).json({ success: false, message: "Only a super admin can access media audit." });
  next();
};

export const requireMediaAuditSuperAdmin = superAdminOnly;

export const listMediaAudit = async (_req, res) => {
  try {
    res.json({ success: true, data: await buildAudit() });
  } catch (error) {
    console.error("[MEDIA_AUDIT] list", error);
    res.status(500).json({ success: false, message: "Unable to audit uploaded images." });
  }
};

export const deleteOrphanedMedia = async (req, res) => {
  try {
    const relative = String(req.body?.path || "").replace(/\\/g, "/").replace(/^\/+/, "");
    const absolute = path.resolve(uploadsRoot, relative);
    if (!relative || !absolute.startsWith(`${uploadsRoot}${path.sep}`) || !imageExtensions.has(path.extname(relative).toLowerCase()))
      return res.status(400).json({ success: false, message: "Invalid image path." });

    const audit = await buildAudit();
    const row = audit.files.find((file) => file.path === relative);
    if (!row) return res.status(404).json({ success: false, message: "Image not found." });
    if (row.associated) return res.status(409).json({ success: false, message: "This image is still associated with content and was not deleted.", associatedWith: row.associatedWith });

    await fs.unlink(absolute);
    res.json({ success: true, data: { path: relative }, message: "Orphaned image deleted." });
  } catch (error) {
    console.error("[MEDIA_AUDIT] delete", error);
    res.status(500).json({ success: false, message: "Unable to delete image." });
  }
};
