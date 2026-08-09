import React from "react";
import { Plus, Search } from "lucide-react";
import { Button, Input } from "@/components/ui";

export default function TopicHeader({
  search,
  setSearch,
  resetForm,
  setIsAddOpen,
}) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2 md:mt-0">
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <span className="w-8 md:w-12 h-1px bg-zinc-400 dark:bg-zinc-800"></span>
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
            Topics Manager
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
          Topics.
        </h1>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative group w-full sm:w-auto">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-zinc-600 transition-colors z-10"
            size={14}
          />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-full py-3 md:py-4 pl-10 md:pl-12 pr-6 text-[11px] font-bold w-full sm:w-48 md:w-64 h-11 md:h-14"
          />
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
          className="rounded-full w-full sm:w-auto px-6 md:px-8 h-11 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs shadow-xl shadow-black/10 dark:shadow-white/5"
        >
          <Plus size={16} className="mr-2" />
          Create Topic
        </Button>
      </div>
    </section>
  );
}
