import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AdminPage({ children, className, size = "xl" }) {
  return (
    <div
      className={cn(
        "mx-auto min-w-0 space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-10 lg:py-10",
        size === "lg" ? "max-w-6xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  back,
  actions,
  className,
  stickyActions = true,
}) {
  return (
    <header className={cn("flex min-w-0 flex-col gap-4", className)}>
      <div className="min-w-0 w-full">
        {back}
        {eyebrow && (
          <p
            className={cn(
              "text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400",
              back && "mt-3.5",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 wrap-break-word font-outfit text-2xl font-black tracking-[-0.035em] text-zinc-950 dark:text-white sm:text-3xl lg:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-xs sm:text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div
          className={cn(
            "flex flex-wrap items-stretch sm:items-center justify-start sm:justify-end gap-2.5 w-full *:grow sm:*:grow-0",
            stickyActions &&
              "sticky top-16 z-30 py-2.5 -my-1.5 bg-[#f3f4f6]/90 dark:bg-[#09090b]/90 backdrop-blur-xl transition-all border-b border-zinc-200/50 dark:border-zinc-800/50",
          )}
        >
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
        "admin-surface flex min-w-0 flex-col gap-3 p-3.5 sm:p-4 md:flex-row md:items-center rounded-[28px] sm:rounded-4xl",
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
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value, event)}
        placeholder={placeholder}
        className="rounded-full border border-zinc-200/80 bg-zinc-50/80 pl-10 text-xs sm:text-sm shadow-none focus-visible:bg-white dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus-visible:bg-zinc-900"
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
    <section
      className={cn(
        "admin-surface min-w-0 overflow-hidden rounded-[28px] sm:rounded-4xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function AdminLoading({ label = "Loading…", className }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-16 text-xs sm:text-sm font-semibold text-zinc-500",
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
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="font-bold text-zinc-900 dark:text-zinc-100">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-md text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function getPageRange(currentPage, totalPages) {
  const range = [];
  const delta = 2;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  const result = [];
  let l;

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        result.push(l + 1);
      } else if (i - l > 2) {
        result.push("...");
      }
    }
    result.push(i);
    l = i;
  }

  return result;
}

export function AdminPagination({
  page = 1,
  pages = 1,
  total,
  limit = 10,
  onLimitChange,
  itemLabel = "items",
  onPageChange,
  className,
}) {
  const safePages = Math.max(Number(pages) || 1, 1);
  const safePage = Math.min(Math.max(Number(page) || 1, 1), safePages);
  const pageNumbers = getPageRange(safePage, safePages);

  return (
    <footer
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 px-4 py-3.5 text-xs text-zinc-500 dark:border-zinc-800/80 sm:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-4.5 flex-wrap">
        <span className="font-semibold text-zinc-500 dark:text-zinc-400">
          {typeof total === "number"
            ? `${total} ${itemLabel}`
            : `Page ${safePage} of ${safePages}`}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 dark:text-zinc-500 font-medium">Rows per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-8 w-16 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <SelectValue placeholder={String(limit)} />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          className="h-8 w-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((num, idx) => {
            if (num === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-8 w-8 items-center justify-center text-zinc-400 font-semibold"
                >
                  ...
                </span>
              );
            }
            const active = num === safePage;
            return (
              <Button
                key={num}
                variant={active ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(num)}
                className={cn(
                  "h-8 w-8 rounded-xl text-xs font-bold transition-all",
                  active
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                )}
              >
                {num}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          className="h-8 w-8 rounded-xl border border-zinc-200/80 dark:border-zinc-800"
          disabled={safePage >= safePages}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </footer>
  );
}
