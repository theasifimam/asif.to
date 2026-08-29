import LogoLoader from "@/components/ui/LogoLoader";
import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, BarChart3, Edit3, Trash2, ArrowUpRight, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button, Badge, Card } from "@/components/ui";

export default function ArticleCardView({
  articles,
  getImageUrl,
  togglingId,
  handleToggleStatus,
  setSelectedArticle,
  setIsDeleteOpen,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence>
        {articles.map((item, i) => {
          const isVisibleOnWeb = item.status === "published";
          const imgUrl = getImageUrl(item.image);
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              key={item._id}
            >
              <Card className="group rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 flex flex-col gap-6 p-6 relative overflow-hidden shadow-none hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5">
                {/* Main Image Header */}
                <div className="relative w-full aspect-16/10 rounded-4xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                      <FileText size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        No Image Attached
                      </span>
                    </div>
                  )}

                  {/* Status Overlay Badge on Image */}
                  <div className="absolute top-4 right-4 z-10">
                    <Button
                      variant="outline"
                      disabled={togglingId === item._id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(item);
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all border backdrop-blur-md flex items-center gap-1.5 shadow-lg ${
                        isVisibleOnWeb
                          ? "bg-emerald-500/90 text-white border-emerald-400 hover:bg-emerald-600"
                          : "bg-zinc-900/90 text-amber-400 border-amber-500/50 hover:bg-zinc-900"
                      }`}
                    >
                      {togglingId === item._id ? (
                        <LogoLoader size={12} className=""  />
                      ) : isVisibleOnWeb ? (
                        <Eye size={12} />
                      ) : (
                        <EyeOff size={12} />
                      )}
                      <span>{isVisibleOnWeb ? "Visible" : "Hidden"}</span>
                    </Button>
                  </div>

                  {/* Views count overlay */}
                  <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-black tracking-wider flex items-center gap-1.5">
                    <BarChart3 size={12} className="text-emerald-400" />
                    <span>{item.readCount?.toLocaleString() || 0} views</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="flex flex-col gap-3 px-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <span className="text-zinc-800 dark:text-zinc-300 font-black truncate max-w-[150px]">
                      {item.author?.fullName || "Anonymous"}
                    </span>
                    <span>
                      {formatDistanceToNow(
                        new Date(item.createdAt || Date.now()),
                      )}{" "}
                      ago
                    </span>
                  </div>

                  <h3 className="text-xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  {item.topic && item.topic.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.topic.map((t) => (
                        <Badge
                          key={t._id || t}
                          variant="outline"
                          className="px-2.5 py-0.5 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 rounded-full text-[9px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-700"
                        >
                          {t.name || t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-auto border-t border-zinc-100 dark:border-zinc-800/80 pt-4 px-2 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    disabled={togglingId === item._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(item);
                    }}
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider h-10 border flex items-center justify-center gap-2 transition-all ${
                      isVisibleOnWeb
                        ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                        : "border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-amber-500/10 hover:text-amber-600"
                    }`}
                  >
                    {togglingId === item._id ? (
                      <LogoLoader size={12} className=""  />
                    ) : isVisibleOnWeb ? (
                      <Eye size={12} />
                    ) : (
                      <EyeOff size={12} />
                    )}
                    <span>
                      {isVisibleOnWeb ? "Hide from Web" : "Show on Web"}
                    </span>
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Edit Article"
                    >
                      <Link href={`/articles/edit/${item._id}`}>
                        <Edit3 size={16} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedArticle(item);
                        setIsDeleteOpen(true);
                      }}
                      className="h-10 w-10 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Delete Article"
                    >
                      <Trash2 size={16} />
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="View Article on Website"
                    >
                      <Link
                        href={`http://localhost:3000/articles/${item._id}`}
                        target="_blank"
                      >
                        <ArrowUpRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </section>
  );
}
