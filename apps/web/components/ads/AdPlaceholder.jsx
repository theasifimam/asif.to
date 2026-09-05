import { cn } from "@/lib/utils";

export default function AdPlaceholder({ placement, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex min-h-24 w-full items-center justify-center rounded-2xl border border-dashed border-zinc-300/80 bg-zinc-100/60 px-4 py-3 text-center dark:border-zinc-700/80 dark:bg-zinc-900/60",
        className,
      )}
      data-ad-placement={placement || undefined}
    >
      <div className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        <div>Advertisement</div>
        {placement ? <div>{placement}</div> : null}
      </div>
    </div>
  );
}
