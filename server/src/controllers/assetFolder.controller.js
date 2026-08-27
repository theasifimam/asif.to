import mongoose from "mongoose";

import Asset from "../models/Asset.js";
import AssetFolder from "../models/AssetFolder.js";
import AssetUsage from "../models/AssetUsage.js";
import { permanentlyDeleteAsset } from "../services/asset.service.js";

function cleanFolderName(value) {
  const name = String(value || "").trim().replace(/[\u0000-\u001f\u007f]/g, "");
  if (!name || name.length > 120 || /[\\/]/.test(name) || [".", ".."].includes(name)) {
    const error = new Error("Folder names must be 1-120 characters and cannot contain slashes.");
    error.statusCode = 400;
    throw error;
  }
  return name;
}

async function activeParent(parentId) {
  if (!parentId) return null;
  if (!mongoose.Types.ObjectId.isValid(parentId)) return null;
  return AssetFolder.findOne({ _id: parentId, status: "active" });
}

async function folderRows(filter) {
  return AssetFolder.aggregate([
    { $match: filter },
    { $sort: { name: 1 } },
    { $lookup: { from: "assets", let: { folderId: "$_id" }, pipeline: [
      { $match: { $expr: { $and: [{ $eq: ["$folderId", "$$folderId"] }, { $eq: ["$status", "active"] }] } } },
      { $count: "count" },
    ], as: "assets" } },
    { $lookup: { from: "assetfolders", let: { folderId: "$_id" }, pipeline: [
      { $match: { $expr: { $and: [{ $eq: ["$parentId", "$$folderId"] }, { $eq: ["$status", "active"] }] } } },
      { $count: "count" },
    ], as: "children" } },
    { $set: {
      assetCount: { $ifNull: [{ $first: "$assets.count" }, 0] },
      childCount: { $ifNull: [{ $first: "$children.count" }, 0] },
    } },
    { $unset: ["assets", "children"] },
  ]);
}

export async function listAssetFolders(req, res) {
  try {
    const status = req.query.status === "trashed" ? "trashed" : "active";
    const filter = { status };
    if (req.query.tree !== "true") {
      if (req.query.parentId && req.query.parentId !== "root") filter.parentId = new mongoose.Types.ObjectId(req.query.parentId);
      else filter.parentId = null;
    }
    const folders = await folderRows(filter);
    res.json({ success: true, data: folders });
  } catch {
    res.status(400).json({ success: false, message: "Unable to load folders." });
  }
}

export async function getAssetFolder(req, res) {
  try {
    const folder = await AssetFolder.findById(req.params.id).lean();
    if (!folder) return res.status(404).json({ success: false, message: "Folder not found." });
    const ancestors = folder.ancestors.length
      ? await AssetFolder.find({ _id: { $in: folder.ancestors } }).select("name parentId").lean()
      : [];
    const byId = new Map(ancestors.map((item) => [String(item._id), item]));
    const breadcrumbs = folder.ancestors.map((id) => byId.get(String(id))).filter(Boolean);
    breadcrumbs.push(folder);
    res.json({ success: true, data: { folder, breadcrumbs } });
  } catch {
    res.status(404).json({ success: false, message: "Folder not found." });
  }
}

export async function createAssetFolder(req, res) {
  try {
    const name = cleanFolderName(req.body.name);
    const parent = req.body.parentId ? await activeParent(req.body.parentId) : null;
    if (req.body.parentId && !parent) return res.status(404).json({ success: false, message: "Parent folder not found." });
    const folder = await AssetFolder.create({
      name,
      normalizedName: name.toLocaleLowerCase(),
      parentId: parent?._id || null,
      ancestors: parent ? [...parent.ancestors, parent._id] : [],
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: folder, message: "Folder created." });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : error.statusCode || 400).json({
      success: false,
      message: duplicate ? "A folder with this name already exists here." : error.message || "Unable to create folder.",
    });
  }
}

export async function updateAssetFolder(req, res) {
  try {
    const folder = await AssetFolder.findOne({ _id: req.params.id, status: "active" });
    if (!folder) return res.status(404).json({ success: false, message: "Folder not found." });
    let descendantOperations = [];

    if (req.body.name !== undefined) {
      folder.name = cleanFolderName(req.body.name);
      folder.normalizedName = folder.name.toLocaleLowerCase();
    }
    if (req.body.parentId !== undefined) {
      const nextParentId = req.body.parentId || null;
      if (String(nextParentId || "") === String(folder._id)) return res.status(400).json({ success: false, message: "A folder cannot contain itself." });
      const parent = nextParentId ? await activeParent(nextParentId) : null;
      if (nextParentId && !parent) return res.status(404).json({ success: false, message: "Destination folder not found." });
      if (parent?.ancestors.some((id) => String(id) === String(folder._id))) {
        return res.status(400).json({ success: false, message: "A folder cannot be moved into one of its descendants." });
      }

      const oldAncestors = folder.ancestors.map(String);
      const newAncestors = parent ? [...parent.ancestors, parent._id] : [];
      const descendants = await AssetFolder.find({ ancestors: folder._id });
      folder.parentId = parent?._id || null;
      folder.ancestors = newAncestors;
      if (descendants.length) {
        descendantOperations = descendants.map((descendant) => {
          const values = descendant.ancestors.map(String);
          const folderIndex = values.indexOf(String(folder._id));
          const suffix = folderIndex >= 0 ? descendant.ancestors.slice(folderIndex + 1) : descendant.ancestors.slice(oldAncestors.length + 1);
          return {
            updateOne: {
              filter: { _id: descendant._id },
              update: { $set: { ancestors: [...newAncestors, folder._id, ...suffix] } },
            },
          };
        });
      }
    }
    await folder.save();
    if (descendantOperations.length) await AssetFolder.bulkWrite(descendantOperations);
    res.json({ success: true, data: folder, message: "Folder updated." });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : error.statusCode || 400).json({
      success: false,
      message: duplicate ? "A folder with this name already exists here." : error.message || "Unable to update folder.",
    });
  }
}

export async function trashAssetFolder(req, res) {
  try {
    const folder = await AssetFolder.findOne({ _id: req.params.id, status: "active" });
    if (!folder) return res.status(404).json({ success: false, message: "Folder not found." });
    const descendants = await AssetFolder.find({ ancestors: folder._id, status: "active" }).select("_id").lean();
    const folderIds = [folder._id, ...descendants.map((item) => item._id)];
    const now = new Date();
    await Promise.all([
      AssetFolder.updateMany(
        { _id: { $in: folderIds }, status: "active" },
        { $set: { status: "trashed", deletedAt: now, deletedBy: req.user._id, trashedByFolderId: folder._id } },
      ),
      Asset.updateMany(
        { folderId: { $in: folderIds }, status: "active" },
        { $set: { status: "trashed", deletedAt: now, deletedBy: req.user._id, trashedByFolderId: folder._id } },
      ),
    ]);
    res.json({ success: true, message: "Folder and its contents moved to Trash." });
  } catch {
    res.status(400).json({ success: false, message: "Unable to move folder to Trash." });
  }
}

export async function restoreAssetFolder(req, res) {
  try {
    const folder = await AssetFolder.findOne({ _id: req.params.id, status: "trashed" });
    if (!folder) return res.status(404).json({ success: false, message: "Trashed folder not found." });
    if (folder.trashedByFolderId && String(folder.trashedByFolderId) !== String(folder._id)) {
      return res.status(409).json({ success: false, message: "Restore the top-level trashed folder to restore this nested folder." });
    }
    let parent = folder.parentId ? await activeParent(folder.parentId) : null;
    if (folder.parentId && !parent) {
      folder.parentId = null;
      folder.ancestors = [];
    }
    const conflict = await AssetFolder.exists({
      _id: { $ne: folder._id },
      parentId: folder.parentId,
      normalizedName: folder.normalizedName,
      status: "active",
    });
    if (conflict) return res.status(409).json({ success: false, message: "Rename the existing folder before restoring this one." });
    await Promise.all([
      AssetFolder.updateMany(
        { trashedByFolderId: folder._id },
        { $set: { status: "active", deletedAt: null, deletedBy: null, trashedByFolderId: null } },
      ),
      Asset.updateMany(
        { trashedByFolderId: folder._id },
        { $set: { status: "active", deletedAt: null, deletedBy: null, trashedByFolderId: null } },
      ),
    ]);
    if (!parent && folder.parentId === null) await AssetFolder.updateOne({ _id: folder._id }, { $set: { ancestors: [] } });
    res.json({ success: true, message: "Folder restored." });
  } catch {
    res.status(400).json({ success: false, message: "Unable to restore folder." });
  }
}

export async function deleteAssetFolderPermanently(req, res) {
  try {
    if (req.user.role !== "super_admin") return res.status(403).json({ success: false, message: "Only a super admin can permanently delete folders." });
    const folder = await AssetFolder.findOne({ _id: req.params.id, status: "trashed" });
    if (!folder) return res.status(404).json({ success: false, message: "Trashed folder not found." });
    const folders = await AssetFolder.find({ $or: [{ _id: folder._id }, { ancestors: folder._id }] });
    const assets = await Asset.find({ folderId: { $in: folders.map((item) => item._id) } });
    const protectedUsage = await AssetUsage.findOne({ asset: { $in: assets.map((item) => item._id) } }).lean();
    if (protectedUsage) {
      return res.status(409).json({
        success: false,
        code: "ASSET_IN_USE",
        message: "This folder contains files referenced by content. View their usage before permanently deleting the folder.",
      });
    }
    for (const asset of assets) await permanentlyDeleteAsset(asset);
    await AssetFolder.deleteMany({ _id: { $in: folders.map((item) => item._id) } });
    res.json({ success: true, message: "Folder permanently deleted." });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, code: error.code, message: error.message || "Unable to permanently delete folder." });
  }
}
