import path from "path";

const TYPES = Object.freeze({
  ".jpg": ["image/jpeg", "image"],
  ".jpeg": ["image/jpeg", "image"],
  ".png": ["image/png", "image"],
  ".webp": ["image/webp", "image"],
  ".avif": ["image/avif", "image"],
  ".gif": ["image/gif", "image"],
  ".svg": ["image/svg+xml", "image"],
  ".mp4": ["video/mp4", "video"],
  ".m4v": ["video/x-m4v", "video"],
  ".mov": ["video/quicktime", "video"],
  ".webm": ["video/webm", "video"],
  ".ogv": ["video/ogg", "video"],
  ".mp3": ["audio/mpeg", "audio"],
  ".m4a": ["audio/mp4", "audio"],
  ".aac": ["audio/aac", "audio"],
  ".wav": ["audio/wav", "audio"],
  ".ogg": ["audio/ogg", "audio"],
  ".oga": ["audio/ogg", "audio"],
  ".opus": ["audio/ogg", "audio"],
  ".weba": ["audio/webm", "audio"],
  ".flac": ["audio/flac", "audio"],
  ".pdf": ["application/pdf", "document"],
  ".txt": ["text/plain", "document"],
  ".csv": ["text/csv", "document"],
  ".json": ["application/json", "document"],
  ".doc": ["application/msword", "document"],
  ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "document"],
  ".xls": ["application/vnd.ms-excel", "document"],
  ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "document"],
  ".js": ["text/javascript", "code_archive"],
  ".jsx": ["text/jsx", "code_archive"],
  ".ts": ["text/typescript", "code_archive"],
  ".tsx": ["text/tsx", "code_archive"],
  ".py": ["text/x-python", "code_archive"],
  ".java": ["text/x-java-source", "code_archive"],
  ".cpp": ["text/x-c++src", "code_archive"],
  ".html": ["text/html", "code_archive"],
  ".css": ["text/css", "code_archive"],
  ".md": ["text/markdown", "code_archive"],
  ".zip": ["application/zip", "code_archive"],
});

const TEXT_EXTENSIONS = new Set([
  ".txt", ".csv", ".json", ".js", ".jsx", ".ts", ".tsx", ".py",
  ".java", ".cpp", ".html", ".css", ".md", ".svg",
]);

const starts = (buffer, bytes) =>
  bytes.every((byte, index) => buffer[index] === byte);
const isZip = (buffer) => starts(buffer, [0x50, 0x4b, 0x03, 0x04]);
const isCompoundDocument = (buffer) =>
  starts(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const isText = (buffer) => {
  if (buffer.includes(0)) return false;
  const decoded = buffer.toString("utf8");
  return (decoded.match(/\uFFFD/g)?.length || 0) < 3;
};

function hasExpectedSignature(extension, buffer) {
  if (TEXT_EXTENSIONS.has(extension)) return isText(buffer);
  if ([".jpg", ".jpeg"].includes(extension)) return starts(buffer, [0xff, 0xd8, 0xff]);
  if (extension === ".png") return starts(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (extension === ".gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString());
  if (extension === ".webp") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";
  if (extension === ".avif") return buffer.subarray(4, 12).toString().startsWith("ftypavi");
  if (extension === ".pdf") return buffer.subarray(0, 5).toString() === "%PDF-";
  if ([".zip", ".docx", ".xlsx"].includes(extension)) return isZip(buffer);
  if ([".doc", ".xls"].includes(extension)) return isCompoundDocument(buffer);
  if ([".mp4", ".m4v", ".mov", ".m4a"].includes(extension)) return buffer.subarray(4, 8).toString() === "ftyp";
  if ([".webm", ".weba"].includes(extension)) return starts(buffer, [0x1a, 0x45, 0xdf, 0xa3]);
  if ([".ogg", ".oga", ".opus", ".ogv"].includes(extension)) return buffer.subarray(0, 4).toString() === "OggS";
  if (extension === ".mp3") return buffer.subarray(0, 3).toString() === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
  if (extension === ".aac") return buffer[0] === 0xff && (buffer[1] & 0xf6) === 0xf0;
  if (extension === ".wav") return buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WAVE";
  if (extension === ".flac") return buffer.subarray(0, 4).toString() === "fLaC";
  return false;
}

function validateSvg(buffer) {
  const value = buffer.toString("utf8");
  if (!/<svg(?:\s|>)/i.test(value)) return false;
  const unsafe = /<script|<foreignObject|\son\w+\s*=|(?:href|src)\s*=\s*["']\s*(?:javascript:|https?:|\/\/)|<!ENTITY/i;
  return !unsafe.test(value);
}

export function sanitizeAssetName(value = "file") {
  const base = path.basename(String(value).replace(/\0/g, "")).replace(/[\u0000-\u001f\u007f]/g, "");
  return (base.trim() || "file").slice(0, 255);
}

export function describeAssetFile(file) {
  const originalName = sanitizeAssetName(file?.originalname);
  const extension = path.extname(originalName).toLowerCase();
  const definition = TYPES[extension];
  if (!definition) {
    const error = new Error(`Files with the ${extension || "unknown"} extension are not supported.`);
    error.code = "INVALID_ASSET_TYPE";
    throw error;
  }
  if (!file?.buffer?.length || !hasExpectedSignature(extension, file.buffer)) {
    const error = new Error("The file contents do not match its extension or are not supported.");
    error.code = "INVALID_ASSET_CONTENT";
    throw error;
  }
  if (extension === ".svg" && !validateSvg(file.buffer)) {
    const error = new Error("The SVG contains unsafe or externally loaded content.");
    error.code = "UNSAFE_SVG";
    throw error;
  }
  if (extension === ".json") {
    try {
      JSON.parse(file.buffer.toString("utf8"));
    } catch {
      const error = new Error("The selected JSON file is not valid JSON.");
      error.code = "INVALID_ASSET_CONTENT";
      throw error;
    }
  }
  return {
    originalName,
    extension,
    mimeType: definition[0],
    category: definition[1],
  };
}

export const assetTypeDefinitions = TYPES;
