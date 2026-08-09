import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";














/**
 * MetricCard - Display key metrics in the Neo-Bento style
 *
 * Features:
 * - Large prominent value display
 * - Optional trend indicator
 * - Icon support
 * - Accent variant with primary glow
 */
export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = false,
  className
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-3xl p-6 transition-all duration-300 ease-out",
        "hover:-translate-y-1",
        accentColor ?
        "bg-primary text-primary-foreground" :
        "bg-card text-card-foreground",
        className
      )}
      style={{
        boxShadow: accentColor ? "var(--shadow-glow)" : "var(--shadow-card)"
      }}>
      
      {/* Decorative background blur for accent variant */}
      {accentColor &&
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
      }

      {/* Header with icon */}
      <div className="mb-4 flex items-start justify-between">
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            accentColor ?
            "text-primary-foreground/70" :
            "text-muted-foreground/80"
          )}>
          
          <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-current" />
          {title}
        </span>
        {Icon &&
        <Icon
          className={cn(
            "h-5 w-5",
            accentColor ?
            "text-primary-foreground/70" :
            "text-muted-foreground"
          )} />

        }
      </div>

      {/* Main value */}
      <div className="relative z-10 mb-2">
        <span className="text-4xl font-black tracking-tight">{value}</span>
      </div>

      {/* Subtitle and trend */}
      <div className="flex items-center justify-between">
        {subtitle &&
        <span
          className={cn(
            "text-sm",
            accentColor ?
            "text-primary-foreground/70" :
            "text-muted-foreground"
          )}>
          
            {subtitle}
          </span>
        }
        {trend &&
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            trend.isPositive ?
            accentColor ?
            "text-primary-foreground" :
            "text-green-400" :
            accentColor ?
            "text-primary-foreground" :
            "text-red-400"
          )}>
          
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        }
      </div>
    </div>);

}

export default MetricCard;