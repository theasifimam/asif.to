import { TrendingDown, TrendingUp } from "lucide-react";

export default function MetricCard({ label, value, source, change }) {
  return (
    <div className="admin-surface flex min-h-36 flex-col justify-between p-5 rounded-3xl transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          {label}
        </p>
        {source && (
          <span className="rounded-full border border-zinc-200/80 bg-zinc-50/80 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:text-zinc-400">
            {source}
          </span>
        )}
      </div>
      <p className="my-2 text-2xl sm:text-3xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>
      {Number.isFinite(change) ? (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              change >= 0
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            }`}
          >
            {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </span>
        </div>
      ) : (
        <div className="h-4" />
      )}
    </div>
  );
}
