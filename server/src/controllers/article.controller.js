import mongoose from "mongoose";
import Article from "../models/Article.js";
import fs from "fs";

import { slugify } from "../utils/slugify.js";
import { logActivity } from "../services/activity.service.js";
import { formatCanonicalUrl } from "../utils/canonical.js";
import { resolvePublicAsset } from "../services/asset.service.js";
import { removeEntityAssetUsages, syncEntityAssetUsages } from "../services/assetUsage.service.js";

/**
 * List all articles with optional filters and pagination
 */
export const getArticles = async (req, res) => {
  try {
    const { limit = 10, page = 1, topic, author, status, search, type = "article" } = req.query;

    // The legacy article API is public. Personal library entries are served only
    // through the library routes, which enforce ownership and visibility.
    const filter = { isUserGenerated: { $ne: true } };
    if (type === "article") filter.type = { $in: ["article", null] };
    else if (type !== "all") filter.type = type;
    if (topic) filter.topic = topic;
    if (author) filter.author = author;

    // Text search implementation
    if (search) {
      filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }];

    }

    // Filter by status (draft | published), default to 'published' for public routes
    if (status) {
      if (status !== "all") {
        filter.status = status;
      }
    } else {
      filter.status = "published";
    }

    const articles = await Article.find(filter).
    populate("author", "fullName name email avatar").
    populate("topic", "name").
    sort({ createdAt: -1 }).
    skip((Number(page) - 1) * Number(limit)).
    limit(Number(limit));

    const totalCount = await Article.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: articles,
      pagination: {
        totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error("[ARTICLES] getArticles error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a single article by ID
 */
export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    const article = await Article.findById(id).
    populate("author", "fullName name email avatar").
    populate("topic", "name");

    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    if (article.isUserGenerated && article.visibility !== "public") {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    // Increment read count only for published articles
    if (article.status === "published") {
      article.readCount = (article.readCount || 0) + 1;
      await article.save({ validateBeforeSave: false });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error("[ARTICLES] getArticleById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a single article by Slug
 */
export const getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({ slug }).
    populate("author", "fullName username avatar bio location socials").
    populate("topic", "name");

    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    if (article.isUserGenerated && article.visibility !== "public") {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    // Increment read count only for published articles
    if (article.status === "published") {
      article.readCount = (article.readCount || 0) + 1;
      await article.save({ validateBeforeSave: false });
    }

    res.status(200).json({ success: true, data: article });
  } catch (error) {
    console.error("[ARTICLES] getArticleBySlug error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new article (or draft)
 */
export const createArticle = async (req, res) => {
  try {
    const { title, content, topic, status, seoTitle, seoDescription, keywords, canonicalUrl, type = "article", techId, order, relatedCourses, relatedChapters, relatedQuestions, imageAsset } = req.body;

    if (!title || !content || !topic) {
      // Delete uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: "Title, content and topics are required." });
      return;
    }

    if (!req.file && !imageAsset) {
      res.status(400).json({ success: false, message: "Article image is required." });
      return;
    }

    const selectedAsset = imageAsset ? await resolvePublicAsset(imageAsset, "image") : null;
    const imageUrl = req.file ? `/uploads/articles/${req.file.filename}` : selectedAsset.url;

    const articleStatus = status === "draft" ? "draft" : "published";

    // Generate unique slug
    let slug = slugify(title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const finalType = type === "cheatsheet" ? "cheatsheet" : "article";
    const basePath = finalType === "cheatsheet" ? "/cheatsheets" : "/articles";
    const finalCanonicalUrl = formatCanonicalUrl(basePath, canonicalUrl, slug);

    const newArticle = await Article.create({
      type: finalType,
      title,
      slug,
      content,
      author: req.user?._id,
      topic: Array.isArray(topic) ? topic : [topic],
      image: imageUrl,
      imageAsset: selectedAsset?.asset._id || null,
      status: articleStatus,
      seoTitle: seoTitle || "", seoDescription: seoDescription || "", keywords: keywords || [], canonicalUrl: finalCanonicalUrl,
      techId: techId || "", order: Number(order) || 0,
      relatedCourses: Array.isArray(relatedCourses) ? relatedCourses : [],
      relatedChapters: Array.isArray(relatedChapters) ? relatedChapters : [],
      relatedQuestions: Array.isArray(relatedQuestions) ? relatedQuestions : [],
      readCount: 0,
      views: []
    });

    await syncEntityAssetUsages({
      entityType: "article",
      entityId: newArticle._id,
      entityTitle: newArticle.title,
      entityStatus: newArticle.status,
      route: `/articles/edit/${newArticle._id}`,
      references: newArticle.imageAsset ? [{ asset: newArticle.imageAsset, field: "image" }] : [],
    });

    await logActivity({ actor: req.user, action: "article.created", entityType: "article", entityId: newArticle._id, entityTitle: newArticle.title, description: "created", severity: "info", url: `/articles/edit/${newArticle._id}` });

    res.status(201).json({ success: true, data: newArticle });
  } catch (error) {
    console.error("[ARTICLES] createArticle error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update an article
 */
export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, topic, status, seoTitle, seoDescription, keywords, canonicalUrl, type, techId, order, relatedCourses, relatedChapters, relatedQuestions, authorId, imageAsset } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (title) {
      updateData.title = title;
      updateData.slug = slugify(title);
      // Check for uniqueness
      const existing = await Article.findOne({
        slug: updateData.slug,
        _id: { $ne: id }
      });
      if (existing) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }
    if (content) updateData.content = content;
    if (topic) updateData.topic = Array.isArray(topic) ? topic : [topic];
    if (status && ["draft", "published"].includes(status)) updateData.status = status;
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle;
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription;
    if (keywords !== undefined) updateData.keywords = Array.isArray(keywords) ? keywords : String(keywords).split(",").map((item) => item.trim()).filter(Boolean);
    if (type && ["article", "cheatsheet"].includes(type)) updateData.type = type;
    if (relatedCourses !== undefined) updateData.relatedCourses = Array.isArray(relatedCourses) ? relatedCourses : [];
    if (relatedChapters !== undefined) updateData.relatedChapters = Array.isArray(relatedChapters) ? relatedChapters : [];
    if (relatedQuestions !== undefined) updateData.relatedQuestions = Array.isArray(relatedQuestions) ? relatedQuestions : [];

    if (canonicalUrl !== undefined || title !== undefined || type !== undefined) {
      const activeType = updateData.type || article.type || "article";
      const targetSlug = updateData.slug || article.slug;
      const basePath = activeType === "cheatsheet" ? "/cheatsheets" : "/articles";
      updateData.canonicalUrl = formatCanonicalUrl(
        basePath,
        canonicalUrl !== undefined ? canonicalUrl : article.canonicalUrl,
        targetSlug,
      );
    }

    if (techId !== undefined) updateData.techId = techId;
    if (order !== undefined) updateData.order = Number(order) || 0;

    // Super-admin only: re-assign the content author
    if (authorId && req.user?.role === "super_admin") {
      updateData.author = authorId;
    }

    if (req.file) {
      // New image uploaded, delete old one and set new path
      const oldImagePath = article.image?.startsWith("/") ? article.image.slice(1) : article.image;
      if (!article.imageAsset && oldImagePath?.startsWith("uploads/articles/") && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.image = `/uploads/articles/${req.file.filename}`;
      updateData.imageAsset = null;
    } else if (imageAsset !== undefined) {
      if (imageAsset) {
        const selectedAsset = await resolvePublicAsset(imageAsset, "image");
        updateData.imageAsset = selectedAsset.asset._id;
        updateData.image = selectedAsset.url;
      } else {
        updateData.imageAsset = null;
      }
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    ).populate("author", "fullName name email avatar").populate("topic", "name");

    await syncEntityAssetUsages({
      entityType: "article",
      entityId: updatedArticle._id,
      entityTitle: updatedArticle.title,
      entityStatus: updatedArticle.status,
      route: `/articles/edit/${updatedArticle._id}`,
      references: updatedArticle.imageAsset ? [{ asset: updatedArticle.imageAsset, field: "image" }] : [],
    });

    const seoChanged = ["seoTitle", "seoDescription", "keywords", "canonicalUrl"].some((key) => updateData[key] !== undefined);
    const statusChanged = updateData.status && updateData.status !== article.status;
    const changedFields = Object.keys(updateData).filter((key) => !["updatedAt", "content"].includes(key));
    await logActivity({
      actor: req.user, action: seoChanged ? "article.seo_updated" : statusChanged ? `article.${updateData.status}` : "article.updated",
      entityType: "article", entityId: article._id, entityTitle: updatedArticle.title,
      description: seoChanged ? "changed SEO metadata for" : statusChanged ? `${updateData.status === "published" ? "published" : "unpublished"}` : "updated",
      severity: seoChanged || statusChanged ? "important" : "info", targetUserId: article.author,
      before: { status: article.status, title: article.title }, after: { status: updatedArticle.status, changedFields }, url: `/articles/edit/${article._id}`,
    });

    res.status(200).json({ success: true, data: updatedArticle });
  } catch (error) {
    console.error("[ARTICLES] updateArticle error:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Publish a draft article
 */
export const publishArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    if (article.status === "published") {
      res.status(400).json({ success: false, message: "Article is already published." });
      return;
    }

    article.status = "published";
    article.updatedAt = new Date();
    await article.save();
    await syncEntityAssetUsages({
      entityType: "article",
      entityId: article._id,
      entityTitle: article.title,
      entityStatus: article.status,
      route: `/articles/edit/${article._id}`,
      references: article.imageAsset ? [{ asset: article.imageAsset, field: "image" }] : [],
    });
    await logActivity({ actor: req.user, action: "article.published", entityType: "article", entityId: article._id, entityTitle: article.title, description: "published", severity: "important", targetUserId: article.author, before: { status: "draft" }, after: { status: "published" }, url: `/articles/edit/${article._id}` });

    res.status(200).json({ success: true, data: article, message: "Article published successfully." });
  } catch (error) {
    console.error("[ARTICLES] publishArticle error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete an article
 */
export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    // Delete the image file if it exists
    const imagePath = article.image?.startsWith("/") ? article.image.slice(1) : article.image;
    if (!article.imageAsset && imagePath?.startsWith("uploads/articles/") && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Article.findByIdAndDelete(id);
    await removeEntityAssetUsages("article", article._id);
    await logActivity({ actor: req.user, action: "article.deleted", entityType: "article", entityId: article._id, entityTitle: article.title, description: "permanently deleted", severity: "critical", targetUserId: article.author, url: "/articles/published" });

    res.status(200).json({ success: true, message: "Article deleted successfully." });
  } catch (error) {
    console.error("[ARTICLES] deleteArticle error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
