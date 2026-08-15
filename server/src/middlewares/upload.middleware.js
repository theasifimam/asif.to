import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const ensureDirectory = (directory) => {
  if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
};

const storageFor = (directory, prefix) =>
  multer.diskStorage({
    destination: (_req, _file, callback) => {
      ensureDirectory(directory);
      callback(null, directory);
    },
    filename: (_req, file, callback) => {
      const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      callback(
        null,
        `${prefix}-${suffix}${path.extname(file.originalname).toLowerCase()}`,
      );
    },
  });

const fileFilter = (_req, file, callback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) return callback(null, true);
  const error = new Error("Only JPG, PNG, WebP, and GIF images are allowed.");
  error.code = "INVALID_IMAGE_TYPE";
  return callback(error, false);
};

export const uploadArticleImage = multer({
  storage: storageFor("uploads/articles", "article"),
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

export const uploadAvatar = multer({
  storage: storageFor("uploads/avatars", "avatar"),
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024, files: 1 },
});

const compressUploadedImage =
  ({ width, height, fit, quality }) =>
  async (req, _res, next) => {
    if (!req.file) return next();

    const originalPath = req.file.path;
    const parsed = path.parse(originalPath);
    const outputPath = path.join(parsed.dir, `${parsed.name}-optimized.webp`);

    try {
      const result = await sharp(originalPath, {
        animated: req.file.mimetype === "image/gif",
        limitInputPixels: 50_000_000,
      })
        .rotate()
        .resize({
          width,
          height,
          fit,
          position: fit === "cover" ? "attention" : "centre",
          withoutEnlargement: true,
        })
        .webp({ quality, effort: 4 })
        .toFile(outputPath);

      await fs.promises.unlink(originalPath);

      req.file.filename = path.basename(outputPath);
      req.file.path = outputPath;
      req.file.mimetype = "image/webp";
      req.file.size = result.size;
      req.file.compressed = true;
      return next();
    } catch (error) {
      await Promise.allSettled(
        [
          fs.promises.unlink(originalPath),
          fs.promises.unlink(outputPath),
        ].filter(Boolean),
      );
      error.code ||= "IMAGE_PROCESSING_FAILED";
      return next(error);
    }
  };

export const compressAvatar = compressUploadedImage({
  width: 512,
  height: 512,
  fit: "cover",
  quality: 82,
});

export const compressArticleImage = compressUploadedImage({
  width: 1920,
  height: 1080,
  fit: "inside",
  quality: 84,
});
