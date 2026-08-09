import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, BarChart3, Edit3, Trash2, ArrowUpRight, FileText, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button, Badge } from "@/components/ui";

export default function ArticleListView({
  articles,
  getImageUrl,
  togglingId,
  handleToggleStatus,
  setSelectedArticle,
  setIsDeleteOpen
}) {
  return (
    <section className="flex flex-col bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
      <AnimatePresence>
        {articles.map((item, i) => {
          const isVisibleOnWeb = item.status === 'published';
          const imgUrl = getImageUrl(item.image);
          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: i * 0.03 }}
              key={item._id}
              className={`group p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer relative overflow-hidden ${
                i === 0 ? 'rounded-t-[2.5rem]' : ''
              } ${i === articles.length - 1 ? 'rounded-b-[2.5rem]' : ''}`}
            >
              
              <div className={`absolute inset-0 transition-opacity ${isVisibleOnWeb ? 'bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100' : 'bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100'}`} />

              <div className="flex items-center gap-6 relative z-10 min-w-0">
                <span className="text-lg font-black italic text-zinc-400 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors w-10 shrink-0">
                  {(i + 1).toString().padStart(3, '0')}
                </span>

                {imgUrl ? (
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 group-hover:scale-105 transition-transform">
                    <img src={imgUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    <FileText size={20} className="text-zinc-400" />
                  </div>
                )}

                <div className="flex flex-col gap-2 min-w-0">
                  <h2 className="text-lg md:text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                    {item.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <span className="text-zinc-700 dark:text-zinc-400 font-black">{item.author?.fullName || 'Anonymous'}</span>
                    <span>&bull;</span>
                    <span>{formatDistanceToNow(new Date(item.createdAt || Date.now()))} ago</span>
                    {item.topic && item.topic.length > 0 && (
                      <>
                        <span>&bull;</span>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-black uppercase text-[9px] px-2.5 py-0.5">
                          {item.topic[0]?.name || 'Topic'}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 relative z-10 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-col items-end gap-0.5 pr-4 border-r border-zinc-200 dark:border-zinc-800">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Views</span>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 size={14} className="text-emerald-500" />
                    <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white italic">
                      {item.readCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    disabled={togglingId === item._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(item);
                    }}
                    className={`rounded-full px-4 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all border flex items-center gap-2 ${
                      isVisibleOnWeb
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:bg-amber-500/10 hover:text-amber-600 hover:border-amber-500/30'
                    }`}
                    title={isVisibleOnWeb ? "Article is Visible on website. Click to hide." : "Article is Hidden from website. Click to show."}>
                    {togglingId === item._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : isVisibleOnWeb ? (
                      <Eye size={13} className="text-emerald-500" />
                    ) : (
                      <EyeOff size={13} className="text-amber-500" />
                    )}
                    <span>{isVisibleOnWeb ? 'Visible on Web' : 'Hidden from Web'}</span>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-11 w-11 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-500 hover:text-emerald-600 bg-white dark:bg-zinc-950">
                    <Link href={`/articles/edit/${item._id}`} title="Edit Article">
                      <Edit3 size={16} />
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArticle(item);
                      setIsDeleteOpen(true);
                    }}
                    className="rounded-full h-11 w-11 border border-zinc-200 dark:border-zinc-800 hover:border-red-400 text-zinc-500 hover:text-red-500 bg-white dark:bg-zinc-950"
                    title="Delete Article">
                    <Trash2 size={16} />
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-11 w-11 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-950">
                    <Link
                      href={`http://localhost:3000/articles/${item._id}`}
                      target="_blank"
                      title="View Article on Website">
                      <ArrowUpRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
