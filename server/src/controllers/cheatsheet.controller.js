import Article from "../models/Article.js";
import { slugify } from "../utils/slugify.js";

const populateArticle = (query) =>
  query
    .populate("author", "fullName name username avatar")
    .populate("topic", "name slug");

export const getCheatsheets = async (req, res) => {
  try {
    const { techId, status, search } = req.query;
    const filter = { type: "cheatsheet" };
    if (techId) filter.techId = techId;
    if (status && status !== "all") filter.status = status;
    else if (!status) filter.status = "published";
    if (search) {
      filter.$or = ["title", "content", "keywords"].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }
    const cheatsheets = await populateArticle(Article.find(filter))
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: cheatsheets });
  } catch (error) {
    console.error("[CHEATSHEETS] getCheatsheets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCheatsheetBySlug = async (req, res) => {
  try {
    const cheatsheet = await populateArticle(
      Article.findOne({ slug: req.params.slug, type: "cheatsheet" }),
    ).lean();
    if (!cheatsheet)
      return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, data: cheatsheet });
  } catch (error) {
    console.error("[CHEATSHEETS] getCheatsheetBySlug error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createCheatsheet = async (req, res) => {
  try {
    const { techId, title, content, status, order, seoTitle, seoDescription, keywords, canonicalUrl } = req.body;
    if (!techId || !title || !content)
      return res.status(400).json({ success: false, message: "Technology, title, and content are required." });
    let slug = slugify(title);
    if (await Article.exists({ slug })) slug = `${slug}-${Date.now()}`;
    const cheatsheet = await Article.create({
      type: "cheatsheet", techId, title, slug, content,
      author: req.user._id, topic: [], image: "",
      status: status === "published" ? "published" : "draft",
      order: Number(order) || 0, seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      keywords: Array.isArray(keywords) ? keywords : [],
      canonicalUrl: canonicalUrl || "",
    });
    res.status(201).json({ success: true, data: cheatsheet });
  } catch (error) {
    console.error("[CHEATSHEETS] createCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateCheatsheet = async (req, res) => {
  try {
    const allowed = ["techId", "title", "slug", "content", "status", "order", "seoTitle", "seoDescription", "keywords", "canonicalUrl"];
    const updates = { updatedAt: new Date() };
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    if (updates.order !== undefined) updates.order = Number(updates.order) || 0;
    if (updates.title && !updates.slug) updates.slug = slugify(updates.title);
    if (updates.slug && await Article.exists({ slug: updates.slug, _id: { $ne: req.params.id } }))
      updates.slug = `${updates.slug}-${Date.now()}`;
    const cheatsheet = await Article.findOneAndUpdate(
      { _id: req.params.id, type: "cheatsheet" }, updates,
      { new: true, runValidators: true },
    );
    if (!cheatsheet)
      return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, data: cheatsheet });
  } catch (error) {
    console.error("[CHEATSHEETS] updateCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteCheatsheet = async (req, res) => {
  try {
    const cheatsheet = await Article.findOneAndDelete({ _id: req.params.id, type: "cheatsheet" });
    if (!cheatsheet)
      return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, message: "Cheatsheet deleted." });
  } catch (error) {
    console.error("[CHEATSHEETS] deleteCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
