import React from "react";
import { motion } from "framer-motion";
import { Hash, Loader2, Edit3, Trash2 } from "lucide-react";
import { Button, Badge, Skeleton, Card } from "@/components/ui";

const TREND_COLORS = {
  Rising: "bg-emerald-500",
  Stable: "bg-blue-500",
  Declining: "bg-amber-500",
  New: "bg-red-500",
};

export default function TopicGrid({
  loading,
  filteredTopics,
  openEdit,
  setSelectedTopic,
  setIsDeleteOpen,
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {loading ? (
        <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-zinc-300" size={32} />
          <Skeleton className="h-4 w-48 rounded-full" />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-50">
          <Hash size={48} className="text-zinc-200 dark:text-zinc-800" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
            No topics found
          </span>
        </div>
      ) : (
        filteredTopics.map((topic, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={topic._id}
          >
            <Card className="group relative p-6 md:p-8 rounded-4xl md:rounded-[2.5rem] bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all cursor-pointer overflow-hidden shadow-none">
              <div className="relative z-10 flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-3 rounded-2xl ${TREND_COLORS[topic.trend || "Stable"]} text-white shadow-sm group-hover:scale-110 transition-transform`}
                  >
                    <Hash size={20} />
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(topic);
                      }}
                      className="text-zinc-400 hover:text-emerald-500 rounded-lg h-10 w-10"
                    >
                      <Edit3 size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTopic(topic);
                        setIsDeleteOpen(true);
                      }}
                      className="text-zinc-400 hover:text-red-500 rounded-lg h-10 w-10"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <h3 className="text-xl md:text-2xl font-black font-outfit tracking-tighter text-zinc-800 dark:text-white uppercase transition-colors leading-tight">
                    {topic.name}
                  </h3>
                  <p className="text-[9px] md:text-[10px] font-medium text-zinc-500 line-clamp-2 min-h-6 md:min-h-7.5">
                    {topic.description ||
                      "No description provided for this topic."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-4 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-700">
                      Articles
                    </span>
                    <span className="text-xl font-black font-outfit text-zinc-900 dark:text-white leading-none transition-colors">
                      {topic.articlesCount || 0}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-700">
                      Trend
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-transparent border-none text-lg md:text-xl font-black font-outfit text-zinc-900 dark:text-white italic p-0 h-auto shadow-none"
                    >
                      {topic.trend || "Stable"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Decorative Background Element */}
              <div
                className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full ${TREND_COLORS[topic.trend || "Stable"]} opacity-[0.03] group-hover:opacity-[0.08] blur-3xl transition-opacity`}
              />
            </Card>
          </motion.div>
        ))
      )}
    </section>
  );
}
