import { cn } from "@/lib/utils";

/**
 * MetricCard - Modern Bento Metric Card inspired by reference SaaS dashboard
 *
 * Features:
 * - Bold numerical typography (Outfit)
 * - Circular icon container
 * - Soft trend indicator pill
 * - Clean uppercase tracked labels
 * - 24px-28px rounded geometry with subtle border & diffuse shadow
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone = "primary",
  accentColor = false,
  className,
}) {
  return (
    <div
      className={cn(
        "admin-surface relative flex flex-col justify-between overflow-hidden p-6 sm:p-7 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700",
        accentColor &&
          "bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:text-white dark:border-blue-600 shadow-lg shadow-blue-600/20",
        className,
      )}
    >
      {/* Top row: Label + Circular Icon Container */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em]",
            accentColor
              ? "text-blue-100"
              : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          {title}
        </span>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-colors",
              accentColor
                ? "bg-white/20 text-white"
                : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
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
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold",
              trend.isPositive
                ? accentColor
                  ? "bg-white/20 text-white"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                : accentColor
                  ? "bg-white/20 text-white"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
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
