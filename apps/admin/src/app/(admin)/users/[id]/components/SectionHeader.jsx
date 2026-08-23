"use client";

export default function SectionHeader({ title }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
        {title}
      </h2>
      <div className="h-px w-full bg-zinc-200/80 dark:bg-zinc-800/80" />
    </div>
  );
}
