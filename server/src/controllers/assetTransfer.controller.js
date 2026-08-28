import mongoose from "mongoose";

import Asset from "../models/Asset.js";
import AssetFolder from "../models/AssetFolder.js";

const MAX_TRANSFER_ITEMS = 200;
const MAX_COPIED_TREE_ITEMS = 5000;

function objectId(value) {
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

async function destinationFolder(folderId) {
  if (!folderId) return null;
  const id = objectId(folderId);
  if (!id) {
    const error = new Error("Destination folder is invalid.");
    error.statusCode = 400;
    throw error;
  }
  const folder = await AssetFolder.findOne({ _id: id, status: "active" });
  if (!folder) {
    const error = new Error("Destination folder was not found.");
    error.statusCode = 404;
    throw error;
  }
  return folder;
}

function normalizedEntries(items) {
  const seen = new Set();
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      id: objectId(item?.id),
      kind: item?.kind === "folder" ? "folder" : "asset",
    }))
    .filter((item) => {
      if (!item.id) return false;
      const key = `${item.kind}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_TRANSFER_ITEMS);
}

function splitFileName(name) {
  const value = String(name || "File");
  const index = value.lastIndexOf(".");
  if (index <= 0) return { stem: value, extension: "" };
  return { stem: value.slice(0, index), extension: value.slice(index) };
}

async function uniqueFolderName(name, parentId) {
  const base = String(name || "Folder").trim().slice(0, 120) || "Folder";
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? "" : attempt === 1 ? " (copy)" : ` (copy ${attempt})`;
    const candidate = `${base.slice(0, 120 - suffix.length)}${suffix}`;
    const exists = await AssetFolder.exists({
      parentId: parentId || null,
      normalizedName: candidate.toLocaleLowerCase(),
      status: "active",
    });
    if (!exists) return candidate;
  }
  throw new Error(`Unable to create a unique copy of ${base}.`);
}

async function uniqueAssetName(name, folderId) {
  const { stem, extension } = splitFileName(name);
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = attempt === 0 ? "" : attempt === 1 ? " (copy)" : ` (copy ${attempt})`;
    const candidate = `${stem.slice(0, Math.max(1, 255 - extension.length - suffix.length))}${suffix}${extension}`;
    const exists = await Asset.exists({
      folderId: folderId || null,
      name: candidate,
      status: "active",
    });
    if (!exists) return candidate;
  }
  throw new Error(`Unable to create a unique copy of ${name}.`);
}

function copiedAssetData(asset, folderId, userId, name) {
  return {
    name,
    originalName: asset.originalName,
    storageKey: asset.storageKey,
    storageProvider: asset.storageProvider,
    mimeType: asset.mimeType,
    extension: asset.extension,
    category: asset.category,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    folderId: folderId || null,
    visibility: asset.visibility,
    checksum: asset.checksum,
    variants: asset.variants,
    uploadedBy: userId,
    isFavorite: false,
    status: "active",
    duplicateOf: asset.duplicateOf || asset._id,
  };
}

async function copyAsset(asset, targetFolderId, userId, stats) {
  const name = await uniqueAssetName(asset.name, targetFolderId);
  await Asset.create(copiedAssetData(asset, targetFolderId, userId, name));
  stats.files += 1;
}

async function copyFolderTree(sourceFolder, destination, userId, stats) {
  const folders = await AssetFolder.find({
    status: "active",
    $or: [{ _id: sourceFolder._id }, { ancestors: sourceFolder._id }],
  }).lean();
  const sourceIds = folders.map((folder) => folder._id);
  const assets = await Asset.find({
    status: "active",
    folderId: { $in: sourceIds },
  }).lean();
  if (folders.length + assets.length > MAX_COPIED_TREE_ITEMS) {
    const error = new Error(
      `The folder contains more than ${MAX_COPIED_TREE_ITEMS} items and cannot be copied at once.`,
    );
    error.statusCode = 413;
    throw error;
  }

  const byId = new Map(folders.map((folder) => [String(folder._id), folder]));
  const ordered = [...folders].sort(
    (left, right) => left.ancestors.length - right.ancestors.length,
  );
  const newFolders = new Map();

  for (const folder of ordered) {
    const isRoot = String(folder._id) === String(sourceFolder._id);
    const parent = isRoot
      ? destination
      : newFolders.get(String(folder.parentId));
    if (!isRoot && !parent) {
      throw new Error(`Unable to resolve the parent of ${folder.name}.`);
    }
    const name = isRoot
      ? await uniqueFolderName(folder.name, parent?._id || null)
      : folder.name;
    const created = await AssetFolder.create({
      name,
      normalizedName: name.toLocaleLowerCase(),
      parentId: parent?._id || null,
      ancestors: parent ? [...parent.ancestors, parent._id] : [],
      createdBy: userId,
    });
    newFolders.set(String(folder._id), created);
    stats.folders += 1;
  }

  for (const asset of assets) {
    const target = newFolders.get(String(asset.folderId));
    if (!target || !byId.has(String(asset.folderId))) continue;
    await copyAsset(asset, target._id, userId, stats);
  }
}

async function moveFolder(folder, destination) {
  if (
    destination &&
    (String(destination._id) === String(folder._id) ||
      destination.ancestors.some((id) => String(id) === String(folder._id)))
  ) {
    const error = new Error("A folder cannot be moved into itself or one of its subfolders.");
    error.statusCode = 400;
    throw error;
  }

  const newAncestors = destination
    ? [...destination.ancestors, destination._id]
    : [];
  const descendants = await AssetFolder.find({
    ancestors: folder._id,
    status: "active",
  });
  folder.parentId = destination?._id || null;
  folder.ancestors = newAncestors;
  await folder.save();

  if (descendants.length) {
    await AssetFolder.bulkWrite(
      descendants.map((descendant) => {
        const folderIndex = descendant.ancestors.findIndex(
          (id) => String(id) === String(folder._id),
        );
        const suffix = descendant.ancestors.slice(folderIndex + 1);
        return {
          updateOne: {
            filter: { _id: descendant._id },
            update: {
              $set: {
                ancestors: [...newAncestors, folder._id, ...suffix],
              },
            },
          },
        };
      }),
    );
  }
}

function rootFolderSelections(folders) {
  const selectedFolderIds = new Set(folders.map((folder) => String(folder._id)));
  return folders.filter(
    (folder) =>
      !folder.ancestors.some((ancestor) => selectedFolderIds.has(String(ancestor))),
  );
}

export async function transferAssets(req, res) {
  try {
    const body = req.body || {};
    const operation = body.operation;
    if (!["copy", "move"].includes(operation)) {
      return res.status(400).json({ success: false, message: "Choose copy or move." });
    }
    const entries = normalizedEntries(body.items);
    if (!entries.length) {
      return res.status(400).json({ success: false, message: "Select at least one file or folder." });
    }
    const destination = await destinationFolder(body.destinationFolderId || null);
    const folderIds = entries.filter((item) => item.kind === "folder").map((item) => item.id);
    const assetIds = entries.filter((item) => item.kind === "asset").map((item) => item.id);
    const [folders, assets] = await Promise.all([
      AssetFolder.find({ _id: { $in: folderIds }, status: "active" }),
      Asset.find({ _id: { $in: assetIds }, status: "active" }),
    ]);
    const roots = rootFolderSelections(folders);
    const rootIds = roots.map((folder) => folder._id);
    const coveredFolders = rootIds.length
      ? await AssetFolder.find({
          status: "active",
          $or: [{ _id: { $in: rootIds } }, { ancestors: { $in: rootIds } }],
        })
          .select("_id")
          .lean()
      : [];
    const coveredFolderIds = new Set(
      coveredFolders.map((folder) => String(folder._id)),
    );
    const standaloneAssets = assets.filter(
      (asset) => !coveredFolderIds.has(String(asset.folderId || "")),
    );
    const stats = { files: 0, folders: 0 };

    if (operation === "copy") {
      for (const folder of roots) {
        await copyFolderTree(folder, destination, req.user._id, stats);
      }
      for (const asset of standaloneAssets) {
        await copyAsset(asset, destination?._id || null, req.user._id, stats);
      }
    } else {
      for (const folder of roots) {
        await moveFolder(folder, destination);
        stats.folders += 1;
      }
      if (standaloneAssets.length) {
        await Asset.updateMany(
          { _id: { $in: standaloneAssets.map((asset) => asset._id) } },
          { $set: { folderId: destination?._id || null } },
        );
        stats.files += standaloneAssets.length;
      }
    }

    const summary = [
      stats.files && `${stats.files} file${stats.files === 1 ? "" : "s"}`,
      stats.folders && `${stats.folders} folder${stats.folders === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(" and ");
    res.json({
      success: true,
      data: stats,
      message: `${summary || "Items"} ${operation === "copy" ? "copied" : "moved"}.`,
    });
  } catch (error) {
    const duplicate = error?.code === 11000;
    res.status(duplicate ? 409 : error.statusCode || 400).json({
      success: false,
      message: duplicate
        ? "An item with the same name already exists in that folder."
        : error.message || "Unable to transfer the selected items.",
    });
  }
}
