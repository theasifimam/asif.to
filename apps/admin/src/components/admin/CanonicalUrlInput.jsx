"use client";

import React from "react";
import { Label } from "@/components/ui/label";

export function CanonicalUrlInput({
  basePrefix = "https://asif.to/",
  value = "",
  onChange,
  placeholder = "",
  label = "Canonical URL",
  description = "Auto-combined by API. You only need to type the ending slug (e.g. /my-slug).",
}) {
  const normalizedPrefix = basePrefix.endsWith("/")
    ? basePrefix
    : `${basePrefix}/`;
  const prefixPath = normalizedPrefix.replace(/^https?:\/\/[^/]+/i, "");

  const isFullExternalUrl = value && /^https?:\/\//i.test(value);

  // Extract clean suffix
  const effectiveSuffix = value
    ? isFullExternalUrl
      ? value
      : value
          .replace(/^https?:\/\/[^/]+/i, "")
          .replace(new RegExp(`^${prefixPath}`, "i"), "")
          .replace(/^\/+/, "")
    : "";

  const finalComputed = isFullExternalUrl
    ? value
    : effectiveSuffix
      ? `${normalizedPrefix}${effectiveSuffix}`
      : placeholder
        ? `${normalizedPrefix}${placeholder.replace(/^\/+/, "")}`
        : normalizedPrefix;

  const handleInputChange = (event) => {
    const nextVal = event.target.value;
    onChange(nextVal);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          {label}
        </Label>
        <span className="text-[10px] text-zinc-400 font-mono">
          Auto-combined by API
        </span>
      </div>

      <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50/50 overflow-hidden dark:border-zinc-800 dark:bg-zinc-900/50 text-xs font-mono">
        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-3 py-2.5 text-zinc-500 select-none border-r border-zinc-200 dark:border-zinc-800 max-w-47.5 sm:max-w-xs truncate">
          {normalizedPrefix}
        </span>
        <input
          type="text"
          value={effectiveSuffix}
          onChange={handleInputChange}
          placeholder={
            placeholder ? placeholder.replace(/^\/+/, "") : "slug-ending"
          }
          className="flex-1 bg-transparent px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400"
        />
      </div>

      <div className="flex items-center justify-between gap-2 text-[11px]">
        <p className="text-zinc-500 truncate">
          Full Canonical:{" "}
          <span className="font-mono text-blue-600 dark:text-blue-400">
            {finalComputed}
          </span>
        </p>
      </div>
    </div>
  );
}

export default CanonicalUrlInput;
