import SocialPost from "../models/SocialPost.js";

/**
 * List all social posts for the current user.
 * GET /social-posts?status=draft&search=react
 */
export const getSocialPosts = async (req, res) => {
  try {
    const { status, search, category } = req.query;
    const filter = { createdBy: req.user._id };
    if (status && status !== "all") filter.status = status;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    const posts = await SocialPost.find(filter)
      .sort({ updatedAt: -1 })
      .select("name category platform format status slides settings createdAt updatedAt")
      .lean();
    // Attach slide count and first slide template for listing display
    const data = posts.map((p) => ({
      ...p,
      slideCount: p.slides?.length || 0,
      firstTemplate: p.slides?.[0]?.template || null,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("[SOCIAL_POSTS] getSocialPosts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get a single social post by ID.
 * GET /social-posts/:id
 */
export const getSocialPostById = async (req, res) => {
  try {
    const post = await SocialPost.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).lean();
    if (!post)
      return res.status(404).json({ success: false, message: "Social post not found." });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("[SOCIAL_POSTS] getSocialPostById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Create a new social post.
 * POST /social-posts
 */
export const createSocialPost = async (req, res) => {
  try {
    const { name, category, platform, format, settings, slides } = req.body;
    if (!name)
      return res.status(400).json({ success: false, message: "Post name is required." });
    const post = await SocialPost.create({
      name,
      category: category || "",
      platform: platform || "instagram",
      format: format || "square-1080",
      settings: settings || {},
      slides: slides || [],
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    console.error("[SOCIAL_POSTS] createSocialPost error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Update a social post.
 * PATCH /social-posts/:id
 */
export const updateSocialPost = async (req, res) => {
  try {
    const allowed = [
      "name", "category", "platform", "format", "status", "settings", "slides",
    ];
    const updates = { updatedAt: new Date() };
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    const post = await SocialPost.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updates,
      { returnDocument: "after", runValidators: true },
    );
    if (!post)
      return res.status(404).json({ success: false, message: "Social post not found." });
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    console.error("[SOCIAL_POSTS] updateSocialPost error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Duplicate a social post.
 * POST /social-posts/:id/duplicate
 */
export const duplicateSocialPost = async (req, res) => {
  try {
    const original = await SocialPost.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).lean();
    if (!original)
      return res.status(404).json({ success: false, message: "Social post not found." });
    const { _id, createdAt, updatedAt, ...rest } = original;
    const duplicate = await SocialPost.create({
      ...rest,
      name: `${original.name} (Copy)`,
      status: "draft",
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    console.error("[SOCIAL_POSTS] duplicateSocialPost error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Delete a social post.
 * DELETE /social-posts/:id
 */
export const deleteSocialPost = async (req, res) => {
  try {
    const post = await SocialPost.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!post)
      return res.status(404).json({ success: false, message: "Social post not found." });
    res.status(200).json({ success: true, message: "Social post deleted." });
  } catch (error) {
    console.error("[SOCIAL_POSTS] deleteSocialPost error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
