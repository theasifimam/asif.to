import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../../uploads");

function resolveStoragePath(storageKey) {
  const normalized = String(storageKey || "").replace(/\\/g, "/").replace(/^\/+/, "");
  const absolute = path.resolve(uploadsRoot, normalized);
  if (!normalized || !absolute.startsWith(`${uploadsRoot}${path.sep}`)) {
    const error = new Error("Invalid storage key.");
    error.code = "INVALID_STORAGE_KEY";
    throw error;
  }
  return absolute;
}

function publicBaseUrl() {
  return String(process.env.PUBLIC_STORAGE_URL || "").replace(/\/$/, "");
}

export const localStorageProvider = {
  name: "local",

  async upload({ buffer, extension, prefix = "assets" }) {
    const now = new Date();
    const directory = [
      prefix,
      String(now.getUTCFullYear()),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
    ].join("/");
    const storageKey = `${directory}/${crypto.randomUUID()}${extension}`;
    const absolute = resolveStoragePath(storageKey);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, buffer, { flag: "wx" });
    return { storageKey, size: buffer.length };
  },

  async delete(storageKey) {
    const absolute = resolveStoragePath(storageKey);
    await fs.unlink(absolute).catch((error) => {
      if (error.code !== "ENOENT") throw error;
    });
  },

  async read(storageKey) {
    return fs.readFile(resolveStoragePath(storageKey));
  },

  getAbsolutePath(storageKey) {
    return resolveStoragePath(storageKey);
  },

  getPublicUrl(storageKey) {
    const relative = `/uploads/${String(storageKey).replace(/\\/g, "/").replace(/^\/+/, "")}`;
    return `${publicBaseUrl()}${relative}`;
  },

  getSignedUrl() {
    return null;
  },
};

export { uploadsRoot };
