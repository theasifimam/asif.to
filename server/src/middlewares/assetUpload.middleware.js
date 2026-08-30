import multer from "multer";

const maxFileSizeMb = Math.min(
  Math.max(Number.parseInt(process.env.ASSET_MAX_FILE_SIZE_MB || "100", 10), 1),
  100,
);

export const uploadAssets = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeMb * 1024 * 1024, files: 20 },
});

export const assetUploadLimits = Object.freeze({
  maxFileSizeMb,
  maxFiles: 20,
});
