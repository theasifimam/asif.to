import { TrendingDown, TrendingUp } from "lucide-react";

export const METRIC_THEMES = {
  sky: {
    card: "bg-sky-50/75 dark:bg-[#0c1524] border-sky-200/70 dark:border-sky-900/40",
    borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    badge: "bg-sky-100/90 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200 border border-sky-200/80 dark:border-sky-500/30",
  },
  emerald: {
    card: "bg-emerald-50/75 dark:bg-[#0a1a14] border-emerald-200/70 dark:border-emerald-900/40",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/60",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    badge: "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-500/30",
  },
  amber: {
    card: "bg-amber-50/75 dark:bg-[#1c140a] border-amber-200/70 dark:border-amber-900/40",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-600/60",
    glow: "from-amber-400/20 via-amber-400/5 to-transparent",
    badge: "bg-amber-100/90 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 border border-amber-200/80 dark:border-amber-500/30",
  },
  purple: {
    card: "bg-purple-50/75 dark:bg-[#160d24] border-purple-200/70 dark:border-purple-900/40",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-600/60",
    glow: "from-purple-400/20 via-purple-400/5 to-transparent",
    badge: "bg-purple-100/90 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30",
  },
  indigo: {
    card: "bg-indigo-50/75 dark:bg-[#12132b] border-indigo-200/70 dark:border-indigo-900/40",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-600/60",
    glow: "from-indigo-400/20 via-indigo-400/5 to-transparent",
    badge: "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-500/30",
  },
  rose: {
    card: "bg-rose-50/75 dark:bg-[#1a0c14] border-rose-200/70 dark:border-rose-900/40",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-600/60",
    glow: "from-rose-400/20 via-rose-400/5 to-transparent",
    badge: "bg-rose-100/90 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200 border border-rose-200/80 dark:border-rose-500/30",
  },
  teal: {
    card: "bg-teal-50/75 dark:bg-[#091b1a] border-teal-200/70 dark:border-teal-900/40",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-600/60",
    glow: "from-teal-400/20 via-teal-400/5 to-transparent",
    badge: "bg-teal-100/90 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200 border border-teal-200/80 dark:border-teal-500/30",
  },
};

export default function MetricCard({ label, value, source, change, tone = "sky" }) {
  const theme = METRIC_THEMES[tone] || METRIC_THEMES.sky;

  return (
    <div
      className={`group relative flex min-h-36 flex-col justify-between overflow-hidden p-5 rounded-3xl border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${theme.card} ${theme.borderHover}`}
    >
      {/* Ultra-minimal ambient corner glow */}
      <div
        className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-linear-to-br ${theme.glow} blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-70`}
      />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
          {label}
        </p>
        {source && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-2xs ${theme.badge}`}
          >
            {source}
          </span>
        )}
      </div>

      <p className="relative z-10 my-2 text-2xl sm:text-3xl font-black font-outfit tracking-tight text-zinc-950 dark:text-white">
        {value}
      </p>

      <div className="relative z-10">
        {Number.isFinite(change) ? (
          <div className="flex items-center">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                change >= 0
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"
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
    </div>
  );
}
