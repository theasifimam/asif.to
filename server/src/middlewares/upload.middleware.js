import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * Configure storage for uploaded article images
 */
const articleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/articles";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `article-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

/**
 * Configure storage for user avatars
 */
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/avatars";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images (.jpg, .png, .webp, .gif) are allowed"), false);
  }
};

export const uploadArticleImage = multer({
  storage: articleStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB for avatars
});