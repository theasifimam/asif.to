import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AdminPage({ children, className, size = "xl" }) {
  return (
    <main
      className={cn(
        "mx-auto min-w-0 space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8",
        size === "lg" ? "max-w-6xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </main>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  back,
  actions,
}) {
  return (
    <header className="flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="min-w-0">
        {back}
        {eyebrow && (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.18em] text-blue-600",
              back && "mt-4",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 wrap-break-word text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="grid grid-cols-1 gap-2 xs:flex xs:flex-wrap [&_button]:w-full xs:[&_button]:w-auto [&_a]:w-full xs:[&_a]:w-auto">
          {actions}
        </div>
      )}
    </header>
  );
}

export function AdminFilters({ children, className }) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-4xl border border-zinc-200/60 bg-white px-3 py-4 dark:border-zinc-800/60 dark:bg-zinc-950 sm:p-5 md:flex-row",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ...props
}) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value, event)}
        placeholder={placeholder}
        className="rounded-2xl bg-zinc-100 pl-9 dark:bg-zinc-900"
        {...props}
      />
    </div>
  );
}

export function AdminContent({
  children,
  className,
  plain = false,
  variant = "default",
}) {
  if (plain || variant === "plain") {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }
  return (
    <section className={cn("min-w-0 overflow-hidden rounded-4xl", className)}>
      {children}
    </section>
  );
}

export function AdminLoading({ label = "Loading…", className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-16 text-sm text-zinc-500",
        className,
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-5 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <Icon className="mb-3 h-8 w-8 text-zinc-300 dark:text-zinc-700" />
      )}
      <p className="font-semibold text-zinc-700 dark:text-zinc-300">{title}</p>
      {description && (
        <p className="mt-1 max-w-md text-sm text-zinc-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AdminPagination({
  page = 1,
  pages = 1,
  total,
  itemLabel = "items",
  onPageChange,
  className,
}) {
  const safePages = Math.max(Number(pages) || 1, 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), safePages);
  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200/60 px-3 py-4 text-xs text-zinc-500 dark:border-zinc-800/60 sm:px-5 sm:text-sm",
        className,
      )}
    >
      <span>
        {typeof total === "number"
          ? `${total} ${itemLabel}`
          : `Page ${safePage} of ${safePages}`}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-14 text-center tabular-nums">
          {safePage} / {safePages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={safePage >= safePages}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </footer>
  );
}
