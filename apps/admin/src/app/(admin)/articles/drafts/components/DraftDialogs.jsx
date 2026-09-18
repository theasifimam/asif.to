import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import { AlertCircle, Send } from "lucide-react";
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
      <DialogContent variant="island" className="p-6 sm:p-8 sm:max-w-[440px] rounded-[2rem] gap-6 sm:gap-8">
        <DialogHeader className="items-center text-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-1">
            <Send size={28} />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Publish Article?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-[13px] font-medium leading-relaxed">
            Are you sure you want to publish{" "}
            <strong className="text-zinc-900 dark:text-white">
              &ldquo;{selectedArticle?.title}&rdquo;
            </strong>{" "}
            to the website?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full sm:flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 h-12 sm:h-14 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={submitting}
            className="w-full sm:flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-12 sm:h-14 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {submitting ? (
              <LogoLoader size={14} className=" mr-2"  />
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
      <DialogContent variant="island" className="p-6 sm:p-8 sm:max-w-[440px] rounded-[2rem] gap-6 sm:gap-8">
        <DialogHeader className="items-center text-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-1">
            <AlertCircle size={28} />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Delete Draft?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-[13px] font-medium leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-zinc-900 dark:text-white">
              &ldquo;{selectedArticle?.title}&rdquo;
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="w-full sm:flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 h-12 sm:h-14 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
            className="w-full sm:flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-12 sm:h-14 shadow-lg shadow-red-500/20 cursor-pointer"
          >
            {submitting ? (
              <LogoLoader size={14} className=" mr-2"  />
            ) : null}
            Delete Draft
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
