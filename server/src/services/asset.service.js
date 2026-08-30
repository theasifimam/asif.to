import crypto from "crypto";
import path from "path";
import sharp from "sharp";

import Asset from "../models/Asset.js";
import AssetFolder from "../models/AssetFolder.js";
import AssetUsage from "../models/AssetUsage.js";
import storage, { getStorageProvider } from "./storage/index.js";
import { describeAssetFile, sanitizeAssetName } from "../utils/assetFiles.js";

const inlinePreviewExtensions = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".mp4", ".m4v", ".webm", ".mov", ".ogv",
  ".mp3", ".m4a", ".aac", ".wav", ".ogg", ".oga", ".opus", ".weba", ".flac", ".pdf",
]);

export function assetResponse(asset) {
  const value = typeof asset?.toObject === "function" ? asset.toObject() : { ...asset };
  const id = String(value._id);
  const isPublic = value.visibility === "public";
  const canInline = inlinePreviewExtensions.has(value.extension);
  const thumbnail = value.variants?.find((item) => item.kind === "thumbnail");
  return {
    ...value,
    publicUrl: isPublic
      ? canInline
        ? getStorageProvider(value.storageProvider).getPublicUrl(value.storageKey)
        : `/api/v1/assets/${id}/content`
      : null,
    previewUrl: isPublic
      ? thumbnail
        ? getStorageProvider(value.storageProvider).getPublicUrl(thumbnail.storageKey)
        : canInline
          ? getStorageProvider(value.storageProvider).getPublicUrl(value.storageKey)
          : null
      : null,
    downloadUrl: `/api/v1/assets/${id}/content?download=1`,
  };
}

export async function validateAssetFolder(folderId) {
  if (!folderId) return null;
  const folder = await AssetFolder.findOne({ _id: folderId, status: "active" }).lean();
  if (!folder) {
    const error = new Error("The selected folder does not exist.");
    error.statusCode = 404;
    throw error;
  }
  return folder._id;
}

export async function resolvePublicAsset(assetId, category = null) {
  if (!assetId) return null;
  const asset = await Asset.findOne({ _id: assetId, status: "active", visibility: "public" });
  if (!asset || (category && asset.category !== category)) {
    const error = new Error(category === "image" ? "Select a public image from the Media Library." : "Select a valid public file from the Media Library.");
    error.statusCode = 400;
    throw error;
  }
  return { asset, url: assetResponse(asset).publicUrl };
}

async function imageMetadata(buffer, extension) {
  if (![".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"].includes(extension)) {
    return { width: null, height: null, thumbnail: null };
  }
  const instance = sharp(buffer, { animated: extension === ".gif", limitInputPixels: 50_000_000 });
  const metadata = await instance.metadata();
  let thumbnail = null;
  if (extension !== ".svg" && metadata.width && metadata.height) {
    const result = await sharp(buffer, { animated: false, limitInputPixels: 50_000_000 })
      .rotate()
      .resize({ width: 480, height: 360, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78, effort: 3 })
      .toBuffer({ resolveWithObject: true });
    thumbnail = { buffer: result.data, width: result.info.width, height: result.info.height };
  }
  return { width: metadata.width || null, height: metadata.height || null, thumbnail };
}

export async function createAssetFromUpload({
  file,
  folderId,
  visibility = "public",
  uploadedBy,
  duplicateStrategy = "reject",
}) {
  const details = describeAssetFile(file);
  const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
  const duplicate = await Asset.findOne({ checksum }).sort({ status: 1, createdAt: 1 }).lean();

  if (duplicate && duplicateStrategy !== "upload-anyway") {
    return { status: "duplicate", asset: assetResponse(duplicate) };
  }

  const validFolderId = await validateAssetFolder(folderId);
  const provider = storage;
  const displayName = sanitizeAssetName(file.originalname);

  if (duplicate && duplicateStrategy === "upload-anyway") {
    const asset = await Asset.create({
      name: displayName,
      originalName: displayName,
      storageKey: duplicate.storageKey,
      storageProvider: duplicate.storageProvider,
      mimeType: duplicate.mimeType,
      extension: duplicate.extension,
      category: duplicate.category,
      size: duplicate.size,
      width: duplicate.width,
      height: duplicate.height,
      folderId: validFolderId,
      visibility: visibility === "private" ? "private" : "public",
      checksum,
      variants: duplicate.variants || [],
      uploadedBy,
      duplicateOf: duplicate._id,
    });
    return { status: "created", asset: assetResponse(asset), reusedStorage: true };
  }

  let upload;
  let thumbnailUpload;
  try {
    const metadata = await imageMetadata(file.buffer, details.extension);
    upload = await provider.upload({ buffer: file.buffer, extension: details.extension });
    const variants = [];
    if (metadata.thumbnail) {
      thumbnailUpload = await provider.upload({
        buffer: metadata.thumbnail.buffer,
        extension: ".webp",
        prefix: "assets/thumbnails",
      });
      variants.push({
        kind: "thumbnail",
        storageKey: thumbnailUpload.storageKey,
        mimeType: "image/webp",
        size: thumbnailUpload.size,
        width: metadata.thumbnail.width,
        height: metadata.thumbnail.height,
      });
    }
    const asset = await Asset.create({
      name: displayName,
      originalName: displayName,
      storageKey: upload.storageKey,
      storageProvider: provider.name,
      mimeType: details.mimeType,
      extension: details.extension,
      category: details.category,
      size: file.buffer.length,
      width: metadata.width,
      height: metadata.height,
      folderId: validFolderId,
      visibility: visibility === "private" ? "private" : "public",
      checksum,
      variants,
      uploadedBy,
    });
    return { status: "created", asset: assetResponse(asset), reusedStorage: false };
  } catch (error) {
    await Promise.allSettled(
      [upload?.storageKey, thumbnailUpload?.storageKey]
        .filter(Boolean)
        .map((key) => provider.delete(key)),
    );
    throw error;
  }
}

export async function permanentlyDeleteAsset(asset) {
  const [usageCount, publishedUsageCount] = await Promise.all([
    AssetUsage.countDocuments({ asset: asset._id }),
    AssetUsage.countDocuments({ asset: asset._id, entityStatus: "published" }),
  ]);
  if (usageCount) {
    const qualifier = publishedUsageCount
      ? `${publishedUsageCount} published resource${publishedUsageCount === 1 ? "" : "s"}`
      : `${usageCount} content resource${usageCount === 1 ? "" : "s"}`;
    const error = new Error(`Cannot permanently delete this asset. It is used by ${qualifier}.`);
    error.statusCode = 409;
    error.code = "ASSET_IN_USE";
    error.publishedUsageCount = publishedUsageCount;
    error.usageCount = usageCount;
    throw error;
  }

  const shared = await Asset.exists({ _id: { $ne: asset._id }, storageKey: asset.storageKey });
  const provider = getStorageProvider(asset.storageProvider);
  if (!shared) {
    await provider.delete(asset.storageKey);
    await Promise.allSettled((asset.variants || []).map((variant) => provider.delete(variant.storageKey)));
  }
  await Promise.all([
    AssetUsage.deleteMany({ asset: asset._id }),
    Asset.deleteOne({ _id: asset._id }),
  ]);
}

export function safeDownloadName(asset) {
  const name = sanitizeAssetName(asset.name || asset.originalName || "download");
  return path.extname(name) ? name : `${name}${asset.extension}`;
}
