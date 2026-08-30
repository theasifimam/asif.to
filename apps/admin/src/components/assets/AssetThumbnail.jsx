"use client";

import { Archive, AudioLines, Code2, File, FileSpreadsheet, FileText, Film, Image as ImageIcon } from "lucide-react";
import { getAssetUrl } from "@/lib/assets";
import { cn } from "@/lib/utils";

export function AssetTypeIcon({ asset, className }) {
  const extension = asset?.extension;
  const Icon = asset?.category === "image"
    ? ImageIcon
    : asset?.category === "video"
      ? Film
      : asset?.category === "audio"
        ? AudioLines
      : asset?.category === "code_archive"
        ? extension === ".zip" ? Archive : Code2
        : [".csv", ".xls", ".xlsx"].includes(extension)
          ? FileSpreadsheet
          : asset?.category === "document"
            ? FileText
            : File;
  return <Icon className={cn("h-8 w-8", className)} />;
}

export default function AssetThumbnail({ asset, className, iconClassName }) {
  const preview = getAssetUrl(asset, { preview: true });
  if (asset?.category === "image" && preview) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={preview}
        alt=""
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  if (asset?.category === "video" && preview) {
    return <video src={preview} muted preload="metadata" className={cn("h-full w-full object-cover", className)} />;
  }
  return (
    <div className={cn("flex h-full w-full items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-zinc-900", className)}>
      <AssetTypeIcon asset={asset} className={iconClassName} />
    </div>
  );
}
