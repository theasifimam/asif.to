import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * BentoGrid - The structural engine for the asif dashboard.
 * Uses the 24px (gap-6) spacing standard from the Neo-Bento system.
 */
export function BentoGrid({ children, className, columns = 3 }) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * BentoCard - The "Floating Object" component.
 * Features the signature 24px radius and high-contrast OKLCH backgrounds.
 */
export function BentoCard({
  children,
  className,
  span = 1,
  rowSpan = 1,
  variant = "default",
  hover = true, // Enabled by default for the asif feel
  onClick,
}) {
  const colSpan = {
    1: "col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-2 lg:col-span-3",
    4: "md:col-span-2 lg:col-span-4",
  };

  const rowSpanClass = {
    1: "row-span-1",
    2: "row-span-2",
  };

  const variants = {
    // Standard floating card
    default: "admin-surface p-6 sm:p-7",
    // Subtle primary tint for highlighted items
    accent: "rounded-3xl p-6 sm:p-7 bg-blue-50/80 text-blue-950 border border-blue-200/60 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20 shadow-xs",
    // Subdued neutral for background info
    muted: "rounded-3xl p-6 sm:p-7 bg-zinc-100/70 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400",
    // Primary highlight card
    primary: "rounded-3xl p-6 sm:p-7 bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-600",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-3xl transition-all duration-200",
        variants[variant] || variants.default,
        colSpan[span],
        rowSpanClass[rowSpan],
        hover && "hover:border-zinc-300 dark:hover:border-zinc-700",
        onClick && "cursor-pointer active:scale-[0.985]",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

/**
 * BentoCardHeader - Spacing optimized for wide metadata labels
 */
export function BentoCardHeader({ children, className }) {
  return (
    <div className={cn("mb-6 flex items-start justify-between", className)}>
      {children}
    </div>
  );
}

/**
 * BentoCardTitle - Technical metadata styling
 */
export function BentoCardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80",
        "flex items-center gap-2",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {children}
    </h3>
  );
}

export function BentoCardContent({ children, className }) {
  return <div className={cn("flex-1", className)}>{children}</div>;
}

export default BentoGrid;
