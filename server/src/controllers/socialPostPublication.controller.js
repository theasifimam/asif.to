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
const REPOST_LOCK_MS = 30 * 24 * 60 * 60 * 1000;

const publicUrl = (relative) =>
  `${(process.env.API_PUBLIC_URL || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "")}/uploads/${relative.replace(/\\/g, "/")}`;

function assetFrom(input) {
  const relative = String(input?.path || "").replace(/^\/+/, "");
  const absolutePath = path.resolve(uploadsRoot, relative);
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("Invalid publishing asset path.");
  return {
    path: relative,
    absolutePath,
    url: input?.url || publicUrl(relative),
    mimeType: input?.mimeType || "image/png",
  };
}

export function assetsFromPublication(publication) {
  return (publication.assetPaths || []).map((relative, index) =>
    assetFrom({
      path: relative,
      url: publication.assetUrls?.[index] || "",
      mimeType: publication.assetMimeTypes?.[index] || "image/png",
    }),
  );
}

async function assertAssets(assets) {
  if (!assets.length) throw new Error("No publishing assets are available.");
  await Promise.all(assets.map((asset) => fs.access(asset.absolutePath)));
}

function cleanPlatforms(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => String(item).toLowerCase())
    .filter((item) => PLATFORMS.includes(item)))];
}

export async function runPublication({ publication, post, assets }) {
  publication.status = "publishing";
  publication.attempts = Number(publication.attempts || 0) + 1;
  publication.lastAttemptAt = new Date();
  publication.errorMessage = "";
  await publication.save();

  try {
    const result = await publishSocialPostToPlatform({
      platform: publication.platform,
      post,
      assets,
      captionOverride: publication.caption,
    });

    publication.status = "published";
    publication.remotePostId = result.remotePostId || "";
    publication.remotePostUrl = result.remotePostUrl || "";
    publication.caption = result.caption || publication.caption;
    publication.publishedAt = new Date();
    publication.errorMessage = "";
    await publication.save();

    return {
      id: publication._id,
      platform: publication.platform,
      status: "published",
      remotePostId: publication.remotePostId,
      remotePostUrl: publication.remotePostUrl,
      publishedAt: publication.publishedAt,
    };
  } catch (error) {
    publication.status = "failed";
    publication.errorMessage = error.message || "Publishing failed.";
    await publication.save();
    return {
      id: publication._id,
      platform: publication.platform,
      status: "failed",
      error: publication.errorMessage,
    };
  }
}

export async function uploadSocialPostPublishingAssets(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id").lean();
    if (!post) {
      await Promise.all((req.files || []).map((file) => fs.unlink(file.path).catch(() => {})));
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

    const platforms = cleanPlatforms(req.body?.platforms);
    if (!platforms.length) return res.status(400).json({ success: false, message: "Choose at least one platform." });

    const assets = (Array.isArray(req.body?.assets) ? req.body.assets : []).map(assetFrom);
    await assertAssets(assets);

    const results = [];
    for (const platform of platforms) {
      const latestPublished = await SocialPublication.findOne({ socialPost: post._id, platform, status: "published", publishedAt: { $ne: null } }).sort({ publishedAt: -1 }).lean();
      if (latestPublished?.publishedAt && Date.now() - new Date(latestPublished.publishedAt).getTime() < REPOST_LOCK_MS) {
        const nextEligibleAt = new Date(new Date(latestPublished.publishedAt).getTime() + REPOST_LOCK_MS);
        results.push({ platform, status: "locked", remotePostId: latestPublished.remotePostId || "", remotePostUrl: latestPublished.remotePostUrl || "", publishedAt: latestPublished.publishedAt, nextEligibleAt });
        continue;
      }
      const publication = await SocialPublication.create({
        socialPost: post._id,
        platform,
        status: "publishing",
        caption: typeof req.body?.caption === "string" ? req.body.caption : post.caption || "",
        assetUrls: assets.map((asset) => asset.url),
        assetPaths: assets.map((asset) => asset.path),
        assetMimeTypes: assets.map((asset) => asset.mimeType),
        publishedBy: req.user._id,
      });
      results.push(await runPublication({ publication, post, assets }));
    }

    if (results.some((result) => result.status === "published")) {
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

export async function scheduleSocialPost(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: "Social post not found." });

    const platforms = cleanPlatforms(req.body?.platforms);
    if (!platforms.length) return res.status(400).json({ success: false, message: "Choose at least one platform." });

    const scheduledAt = new Date(req.body?.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now() + 30000) {
      return res.status(400).json({ success: false, message: "Choose a schedule time at least 30 seconds in the future." });
    }

    const assets = (Array.isArray(req.body?.assets) ? req.body.assets : []).map(assetFrom);
    await assertAssets(assets);

    const rows = await SocialPublication.insertMany(
      platforms.map((platform) => ({
        socialPost: post._id,
        platform,
        status: "scheduled",
        caption: typeof req.body?.caption === "string" ? req.body.caption : post.caption || "",
        assetUrls: assets.map((asset) => asset.url),
        assetPaths: assets.map((asset) => asset.path),
        assetMimeTypes: assets.map((asset) => asset.mimeType),
        scheduledAt,
        publishedBy: req.user._id,
      })),
    );

    return res.status(201).json({
      success: true,
      data: rows.map((row) => ({
        id: row._id,
        platform: row.platform,
        status: row.status,
        scheduledAt: row.scheduledAt,
      })),
    });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] schedule:", error);
    return res.status(500).json({ success: false, message: error.message || "Scheduling failed." });
  }
}

export async function retrySocialPublication(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: "Social post not found." });

    const publication = await SocialPublication.findOne({ _id: req.params.publicationId, socialPost: post._id });
    if (!publication) return res.status(404).json({ success: false, message: "Publication not found." });
    if (!["failed", "cancelled"].includes(publication.status)) {
      return res.status(400).json({ success: false, message: "Only failed or cancelled publications can be retried." });
    }

    const assets = assetsFromPublication(publication);
    await assertAssets(assets);

    const result = await runPublication({ publication, post, assets });

    if (result.status === "published") {
      post.status = "published";
      post.updatedAt = new Date();
      await post.save();
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] retry:", error);
    return res.status(500).json({ success: false, message: error.message || "Retry failed." });
  }
}

export async function cancelScheduledPublication(req, res) {
  const publication = await SocialPublication.findOneAndUpdate(
    {
      _id: req.params.publicationId,
      socialPost: req.params.id,
      status: "scheduled",
    },
    { $set: { status: "cancelled", errorMessage: "" } },
    { new: true },
  );

  if (!publication) {
    return res.status(404).json({ success: false, message: "Scheduled publication not found or already started." });
  }

  return res.json({ success: true, data: { id: publication._id, status: publication.status } });
}

export async function getSocialPostPublications(req, res) {
  const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id");
  if (!post) return res.status(404).json({ success: false, message: "Social post not found." });

  const rows = await SocialPublication.find({ socialPost: post._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.json({ success: true, data: rows });
}
