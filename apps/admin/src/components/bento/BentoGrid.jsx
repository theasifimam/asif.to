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
    // Standard dark floating card
    default: "bg-card text-card-foreground shadow-card",
    // Subtle lime tint for secondary items
    accent: "bg-primary/10 text-foreground border border-primary/20",
    // Subdued for background info
    muted: "bg-muted/30 text-muted-foreground",
    // High-impact Neo Volt card
    neon: "bg-primary text-primary-foreground accent-glow shadow-glow",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden",
        "rounded-3xl p-6 transition-smooth",
        variants[variant],
        colSpan[span],
        rowSpanClass[rowSpan],
        hover && "hover:-translate-y-1 hover:shadow-elevated",
        onClick && "cursor-pointer active:scale-[0.98]",
        className,
      )}
      onClick={onClick}
    >
      {/* Decorative background blur for Neon variant */}
      {variant === "neon" && (
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
      )}

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
