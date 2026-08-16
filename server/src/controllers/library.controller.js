import Article from "../models/Article.js";
import LibraryBookmark from "../models/LibraryBookmark.js";
import LibraryCollection from "../models/LibraryCollection.js";
import User from "../models/User.js";
import { slugify } from "../utils/slugify.js";

export const LIBRARY_TYPES = ["note", "cheatsheet", "code_snippet", "debug_fix", "command", "setup_guide", "interview_note", "template", "mini_article", "tip"];
const visibilityOf = (value) => ["private", "public", "unlisted"].includes(value) ? value : "private";
const tagsOf = (value) => (Array.isArray(value) ? value : String(value || "").split(",")).map((tag) => String(tag).trim().slice(0, 40)).filter(Boolean).slice(0, 20);
const publicFilter = { isUserGenerated: true, visibility: "public" };

async function uniqueSlug(title, excludeId) {
  const base = slugify(title).slice(0, 120) || "knowledge";
  let slug = base;
  const existing = await Article.findOne({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).select("_id");
  if (existing) slug = `${base}-${Date.now()}`;
  return slug;
}

export const getMyLibrary = async (req, res) => {
  const { type, visibility, tag, collectionId, search, sort = "updated" } = req.query;
  const query = { author: req.user._id, isUserGenerated: true };
  if (type && LIBRARY_TYPES.includes(type)) query.type = type;
  if (visibility && ["private", "public", "unlisted"].includes(visibility)) query.visibility = visibility;
  if (tag) query.tags = tag;
  if (collectionId) query.collectionId = collectionId;
  if (search) query.$or = [{ title: { $regex: String(search).slice(0, 100), $options: "i" } }, { content: { $regex: String(search).slice(0, 100), $options: "i" } }, { tags: { $regex: String(search).slice(0, 100), $options: "i" } }];
  const order = sort === "oldest" ? { createdAt: 1 } : sort === "title" ? { title: 1 } : { isPinned: -1, updatedAt: -1 };
  const [entries, bookmarks, collections] = await Promise.all([
    Article.find(query).select("title slug type content tags visibility collectionId isPinned createdAt updatedAt seoTitle seoDescription canonicalUrl").sort(order).lean(),
    LibraryBookmark.find({ userId: req.user._id, ...(visibility ? { visibility: visibilityOf(visibility) } : {}), ...(collectionId ? { collectionId } : {}), ...(search ? { $or: [{ title: { $regex: String(search).slice(0, 100), $options: "i" } }, { url: { $regex: String(search).slice(0, 100), $options: "i" } }, { tags: { $regex: String(search).slice(0, 100), $options: "i" } }] } : {}) }).sort(order).lean(),
    LibraryCollection.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean(),
  ]);
  res.json({ success: true, data: { entries, bookmarks, collections } });
};

export const createEntry = async (req, res) => {
  const { title, content, type = "note", visibility, collectionId, seoTitle, seoDescription, canonicalUrl, ogTitle, ogDescription, tags } = req.body;
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ success: false, message: "A title and content are required." });
  if (!LIBRARY_TYPES.includes(type)) return res.status(400).json({ success: false, message: "Invalid knowledge type." });
  if (visibilityOf(visibility) === "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." });
  const entry = await Article.create({ title: String(title).trim().slice(0, 200), slug: await uniqueSlug(title), content: String(content).slice(0, 100000), type, author: req.user._id, topic: [], visibility: visibilityOf(visibility), isUserGenerated: true, collectionId: collectionId || null, tags: tagsOf(tags), seoTitle: String(seoTitle || title).slice(0, 160), seoDescription: String(seoDescription || content).replace(/[#*_`]/g, "").slice(0, 160), canonicalUrl: String(canonicalUrl || "").slice(0, 2048), ogTitle: String(ogTitle || seoTitle || title).slice(0, 160), ogDescription: String(ogDescription || seoDescription || content).replace(/[#*_`]/g, "").slice(0, 160), status: "published" });
  res.status(201).json({ success: true, data: entry });
};

export const updateEntry = async (req, res) => {
  const entry = await Article.findOne({ _id: req.params.id, author: req.user._id, isUserGenerated: true });
  if (!entry) return res.status(404).json({ success: false, message: "Knowledge entry not found." });
  if (visibilityOf(req.body.visibility) === "public" && entry.visibility !== "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." });
  const allowed = ["title", "content", "collectionId", "seoTitle", "seoDescription", "canonicalUrl", "ogTitle", "ogDescription", "isPinned"];
  allowed.forEach((key) => { if (req.body[key] !== undefined) entry[key] = key === "content" ? String(req.body[key]).slice(0, 100000) : req.body[key]; });
  if (req.body.title) entry.slug = await uniqueSlug(req.body.title, entry._id);
  if (req.body.type && LIBRARY_TYPES.includes(req.body.type)) entry.type = req.body.type;
  if (req.body.tags !== undefined) entry.tags = tagsOf(req.body.tags);
  if (req.body.visibility !== undefined) entry.visibility = visibilityOf(req.body.visibility);
  await entry.save();
  res.json({ success: true, data: entry });
};

export const deleteEntry = async (req, res) => {
  const entry = await Article.findOneAndDelete({ _id: req.params.id, author: req.user._id, isUserGenerated: true });
  if (!entry) return res.status(404).json({ success: false, message: "Knowledge entry not found." });
  await LibraryCollection.updateMany({ userId: req.user._id }, { $pull: { items: { itemId: entry._id } } });
  res.json({ success: true });
};

export const createBookmark = async (req, res) => {
  const { url, title, description, note, tags, collectionId, visibility } = req.body;
  if (!/^https?:\/\//i.test(url || "") || !title?.trim()) return res.status(400).json({ success: false, message: "A valid URL and title are required." });
  if (visibilityOf(visibility) === "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." });
  let domain = ""; try { domain = new URL(url).hostname.replace(/^www\./, ""); } catch {}
  const bookmark = await LibraryBookmark.create({ userId: req.user._id, url: String(url).slice(0, 2048), title: String(title).trim().slice(0, 200), description: String(description || "").slice(0, 1000), note: String(note || "").slice(0, 5000), tags: tagsOf(tags), collectionId: collectionId || null, visibility: visibilityOf(visibility), domain });
  res.status(201).json({ success: true, data: bookmark });
};
export const updateBookmark = async (req, res) => { const item = await LibraryBookmark.findOne({ _id: req.params.id, userId: req.user._id }); if (!item) return res.status(404).json({ success: false, message: "Bookmark not found." }); if (visibilityOf(req.body.visibility) === "public" && item.visibility !== "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." }); ["title", "description", "note", "collectionId", "isPinned"].forEach((key) => { if (req.body[key] !== undefined) item[key] = req.body[key]; }); if (req.body.tags !== undefined) item.tags = tagsOf(req.body.tags); if (req.body.visibility !== undefined) item.visibility = visibilityOf(req.body.visibility); await item.save(); res.json({ success: true, data: item }); };
export const deleteBookmark = async (req, res) => { const item = await LibraryBookmark.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); if (!item) return res.status(404).json({ success: false, message: "Bookmark not found." }); res.json({ success: true }); };
export const createCollection = async (req, res) => { if (!req.body.name?.trim()) return res.status(400).json({ success: false, message: "A collection name is required." }); if (visibilityOf(req.body.visibility) === "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." }); const item = await LibraryCollection.create({ userId: req.user._id, name: String(req.body.name).trim().slice(0, 100), description: String(req.body.description || "").slice(0, 500), visibility: visibilityOf(req.body.visibility) }); res.status(201).json({ success: true, data: item }); };
export const updateCollection = async (req, res) => { const existing = await LibraryCollection.findOne({ _id: req.params.id, userId: req.user._id }); if (!existing) return res.status(404).json({ success: false, message: "Collection not found." }); if (visibilityOf(req.body.visibility) === "public" && existing.visibility !== "public" && req.body.publishConfirmed !== true) return res.status(400).json({ success: false, message: "Confirm the public publishing warning before continuing." }); const item = await LibraryCollection.findByIdAndUpdate(existing._id, { $set: { ...(req.body.name !== undefined ? { name: String(req.body.name).slice(0, 100) } : {}), ...(req.body.description !== undefined ? { description: String(req.body.description).slice(0, 500) } : {}), ...(req.body.visibility !== undefined ? { visibility: visibilityOf(req.body.visibility) } : {}) } }, { new: true, runValidators: true }); res.json({ success: true, data: item }); };
export const deleteCollection = async (req, res) => { const item = await LibraryCollection.findOneAndDelete({ _id: req.params.id, userId: req.user._id }); if (!item) return res.status(404).json({ success: false, message: "Collection not found." }); await Promise.all([Article.updateMany({ author: req.user._id, collectionId: item._id }, { $set: { collectionId: null } }), LibraryBookmark.updateMany({ userId: req.user._id, collectionId: item._id }, { $set: { collectionId: null } })]); res.json({ success: true }); };
export const getPublicEntry = async (req, res) => { const user = await User.findOne({ username: String(req.params.username).toLowerCase() }).select("fullName username avatar bio"); if (!user) return res.status(404).json({ success: false, message: "Not found." }); const entry = await Article.findOne({ slug: req.params.slug, author: user._id, ...publicFilter }).populate("collectionId", "name visibility").lean(); if (!entry) return res.status(404).json({ success: false, message: "Not found." }); res.json({ success: true, data: { entry, author: user } }); };
export const getPublicProfileEntries = async (req, res) => { const user = await User.findOne({ username: String(req.params.username).toLowerCase() }).select("fullName username avatar bio settings.profileVisibility"); if (!user || user.settings?.profileVisibility === "private") return res.status(404).json({ success: false, message: "Not found." }); const entries = await Article.find({ author: user._id, ...publicFilter }).select("title slug type tags createdAt updatedAt collectionId").sort({ updatedAt: -1 }).limit(30).lean(); res.json({ success: true, data: { author: user, entries } }); };
export const getPublicIndex = async (_req, res) => {
  const entries = await Article.find(publicFilter).select("slug author updatedAt").populate("author", "username settings.profileVisibility").lean();
  res.json({ success: true, data: entries.filter((entry) => entry.author?.username && entry.author.settings?.profileVisibility !== "private").map((entry) => ({ username: entry.author.username, slug: entry.slug, updatedAt: entry.updatedAt })) });
};
