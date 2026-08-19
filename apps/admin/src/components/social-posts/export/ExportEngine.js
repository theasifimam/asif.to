"use client";

import { toJpeg, toPng } from "html-to-image";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function slugify(value = "social-post") {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "social-post"
  );
}

function dataUrlToBlob(dataUrl) {
  const [meta, data] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/png";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

const waitForFonts = async () => {
  if (document.fonts?.ready) await document.fonts.ready;
};

export async function renderNode(node, type = "png") {
  if (!node) throw new Error("Export node not found.");

  await waitForFonts();

  const common = {
    pixelRatio: 1,
    cacheBust: true,
    skipAutoScale: true,
  };

  return type === "jpeg"
    ? toJpeg(node, { ...common, quality: 0.96, backgroundColor: "#0a0a0f" })
    : toPng(node, common);
}

export async function downloadNode(node, {
  type = "png",
  name = "social-post",
  index = 0,
} = {}) {
  const dataUrl = await renderNode(node, type);
  const filename = `${slugify(name)}-${String(index + 1).padStart(2, "0")}.${type === "jpeg" ? "jpg" : "png"}`;
  saveAs(dataUrlToBlob(dataUrl), filename);
}

export async function downloadAllNodes(nodes, {
  type = "png",
  name = "social-post",
} = {}) {
  if (!nodes?.length) throw new Error("No slides available to export.");

  const zip = new JSZip();
  const extension = type === "jpeg" ? "jpg" : "png";

  for (let index = 0; index < nodes.length; index += 1) {
    const dataUrl = await renderNode(nodes[index], type);
    const blob = dataUrlToBlob(dataUrl);

    zip.file(
      `${slugify(name)}-${String(index + 1).padStart(2, "0")}.${extension}`,
      blob,
    );
  }

  const archive = await zip.generateAsync({ type: "blob" });
  saveAs(archive, `${slugify(name)}-carousel.zip`);
}
