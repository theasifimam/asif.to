import SiteSetting from "../models/SiteSetting.js";
import { logActivity } from "../services/activity.service.js";

const DEFAULTS = {
  public: { title: "asif.to", tagline: "Coding Tutorials & Cheatsheets", description: "Modern step-by-step coding courses and developer resources.", logoUrl: "/logo.png", faviconUrl: "/logo.png", websiteUrl: "https://asif.to", supportEmail: "support@asif.to", social: {} },
  admin: { title: "asif.to | Admin Control Panel", tagline: "Admin Control Panel", description: "Advanced Admin & Content Management Interface for asif.to", logoUrl: "/logo.png", faviconUrl: "/logo.png", websiteUrl: "https://admin.asif.to", supportEmail: "support@asif.to", social: {} },
};

export async function getPublicSiteSetting(req, res) {
  const site = req.query.site === "admin" ? "admin" : "public";
  const item = await SiteSetting.findOne({ site }).lean();
  res.json({ success: true, data: { ...DEFAULTS[site], ...(item || {}), social: { ...DEFAULTS[site].social, ...(item?.social || {}) } } });
}

export async function getSiteSettings(_req, res) {
  const items = await SiteSetting.find().lean();
  res.json({ success: true, data: ["public", "admin"].map((site) => ({ ...DEFAULTS[site], ...(items.find((item) => item.site === site) || {}), site })) });
}

export async function saveSiteSetting(req, res) {
  try {
    const site = req.body.site === "admin" ? "admin" : "public";
    const before = await SiteSetting.findOne({ site }).lean();
    const fields = ["title", "tagline", "description", "logoUrl", "faviconUrl", "websiteUrl", "supportEmail"];
    const values = Object.fromEntries(fields.map((field) => [field, String(req.body[field] || "").trim()]));
    values.social = Object.fromEntries(["github", "linkedin", "instagram", "youtube", "twitter", "facebook"].map((key) => [key, String(req.body.social?.[key] || "").trim()]));
    const item = await SiteSetting.findOneAndUpdate({ site }, { $set: { site, ...values } }, { upsert: true, new: true, runValidators: true }).lean();
    await logActivity({ actor: req.user, action: "site_settings.updated", entityType: "site_setting", entityId: item._id, entityTitle: site, description: "updated site branding settings", severity: "important", before: before ? { title: before.title, logoUrl: before.logoUrl } : undefined, after: { title: item.title, logoUrl: item.logoUrl }, url: "/site-settings" });
    res.json({ success: true, data: item });
  } catch (error) { res.status(400).json({ success: false, message: error.message || "Unable to save site settings" }); }
}
