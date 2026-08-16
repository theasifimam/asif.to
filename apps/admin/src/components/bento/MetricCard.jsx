import { cn } from "@/lib/utils";

export const BENTO_METRIC_THEMES = {
  sky: {
    card: "bg-sky-50/75 dark:bg-[#0c1524] border-sky-200/70 dark:border-sky-900/40",
    borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    iconContainer:
      "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
    trendBadge:
      "bg-sky-100/90 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200 border border-sky-200/80 dark:border-sky-500/30",
  },
  emerald: {
    card: "bg-emerald-50/75 dark:bg-[#0a1a14] border-emerald-200/70 dark:border-emerald-900/40",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/60",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    iconContainer:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30",
    trendBadge:
      "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-500/30",
  },
  amber: {
    card: "bg-amber-50/75 dark:bg-[#1c140a] border-amber-200/70 dark:border-amber-900/40",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-600/60",
    glow: "from-amber-400/20 via-amber-400/5 to-transparent",
    iconContainer:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
    trendBadge:
      "bg-amber-100/90 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 border border-amber-200/80 dark:border-amber-500/30",
  },
  purple: {
    card: "bg-purple-50/75 dark:bg-[#160d24] border-purple-200/70 dark:border-purple-900/40",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-600/60",
    glow: "from-purple-400/20 via-purple-400/5 to-transparent",
    iconContainer:
      "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30",
    trendBadge:
      "bg-purple-100/90 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30",
  },
  indigo: {
    card: "bg-indigo-50/75 dark:bg-[#12132b] border-indigo-200/70 dark:border-indigo-900/40",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-600/60",
    glow: "from-indigo-400/20 via-indigo-400/5 to-transparent",
    iconContainer:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30",
    trendBadge:
      "bg-indigo-100/90 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-500/30",
  },
  rose: {
    card: "bg-rose-50/75 dark:bg-[#1a0c14] border-rose-200/70 dark:border-rose-900/40",
    borderHover: "hover:border-rose-300 dark:hover:border-rose-600/60",
    glow: "from-rose-400/20 via-rose-400/5 to-transparent",
    iconContainer:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30",
    trendBadge:
      "bg-rose-100/90 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200 border border-rose-200/80 dark:border-rose-500/30",
  },
  teal: {
    card: "bg-teal-50/75 dark:bg-[#091b1a] border-teal-200/70 dark:border-teal-900/40",
    borderHover: "hover:border-teal-300 dark:hover:border-teal-600/60",
    glow: "from-teal-400/20 via-teal-400/5 to-transparent",
    iconContainer:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/30",
    trendBadge:
      "bg-teal-100/90 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200 border border-teal-200/80 dark:border-teal-500/30",
  },
  neutral: {
    card: "bg-white dark:bg-zinc-900/90 border-zinc-200/80 dark:border-zinc-800",
    borderHover: "hover:border-zinc-300 dark:hover:border-zinc-700",
    glow: "from-blue-400/10 via-blue-400/5 to-transparent",
    iconContainer:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80",
    trendBadge:
      "bg-zinc-100/90 text-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone = "sky",
  accentColor = false,
  className,
}) {
  const theme = BENTO_METRIC_THEMES[tone] || BENTO_METRIC_THEMES.sky;

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 transition-all duration-300 rounded-[28px] sm:rounded-4xl border shadow-xs hover:-translate-y-0.5 hover:shadow-md",
        accentColor
          ? "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-600 shadow-lg shadow-blue-600/20"
          : `${theme.card} ${theme.borderHover}`,
        className,
      )}
    >
      {/* Corner Ambient Glow */}
      {!accentColor && (
        <div
          className={`pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-linear-to-br ${theme.glow} blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
        />
      )}

      {/* Top row: Label + Circular Icon Container */}
      <div className="relative z-10 mb-4 flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em]",
            accentColor
              ? "text-blue-100"
              : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full shadow-2xs transition-colors",
              accentColor
                ? "bg-white/20 text-white"
                : theme.iconContainer,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Main Value Display */}
      <div className="relative z-10 mb-2">
        <span
          className={cn(
            "text-3xl sm:text-4xl font-black font-outfit tracking-tight",
            accentColor ? "text-white" : "text-zinc-950 dark:text-white",
          )}
        >
          {value}
        </span>
      </div>

      {/* Bottom row: Subtitle & Trend badge */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-1">
        {subtitle && (
          <span
            className={cn(
              "text-xs font-medium",
              accentColor
                ? "text-blue-100"
                : "text-zinc-500 dark:text-zinc-400",
            )}
          >
            {subtitle}
          </span>
        )}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold shadow-2xs",
              trend.isPositive
                ? accentColor
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30"
                : accentColor
                  ? "bg-white/20 text-white"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200/80 dark:border-rose-500/30",
            )}
          >
            <span>{trend.isPositive ? "↑" : "↓"}</span>
            <span>{trend.value}%</span>
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
