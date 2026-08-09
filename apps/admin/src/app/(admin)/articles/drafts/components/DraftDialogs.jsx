import React from "react";
import { Loader2, AlertCircle, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";

export function DraftPublishDialog({
  isOpen,
  setIsOpen,
  selectedArticle,
  handlePublish,
  submitting,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-100 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-4xl gap-8">
        <DialogHeader className="gap-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
            <Send size={32} />
          </div>
          <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Publish Article?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium leading-relaxed">
            Are you sure you want to publish{" "}
            <strong className="text-zinc-900 dark:text-white">
              "{selectedArticle?.title}"
            </strong>{" "}
            to the website?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 h-14"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-14 shadow-lg shadow-emerald-500/20"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : null}
            Publish Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DraftDeleteDialog({
  isOpen,
  setIsOpen,
  selectedArticle,
  handleDelete,
  submitting,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-100 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-4xl gap-8">
        <DialogHeader className="gap-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
            <AlertCircle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Delete Draft?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-zinc-900 dark:text-white">
              "{selectedArticle?.title}"
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 h-14"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-14 shadow-lg shadow-red-500/20"
          >
            {submitting ? (
              <Loader2 size={14} className="animate-spin mr-2" />
            ) : null}
            Delete Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
