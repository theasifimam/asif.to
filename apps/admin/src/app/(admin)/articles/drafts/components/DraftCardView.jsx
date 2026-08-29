import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileEdit, Trash2, Clock, FileText, Send, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button, Card } from "@/components/ui";

export default function DraftCardView({
  drafts,
  getImageUrl,
  togglingId,
  handleToggleStatus,
  setSelectedArticle,
  setIsPublishOpen,
  setIsDeleteOpen,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence>
        {drafts.map((draft, i) => {
          const imgUrl = getImageUrl(draft.image);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              key={draft._id}
            >
              <Card className="group p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all flex flex-col gap-8 relative overflow-hidden shadow-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black italic text-zinc-500 dark:text-zinc-700 tracking-tighter">
                    DRAFT #{(i + 1).toString().padStart(3, "0")}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                      title="Edit Draft"
                    >
                      <Link href={`/articles/edit/${draft._id}`}>
                        <FileEdit size={16} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedArticle(draft);
                        setIsPublishOpen(true);
                      }}
                      className="h-9 w-9 text-zinc-500 hover:text-emerald-600"
                      title="Publish Article"
                    >
                      <Send size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedArticle(draft);
                        setIsDeleteOpen(true);
                      }}
                      className="h-9 w-9 text-zinc-500 hover:text-red-600"
                      title="Delete Draft"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                {/* Image Thumb */}
                {imgUrl ? (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                    <img
                      src={imgUrl}
                      alt={draft.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400">
                    <FileText size={32} />
                  </div>
                )}

                {/* Content */}
                <div className="flex flex-col gap-3">
                  <h3 className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors leading-tight line-clamp-2">
                    {draft.title}
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span className="truncate max-w-30">
                      {draft.author?.fullName || "Anonymous"}
                    </span>
                    <span>&bull;</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(
                        new Date(draft.updatedAt || Date.now()),
                      )}{" "}
                      ago
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-6 gap-4">
                  {/* Status Button Toggle */}
                  <Button
                    variant="outline"
                    disabled={togglingId === draft._id}
                    onClick={() => handleToggleStatus(draft)}
                    className="rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 flex items-center gap-1.5"
                    title="Draft is hidden from website. Click to publish."
                  >
                    {togglingId === draft._id ? (
                      <LogoLoader size={12} className=""  />
                    ) : (
                      <EyeOff size={12} />
                    )}
                    <span>Hidden from Web</span>
                  </Button>

                  <Button
                    onClick={() => {
                      setSelectedArticle(draft);
                      setIsPublishOpen(true);
                    }}
                    className="rounded-full px-5 py-2 text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Send size={12} />
                    <span>Publish</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
