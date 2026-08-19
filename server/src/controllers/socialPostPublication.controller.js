import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import { publishSocialPostToPlatform } from "../services/socialPublishing.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const PLATFORMS = ["instagram", "facebook", "linkedin"];

const publicUrl = (relative) => `${(process.env.API_PUBLIC_URL || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "")}/uploads/${relative.replace(/\\/g, "/")}`;

function assetFrom(input) {
  const relative = String(input?.path || "").replace(/^\/+/, "");
  const absolutePath = path.resolve(uploadsRoot, relative);
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("Invalid publishing asset path.");
  return { path: relative, absolutePath, url: input?.url || publicUrl(relative), mimeType: input?.mimeType || "image/png" };
}

export async function uploadSocialPostPublishingAssets(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id").lean();
    if (!post) {
      await Promise.all((req.files || []).map((f) => fs.unlink(f.path).catch(() => {})));
      return res.status(404).json({ success: false, message: "Social post not found." });
    }
    const assets = (req.files || []).map((file) => {
      const relative = path.relative(uploadsRoot, file.path).replace(/\\/g, "/");
      return { path: relative, url: publicUrl(relative), mimeType: file.mimetype || "image/png", size: file.size };
    });
    if (!assets.length) return res.status(400).json({ success: false, message: "No slide images were uploaded." });
    return res.status(201).json({ success: true, data: assets });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] upload:", error);
    return res.status(500).json({ success: false, message: error.message || "Upload failed." });
  }
}

export async function publishSocialPost(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: "Social post not found." });

    const platforms = [...new Set((Array.isArray(req.body?.platforms) ? req.body.platforms : []).map((x) => String(x).toLowerCase()).filter((x) => PLATFORMS.includes(x)))];
    if (!platforms.length) return res.status(400).json({ success: false, message: "Choose at least one platform." });

    const assets = (Array.isArray(req.body?.assets) ? req.body.assets : []).map(assetFrom);
    if (!assets.length) return res.status(400).json({ success: false, message: "Render and upload slides before publishing." });
    await Promise.all(assets.map((a) => fs.access(a.absolutePath)));

    const results = [];
    for (const platform of platforms) {
      const publication = await SocialPublication.create({
        socialPost: post._id,
        platform,
        status: "publishing",
        caption: typeof req.body?.caption === "string" ? req.body.caption : post.caption || "",
        assetUrls: assets.map((a) => a.url),
        publishedBy: req.user._id,
      });

      try {
        const result = await publishSocialPostToPlatform({ platform, post, assets, captionOverride: req.body?.caption });
        publication.status = "published";
        publication.remotePostId = result.remotePostId || "";
        publication.remotePostUrl = result.remotePostUrl || "";
        publication.caption = result.caption || publication.caption;
        publication.publishedAt = new Date();
        publication.errorMessage = "";
        await publication.save();
        results.push({ platform, status: "published", remotePostId: publication.remotePostId, remotePostUrl: publication.remotePostUrl, publishedAt: publication.publishedAt });
      } catch (error) {
        publication.status = "failed";
        publication.errorMessage = error.message || "Publishing failed.";
        await publication.save();
        results.push({ platform, status: "failed", error: publication.errorMessage });
      }
    }

    if (results.some((r) => r.status === "published")) {
      post.status = "published";
      post.updatedAt = new Date();
      await post.save();
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] publish:", error);
    return res.status(500).json({ success: false, message: error.message || "Publishing failed." });
  }
}

export async function getSocialPostPublications(req, res) {
  const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id");
  if (!post) return res.status(404).json({ success: false, message: "Social post not found." });
  const rows = await SocialPublication.find({ socialPost: post._id }).sort({ createdAt: -1 }).limit(30).lean();
  return res.json({ success: true, data: rows });
}
