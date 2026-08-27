import mongoose from "mongoose";

import Asset from "../models/Asset.js";
import AssetFolder from "../models/AssetFolder.js";
import AssetUsage from "../models/AssetUsage.js";
import { hasPermission } from "../utils/permissions.js";
import {
  assetResponse,
  createAssetFromUpload,
  permanentlyDeleteAsset,
  safeDownloadName,
  validateAssetFolder,
} from "../services/asset.service.js";
import { getStorageProvider } from "../services/storage/index.js";

const categoryAliases = Object.freeze({
  images: "image",
  image: "image",
  videos: "video",
  video: "video",
  documents: "document",
  document: "document",
  code: "code_archive",
  archives: "code_archive",
  code_archive: "code_archive",
});

const sorts = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name_az: { name: 1, _id: 1 },
  name_za: { name: -1, _id: -1 },
  largest: { size: -1, _id: -1 },
  smallest: { size: 1, _id: 1 },
});

const objectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : null;

function parsePagination(query) {
  const page = Math.max(Number.parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit || "24", 10), 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

function buildMatch(query) {
  const match = { status: query.status === "trashed" ? "trashed" : "active" };
  const category = categoryAliases[String(query.type || "").toLowerCase()];
  if (category) match.category = category;
  if (query.favorite === "true") match.isFavorite = true;
  if (query.folder === "root") match.folderId = null;
  else if (query.folder) {
    const folderId = objectId(query.folder);
    if (folderId) match.folderId = folderId;
  }
  if (query.uploadedBy) {
    const uploadedBy = objectId(query.uploadedBy);
    if (uploadedBy) match.uploadedBy = uploadedBy;
  }
  if (query.from || query.to) {
    match.createdAt = {};
    if (query.from) match.createdAt.$gte = new Date(query.from);
    if (query.to) {
      const end = new Date(query.to);
      end.setHours(23, 59, 59, 999);
      match.createdAt.$lte = end;
    }
  }
  if (String(query.search || "").trim()) {
    match.$text = { $search: String(query.search).trim().slice(0, 100) };
  }
  return match;
}

const usageLookup = {
  $lookup: {
    from: "assetusages",
    let: { assetId: "$_id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$asset", "$$assetId"] } } },
      { $count: "count" },
    ],
    as: "usageStats",
  },
};

const enrichPipeline = [
  usageLookup,
  { $set: { usageCount: { $ifNull: [{ $first: "$usageStats.count" }, 0] } } },
  { $unset: "usageStats" },
  { $lookup: { from: "assetfolders", localField: "folderId", foreignField: "_id", as: "folder" } },
  { $set: { folder: { $first: "$folder" } } },
  { $lookup: { from: "users", localField: "uploadedBy", foreignField: "_id", as: "uploader" } },
  { $set: { uploadedBy: { $first: "$uploader" } } },
  { $unset: ["uploader", "uploadedBy.password", "uploadedBy.oauthAccounts"] },
];

export async function listAssets(req, res) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const match = buildMatch(req.query);
    const sort = sorts[req.query.sort] || sorts.newest;
    const usageFilter = ["used", "unused"].includes(req.query.usage)
      ? req.query.usage
      : null;

    const pipeline = [{ $match: match }];
    if (usageFilter) {
      pipeline.push(
        usageLookup,
        { $set: { usageCount: { $ifNull: [{ $first: "$usageStats.count" }, 0] } } },
        { $match: usageFilter === "used" ? { usageCount: { $gt: 0 } } : { usageCount: 0 } },
        { $unset: "usageStats" },
      );
    }
    pipeline.push({
      $facet: {
        assets: [
          { $sort: sort },
          { $skip: skip },
          { $limit: limit },
          ...(usageFilter ? enrichPipeline.slice(3) : enrichPipeline),
        ],
        meta: [
          { $group: { _id: null, total: { $sum: 1 }, totalBytes: { $sum: "$size" } } },
        ],
      },
    });

    const [result = { assets: [], meta: [] }] = await Asset.aggregate(pipeline);
    const total = result.meta[0]?.total || 0;
    res.json({
      success: true,
      data: {
        assets: result.assets.map(assetResponse),
        pagination: { page, limit, total, pages: Math.max(Math.ceil(total / limit), 1) },
        summary: { total, totalBytes: result.meta[0]?.totalBytes || 0 },
      },
    });
  } catch (error) {
    console.error("[ASSETS] list", error);
    res.status(500).json({ success: false, message: "Unable to load files." });
  }
}

export async function getAsset(req, res) {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate("folderId", "name parentId")
      .populate("uploadedBy", "fullName username email avatar role")
      .lean();
    if (!asset) return res.status(404).json({ success: false, message: "File not found." });
    const usageCount = await AssetUsage.countDocuments({ asset: asset._id });
    res.json({ success: true, data: assetResponse({ ...asset, folder: asset.folderId, folderId: asset.folderId?._id || null, usageCount }) });
  } catch {
    res.status(404).json({ success: false, message: "File not found." });
  }
}

export async function listAssetUploaders(_req, res) {
  try {
    const rows = await Asset.aggregate([
      { $match: { uploadedBy: { $ne: null } } },
      { $group: { _id: "$uploadedBy", fileCount: { $sum: 1 } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $set: { user: { $first: "$user" } } },
      { $match: { user: { $ne: null } } },
      { $project: { _id: 1, fileCount: 1, fullName: "$user.fullName", username: "$user.username", avatar: "$user.avatar" } },
      { $sort: { fullName: 1 } },
    ]);
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: "Unable to load uploaders." });
  }
}

export async function getAssetUsages(req, res) {
  try {
    const usages = await AssetUsage.find({ asset: req.params.id })
      .sort({ entityStatus: -1, updatedAt: -1 })
      .lean();
    res.json({ success: true, data: usages });
  } catch {
    res.status(400).json({ success: false, message: "Unable to load file usage." });
  }
}

export async function uploadAssetFiles(req, res) {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ success: false, message: "Select at least one file." });
  const results = [];
  for (const file of files) {
    try {
      results.push(await createAssetFromUpload({
        file,
        folderId: req.body.folderId || null,
        visibility: req.body.visibility,
        uploadedBy: req.user._id,
        duplicateStrategy: req.body.duplicateStrategy,
      }));
    } catch (error) {
      results.push({ status: "error", name: file.originalname, error: error.message });
    }
  }
  const created = results.filter((item) => item.status === "created").length;
  const duplicates = results.filter((item) => item.status === "duplicate").length;
  const failed = results.filter((item) => item.status === "error").length;
  const status = !created && duplicates && !failed ? 409 : created ? 201 : 400;
  res.status(status).json({
    success: failed === 0 && duplicates === 0,
    data: { results, summary: { created, duplicates, failed } },
    message: failed ? "One or more files could not be uploaded." : duplicates ? "An identical file already exists." : "Files uploaded.",
  });
}

export async function updateAsset(req, res) {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) return res.status(404).json({ success: false, message: "File not found." });
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 255) return res.status(400).json({ success: false, message: "Enter a valid file name." });
      asset.name = name;
    }
    if (req.body.folderId !== undefined) asset.folderId = await validateAssetFolder(req.body.folderId || null);
    if (["public", "private"].includes(req.body.visibility)) asset.visibility = req.body.visibility;
    if (typeof req.body.isFavorite === "boolean") asset.isFavorite = req.body.isFavorite;
    await asset.save();
    res.json({ success: true, data: assetResponse(asset), message: "File updated." });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to update file." });
  }
}

async function applyAssetAction(asset, action, body, user) {
  if (action === "move") asset.folderId = await validateAssetFolder(body.folderId || null);
  else if (action === "favorite") asset.isFavorite = true;
  else if (action === "unfavorite") asset.isFavorite = false;
  else if (action === "trash") {
    asset.status = "trashed";
    asset.deletedAt = new Date();
    asset.deletedBy = user._id;
    asset.trashedByFolderId = null;
  } else if (action === "restore") {
    if (asset.folderId && !(await AssetFolder.exists({ _id: asset.folderId, status: "active" }))) asset.folderId = null;
    asset.status = "active";
    asset.deletedAt = null;
    asset.deletedBy = null;
    asset.trashedByFolderId = null;
  } else throw new Error("Unsupported bulk action.");
  await asset.save();
  return asset;
}

export async function bulkAssetAction(req, res) {
  try {
    const ids = [...new Set((req.body.ids || []).filter((id) => mongoose.Types.ObjectId.isValid(id)))].slice(0, 200);
    const action = req.body.action;
    if (!ids.length) return res.status(400).json({ success: false, message: "Select at least one file." });
    if (action === "permanent_delete") {
      if (req.user.role !== "super_admin") return res.status(403).json({ success: false, message: "Only a super admin can permanently delete files." });
      const assets = await Asset.find({ _id: { $in: ids }, status: "trashed" });
      const results = [];
      for (const asset of assets) {
        try {
          await permanentlyDeleteAsset(asset);
          results.push({ id: asset.id, success: true });
        } catch (error) {
          results.push({ id: asset.id, success: false, error: error.message, code: error.code });
        }
      }
      return res.json({ success: results.every((item) => item.success), data: results });
    }
    if (!["move", "favorite", "unfavorite", "trash", "restore"].includes(action)) {
      return res.status(400).json({ success: false, message: "Unsupported bulk action." });
    }
    const assets = await Asset.find({ _id: { $in: ids } });
    await Promise.all(assets.map((asset) => applyAssetAction(asset, action, req.body, req.user)));
    res.json({ success: true, data: { updated: assets.length }, message: `${assets.length} file${assets.length === 1 ? "" : "s"} updated.` });
  } catch (error) {
    res.status(error.statusCode || 400).json({ success: false, message: error.message || "Unable to update files." });
  }
}

export async function trashAsset(req, res) {
  req.body = { ...req.body, ids: [req.params.id], action: "trash" };
  return bulkAssetAction(req, res);
}

export async function restoreAsset(req, res) {
  req.body = { ...req.body, ids: [req.params.id], action: "restore" };
  return bulkAssetAction(req, res);
}

export async function deleteAssetPermanently(req, res) {
  try {
    if (req.user.role !== "super_admin") return res.status(403).json({ success: false, message: "Only a super admin can permanently delete files." });
    const asset = await Asset.findOne({ _id: req.params.id, status: "trashed" });
    if (!asset) return res.status(404).json({ success: false, message: "Trashed file not found." });
    await permanentlyDeleteAsset(asset);
    res.json({ success: true, message: "File permanently deleted." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, code: error.code, message: error.message || "Unable to permanently delete file." });
  }
}

export async function serveAssetContent(req, res) {
  try {
    const asset = await Asset.findById(req.params.id).lean();
    if (!asset) return res.status(404).json({ success: false, message: "File not found." });
    if (asset.visibility === "private" && !hasPermission(req.user, "assets.view")) {
      return res.status(403).json({ success: false, message: "This file is private." });
    }
    const provider = getStorageProvider(asset.storageProvider);
    const absolute = provider.getAbsolutePath(asset.storageKey);
    const forceDownload = req.query.download === "1" || !["image", "video"].includes(asset.category) || asset.extension === ".svg";
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", asset.visibility === "public" ? "public, max-age=3600" : "private, no-store");
    if (forceDownload) return res.download(absolute, safeDownloadName(asset));
    res.type(asset.mimeType);
    return res.sendFile(absolute);
  } catch {
    res.status(404).json({ success: false, message: "File content is unavailable." });
  }
}
