"use client";

import { useState } from "react";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AssetUploadPanel from "./AssetUploadPanel";

export function AssetTextDialog({
  open,
  onOpenChange,
  title,
  description,
  label,
  initialValue = "",
  confirmLabel = "Save",
  loading,
  onConfirm,
}) {
  const [value, setValue] = useState(initialValue);
  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setValue(initialValue);
    onOpenChange(nextOpen);
  };
  const submit = (event) => {
    event.preventDefault();
    if (value.trim()) onConfirm(value.trim());
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{label}</Label>
            <Input
              autoFocus
              value={value}
              onChange={(event) => setValue(event.target.value)}
              maxLength={120}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!value.trim()}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  loading,
  onConfirm,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="island" className="p-6 sm:p-8 sm:max-w-110">
        <DialogHeader className="items-center text-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <DialogTitle className="font-outfit text-xl sm:text-2xl font-black tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:flex-1 rounded-full text-xs font-bold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            loading={loading}
            onClick={onConfirm}
            className="w-full sm:flex-1 rounded-full text-xs font-bold"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssetUploadDialog({
  open,
  onOpenChange,
  folderId,
  onUploaded,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <UploadCloud className="h-5 w-5" />
          </div>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>
            Upload once, then reuse these files across asif.to content.
          </DialogDescription>
        </DialogHeader>
        <AssetUploadPanel folderId={folderId} onUploaded={onUploaded} />
      </DialogContent>
    </Dialog>
  );
}
