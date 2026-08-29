"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useCallback, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Copy, UploadCloud, X } from "lucide-react";
import { assetsApi } from "@/lib/api";
import { formatAssetBytes } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const inputAccept = ".jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.mp4,.mov,.webm,.pdf,.txt,.csv,.json,.doc,.docx,.xls,.xlsx,.js,.jsx,.ts,.tsx,.py,.java,.cpp,.html,.css,.md,.zip";

export default function AssetUploadPanel({ folderId, onUploaded, compact = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState([]);

  const runUpload = useCallback(async (item, duplicateStrategy) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading", progress: 1, error: "" } : entry));
    const response = await assetsApi.upload(
      item.file,
      { folderId, duplicateStrategy },
      (progress) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)),
    );
    const result = response.data?.results?.[0];
    if (result?.status === "created") {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "success", progress: 100, asset: result.asset } : entry));
      onUploaded?.(result.asset);
    } else if (result?.status === "duplicate") {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "duplicate", progress: 100, duplicateAsset: result.asset } : entry));
    } else {
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "error", progress: 0, error: result?.error || response.error || "Upload failed." } : entry));
    }
  }, [folderId, onUploaded]);

  const addFiles = useCallback((fileList) => {
    const additions = Array.from(fileList || []).map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      status: "queued",
      progress: 0,
    }));
    if (!additions.length) return;
    setItems((current) => [...additions, ...current].slice(0, 30));
    additions.forEach((item) => runUpload(item));
  }, [runUpload]);

  const handleUseExisting = (item) => {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "success", asset: item.duplicateAsset } : entry));
    onUploaded?.(item.duplicateAsset);
  };

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" multiple accept={inputAccept} hidden onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
        className={cn(
          "flex w-full items-center justify-center gap-3 rounded-3xl border border-dashed px-5 text-center transition-colors",
          compact ? "min-h-24 py-4" : "min-h-36 py-7",
          dragging
            ? "border-blue-500 bg-blue-500/10 text-blue-600"
            : "border-zinc-300 bg-zinc-50/70 text-zinc-500 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-900/50",
        )}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-left">
          <span className="block text-sm font-bold text-zinc-900 dark:text-white">Drop files here or choose files</span>
          <span className="mt-0.5 block text-[11px] font-medium">Multiple files supported · validated on the server</span>
        </span>
      </button>

      {items.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1" data-scroll-ignore>
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-zinc-200/80 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-zinc-400">
                  {item.status === "uploading" || item.status === "queued" ? <LogoLoader className="h-4 w-4  text-blue-500"  /> : item.status === "success" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : item.status === "duplicate" ? <Copy className="h-4 w-4 text-amber-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-zinc-900 dark:text-white">{item.file.name}</p>
                  <p className="text-[10px] font-medium text-zinc-400">{formatAssetBytes(item.file.size)}</p>
                  {item.status === "uploading" && <Progress value={item.progress} className="mt-2 h-1.5" />}
                  {item.error && <p className="mt-1 text-[11px] font-medium text-red-500">{item.error}</p>}
                  {item.status === "duplicate" && (
                    <div className="mt-2">
                      <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        Identical content already exists as {item.duplicateAsset?.name}.
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={() => handleUseExisting(item)}>Use existing</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => runUpload(item, "upload-anyway")}>Create another entry</Button>
                      </div>
                    </div>
                  )}
                </div>
                <button type="button" aria-label="Remove upload" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
