"use client";

import {
  ClipboardCopy,
  ClipboardPaste,
  FolderInput,
  Scissors,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function itemLabel(items = []) {
  if (items.length === 1) return items[0].name || "1 item";
  return `${items.length} items`;
}

export default function AssetTransferBar({
  clipboard,
  destinationMode,
  breadcrumbs = [],
  currentFolderId,
  loading = false,
  onPasteHere,
  onChooseDestination,
  onConfirmDestination,
  onCancelDestination,
  onClearClipboard,
}) {
  const destination = breadcrumbs.length
    ? `All Files / ${breadcrumbs.map((folder) => folder.name).join(" / ")}`
    : currentFolderId
      ? "Current folder"
      : "All Files";

  if (destinationMode) {
    const isCopy = destinationMode.operation === "copy";
    return (
      <div className="flex flex-wrap items-center gap-2 border-b border-violet-200 bg-violet-50 px-3 py-2.5 dark:border-violet-900/50 dark:bg-violet-950/30 sm:px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600 text-white">
          {isCopy ? <ClipboardCopy className="h-4 w-4" /> : <FolderInput className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-black text-violet-950 dark:text-violet-100">
            {isCopy ? "Copy" : "Move"} {itemLabel(destinationMode.items)}
          </p>
          <p className="truncate text-[10px] font-semibold text-violet-600 dark:text-violet-300">
            Open folders to choose a destination · Current: {destination}
          </p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={onCancelDestination} disabled={loading}>
          Cancel
        </Button>
        <Button type="button" size="sm" onClick={onConfirmDestination} loading={loading}>
          {isCopy ? "Copy here" : "Move here"}
        </Button>
      </div>
    );
  }

  if (!clipboard) return null;
  const isCopy = clipboard.operation === "copy";
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50 px-3 py-2.5 dark:border-blue-900/40 dark:bg-blue-950/30 sm:px-5">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
        {isCopy ? <ClipboardCopy className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-blue-950 dark:text-blue-100">
          {itemLabel(clipboard.items)} {isCopy ? "copied" : "cut"}
        </p>
        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-300">
          Navigate to a folder and paste, or choose the destination now.
        </p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onChooseDestination} disabled={loading}>
        Choose folder
      </Button>
      <Button type="button" size="sm" onClick={onPasteHere} loading={loading}>
        <ClipboardPaste className="h-3.5 w-3.5" /> Paste here
      </Button>
      <button
        type="button"
        onClick={onClearClipboard}
        disabled={loading}
        aria-label="Clear file clipboard"
        className="flex h-8 w-8 items-center justify-center rounded-xl text-blue-500 hover:bg-blue-100 hover:text-blue-900 disabled:opacity-50 dark:hover:bg-blue-900/50 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
