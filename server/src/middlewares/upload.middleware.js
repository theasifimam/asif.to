import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import crypto from "crypto";

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

const privateMessageDirectory = path.resolve("private_uploads/messages");
const messageMimeTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf",
  "text/plain", "text/markdown", "text/csv", "application/json",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const uploadMessageAttachments = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => { ensureDirectory(privateMessageDirectory); callback(null, privateMessageDirectory); },
    filename: (_req, _file, callback) => callback(null, crypto.randomUUID()),
  }),
  fileFilter: (_req, file, callback) => {
    if (messageMimeTypes.has(file.mimetype)) return callback(null, true);
    const error = new Error("This file type is not allowed for team messages.");
    error.code = "INVALID_ATTACHMENT_TYPE";
    callback(error, false);
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 4 },
});

const starts = (buffer, bytes) => bytes.every((byte, index) => buffer[index] === byte);
const looksTextual = (buffer) => !buffer.includes(0) && (buffer.toString("utf8").match(/�/g)?.length || 0) < 3;

export async function validateMessageAttachment(file) {
  const buffer = await fs.promises.readFile(file.path);
  const mime = file.mimetype;
  const valid =
    (mime === "image/jpeg" && starts(buffer, [0xff, 0xd8, 0xff])) ||
    (mime === "image/png" && starts(buffer, [0x89, 0x50, 0x4e, 0x47])) ||
    (mime === "image/gif" && buffer.subarray(0, 4).toString() === "GIF8") ||
    (mime === "image/webp" && buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") ||
    (mime === "application/pdf" && buffer.subarray(0, 5).toString() === "%PDF-") ||
    (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && starts(buffer, [0x50, 0x4b, 0x03, 0x04])) ||
    (["text/plain", "text/markdown", "text/csv", "application/json"].includes(mime) && looksTextual(buffer));
  if (!valid) {
    await fs.promises.unlink(file.path).catch(() => {});
    const error = new Error("The file contents do not match the declared file type.");
    error.code = "INVALID_ATTACHMENT_CONTENT";
    throw error;
  }
  return file;
}

export const getPrivateMessageAttachmentPath = (storageKey) => path.join(privateMessageDirectory, path.basename(storageKey));

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
