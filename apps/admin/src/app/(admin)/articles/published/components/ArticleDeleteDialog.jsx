import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import { AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui";

export default function ArticleDeleteDialog({
  isOpen,
  setIsOpen,
  selectedArticle,
  submitting,
  handleDelete,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-100 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-4xl gap-8">
        <DialogHeader className="gap-4">
          <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
            <AlertCircle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Delete Article?
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
              <LogoLoader size={14} className=" mr-2"  />
            ) : null}
            Delete Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
