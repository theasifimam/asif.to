import Cheatsheet from "../models/Cheatsheet.js";

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** GET /api/v1/cheatsheets — list all published cheatsheets */
export const getCheatsheets = async (req, res) => {
  try {
    const { techId, status } = req.query;
    const filter = {};
    if (techId) filter.techId = techId;
    if (status && status !== "all") filter.status = status;
    else if (!status) filter.status = "published";

    const cheatsheets = await Cheatsheet.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: cheatsheets });
  } catch (error) {
    console.error("[CHEATSHEETS] getCheatsheets error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** GET /api/v1/cheatsheets/:slug */
export const getCheatsheetBySlug = async (req, res) => {
  try {
    const cs = await Cheatsheet.findOne({ slug: req.params.slug }).lean();
    if (!cs) return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, data: cs });
  } catch (error) {
    console.error("[CHEATSHEETS] getCheatsheetBySlug error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** POST /api/v1/cheatsheets (admin) */
export const createCheatsheet = async (req, res) => {
  try {
    const { techId, title, description, seoTitle, seoDescription, keywords, canonicalUrl, snippets, order, status } = req.body;
    if (!techId || !title) {
      return res.status(400).json({ success: false, message: "techId and title are required." });
    }

    let slug = slugify(title);
    const existing = await Cheatsheet.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const cs = await Cheatsheet.create({
      techId, slug, title,
      description: description || "", seoTitle: seoTitle || "", seoDescription: seoDescription || "", keywords: keywords || [], canonicalUrl: canonicalUrl || "",
      snippets: snippets || [],
      order: order ?? 0,
      status: status || "published",
    });
    res.status(201).json({ success: true, data: cs });
  } catch (error) {
    console.error("[CHEATSHEETS] createCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** PATCH /api/v1/cheatsheets/:id (admin) */
export const updateCheatsheet = async (req, res) => {
  try {
    const { id } = req.params;
    const allowed = ["techId", "title", "slug", "description", "seoTitle", "seoDescription", "keywords", "canonicalUrl", "snippets", "order", "status"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const cs = await Cheatsheet.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!cs) return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, data: cs });
  } catch (error) {
    console.error("[CHEATSHEETS] updateCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/** DELETE /api/v1/cheatsheets/:id (admin) */
export const deleteCheatsheet = async (req, res) => {
  try {
    const cs = await Cheatsheet.findByIdAndDelete(req.params.id);
    if (!cs) return res.status(404).json({ success: false, message: "Cheatsheet not found." });
    res.status(200).json({ success: true, message: "Cheatsheet deleted." });
  } catch (error) {
    console.error("[CHEATSHEETS] deleteCheatsheet error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
