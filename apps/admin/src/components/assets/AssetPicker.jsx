"use client";

import { useState } from "react";
import { Files, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAssetUrl } from "@/lib/assets";
import AssetBrowser from "./AssetBrowser";

export default function AssetPicker({
  value,
  onChange,
  accept = "*/*",
  label = "Choose from Library",
  description = "Select a reusable file or upload a new one.",
  showPreview = false,
  onClear,
}) {
  const [open, setOpen] = useState(false);
  const preview = value && typeof value === "object" ? getAssetUrl(value, { preview: true }) : "";
  const choose = (asset) => {
    onChange?.(asset);
    setOpen(false);
  };
  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(true)}><Files className="h-4 w-4" /> {label}</Button>
          {(value || onClear) && onClear && <Button type="button" variant="ghost" size="icon" onClick={onClear} aria-label="Clear selected asset"><X className="h-4 w-4" /></Button>}
        </div>
        {showPreview && preview && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected library asset" className="h-32 w-full object-cover" />
          </div>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[90vh] max-h-[920px] flex-col sm:max-w-[min(1180px,calc(100vw-2rem))]">
          <DialogHeader>
            <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white"><ImagePlus className="h-5 w-5" /></div>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1"><AssetBrowser pickerMode accept={accept} onChoose={choose} /></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
