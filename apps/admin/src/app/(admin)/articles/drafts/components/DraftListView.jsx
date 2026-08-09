import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FileEdit, Trash2, FileText, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button, Badge } from "@/components/ui";

export default function DraftListView({
  drafts,
  getImageUrl,
  setSelectedArticle,
  setIsPublishOpen,
  setIsDeleteOpen
}) {
  return (
    <section className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-900 border-y border-zinc-200 dark:border-zinc-900">
      <AnimatePresence>
        {drafts.map((draft, i) => {
          const imgUrl = getImageUrl(draft.image);
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: i * 0.03 }}
              key={draft._id}
              className="group py-6 flex items-center justify-between gap-6 hover:px-6 transition-all rounded-3xl cursor-pointer">
              <div className="flex items-center gap-6 min-w-0">
                <span className="text-lg font-black italic text-zinc-400 dark:text-zinc-700 w-8 shrink-0">
                  {(i + 1).toString().padStart(2, '0')}
                </span>

                {imgUrl ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                    <img src={imgUrl} alt={draft.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <FileText size={18} className="text-zinc-400" />
                  </div>
                )}

                <div className="flex flex-col gap-1 min-w-0">
                  <h3 className="text-lg font-black font-outfit uppercase tracking-tighter text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                    {draft.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <span>{draft.author?.fullName || 'Anonymous'}</span>
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(draft.updatedAt || Date.now()))} ago</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase px-3 py-1">
                  Hidden from Web
                </Badge>
                <Button
                  onClick={() => { setSelectedArticle(draft); setIsPublishOpen(true); }}
                  className="rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                  <Send size={12} />
                  Publish
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 border border-zinc-200 dark:border-zinc-800"
                  title="Edit Draft">
                  <Link href={`/articles/edit/${draft._id}`}>
                    <FileEdit size={16} />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setSelectedArticle(draft); setIsDeleteOpen(true); }}
                  className="rounded-full h-10 w-10 border border-zinc-200 dark:border-zinc-800 hover:text-red-500"
                  title="Delete Draft">
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
