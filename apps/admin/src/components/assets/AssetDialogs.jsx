"use client";

import { useState } from "react";
import { AlertTriangle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AssetUploadPanel from "./AssetUploadPanel";

export function AssetTextDialog({ open, onOpenChange, title, description, label, initialValue = "", confirmLabel = "Save", loading, onConfirm }) {
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
          <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
          <div className="space-y-2"><Label>{label}</Label><Input autoFocus value={value} onChange={(event) => setValue(event.target.value)} maxLength={120} /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" loading={loading} disabled={!value.trim()}>{confirmLabel}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AssetMoveDialog({ open, onOpenChange, folders = [], currentFolderId, title = "Move files", loading, onConfirm }) {
  const [folderId, setFolderId] = useState("root");
  const handleOpenChange = (nextOpen) => {
    if (nextOpen) setFolderId(currentFolderId || "root");
    onOpenChange(nextOpen);
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Moving changes organization only. Stable asset references and URLs remain unchanged.</DialogDescription></DialogHeader>
        <div className="space-y-2">
          <Label>Destination</Label>
          <Select value={folderId} onValueChange={setFolderId}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="root">All Files (root)</SelectItem>
              {folders.map((folder) => <SelectItem key={folder._id} value={folder._id}>{folder.pathLabel || folder.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" loading={loading} onClick={() => onConfirm(folderId === "root" ? null : folderId)}>Move</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssetConfirmDialog({ open, onOpenChange, title, description, confirmLabel, destructive = false, loading, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600"><AlertTriangle className="h-5 w-5" /></div>
          <DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" variant={destructive ? "destructive" : "default"} loading={loading} onClick={onConfirm}>{confirmLabel}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AssetUploadDialog({ open, onOpenChange, folderId, onUploaded }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><UploadCloud className="h-5 w-5" /></div>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>Upload once, then reuse these files across asif.to content.</DialogDescription>
        </DialogHeader>
        <AssetUploadPanel folderId={folderId} onUploaded={onUploaded} />
      </DialogContent>
    </Dialog>
  );
}
