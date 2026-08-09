import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button, Input, Textarea } from "@/components/ui";

export function TopicDialog({ isOpen, setIsOpen, title, onConfirm, submitting, form }) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[480px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 rounded-[40px] gap-8">
        <DialogHeader className="gap-2">
          <DialogTitle className="text-3xl font-black font-outfit uppercase tracking-tighter">{title}</DialogTitle>
          <DialogDescription className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
            Configure topic details and trend.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Topic Name</label>
            <Input
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
              placeholder="e.g. TECHNOLOGY"
              className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors h-14" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => form.setDescription(e.target.value)}
              placeholder="Write a short description..."
              className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-zinc-400 h-32 resize-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Topic Trend</label>
            <div className="grid grid-cols-2 gap-2">
              {['Rising', 'Stable', 'Declining', 'New'].map((t) =>
                <Button
                  key={t}
                  type="button"
                  variant={form.trend === t ? 'default' : 'outline'}
                  onClick={() => form.setTrend(t)}
                  className={`rounded-xl text-[10px] font-black uppercase tracking-widest transition-all h-12 shadow-none ${form.trend === t ? '' : 'text-zinc-400'}`}>
                  {t}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full py-8 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-black/10 transition-all">
            {submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Save Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TopicDeleteDialog({
  isOpen,
  setIsOpen,
  selectedTopic,
  handleDelete,
  submitting
}) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[400px] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 rounded-[32px] gap-8">
        <DialogHeader className="gap-4">
          <div className="w-16 h-16 rounded-[24px] bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
            <AlertCircle size={32} />
          </div>
          <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Delete Topic?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-[13px] font-medium leading-relaxed">
            Are you sure you want to delete <strong className="text-zinc-900 dark:text-white">"{selectedTopic?.name}"</strong>? This will remove it from all articles using it.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="flex-1 rounded-2xl text-[11px] font-black uppercase tracking-widest text-zinc-500 h-14">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest transition-all h-14 shadow-lg shadow-red-500/20">
            {submitting ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
            Delete Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
