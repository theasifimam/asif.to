
import Article from "../models/Article.js";
import fs from "fs";

import { slugify } from "../utils/slugify.js";

/**
 * List all articles with optional filters and pagination
 */
export const getArticles = async (req, res) => {
  try {
    const { limit = 10, page = 1, topic, author, status, search } = req.query;

    const filter = {};
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

    const article = await Article.findById(id).
    populate("author", "fullName name email avatar").
    populate("topic", "name");

    if (!article) {
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
    const { title, content, topic, status, seoTitle, seoDescription, keywords, canonicalUrl } = req.body;

    if (!title || !content || !topic) {
      // Delete uploaded file if validation fails
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(400).json({ success: false, message: "Title, content and topics are required." });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "Article image is required." });
      return;
    }

    // multer adds the file path to req.file
    const imageUrl = `/uploads/articles/${req.file.filename}`;

    const articleStatus = status === "draft" ? "draft" : "published";

    // Generate unique slug
    let slug = slugify(title);
    const existing = await Article.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const newArticle = await Article.create({
      title,
      slug,
      content,
      author: req.user?._id,
      topic: Array.isArray(topic) ? topic : [topic],
      image: imageUrl,
      status: articleStatus,
      seoTitle: seoTitle || "", seoDescription: seoDescription || "", keywords: keywords || [], canonicalUrl: canonicalUrl || "",
      readCount: 0,
      views: []
    });

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
    const { title, content, topic, status, seoTitle, seoDescription, keywords, canonicalUrl } = req.body;

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
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;

    if (req.file) {
      // New image uploaded, delete old one and set new path
      const oldImagePath = article.image.startsWith("/") ? article.image.slice(1) : article.image;
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      updateData.image = `/uploads/articles/${req.file.filename}`;
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("author", "fullName name email avatar").populate("topic", "name");

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
    const imagePath = article.image.startsWith("/") ? article.image.slice(1) : article.image;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Article.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Article deleted successfully." });
  } catch (error) {
    console.error("[ARTICLES] deleteArticle error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
