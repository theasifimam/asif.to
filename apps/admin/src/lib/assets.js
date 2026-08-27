import { getImageUrl } from "./utils";

export function formatAssetBytes(bytes = 0) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(1)} GB`;
}

export function getAssetUrl(asset, { preview = false, download = false } = {}) {
  const value = download
    ? asset?.downloadUrl
    : preview
      ? asset?.previewUrl || asset?.publicUrl
      : asset?.publicUrl || asset?.downloadUrl;
  if (!value) return "";
  if (/^(?:https?:|blob:|data:)/i.test(value)) return value;
  if (value.startsWith("/uploads/")) return getImageUrl(value);
  if (value.startsWith("/api/")) {
    const configured = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    const origin = configured.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
    return `${origin}${value}`;
  }
  return getImageUrl(value);
}

export function assetAccepts(asset, accept = "") {
  if (!accept || accept === "*/*") return true;
  return accept.split(",").some((rule) => {
    const value = rule.trim().toLowerCase();
    if (value.endsWith("/*")) return asset.mimeType?.startsWith(value.slice(0, -1));
    if (value.startsWith(".")) return asset.extension === value;
    return asset.mimeType === value;
  });
}

export const ASSET_TYPE_LABELS = Object.freeze({
  image: "Image",
  video: "Video",
  document: "Document",
  code_archive: "Code / Archive",
  other: "Other",
});
