import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 shadow-xs transition-all outline-none placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-blue-500 dark:focus-visible:ring-blue-500/30 dark:[color-scheme:dark]",
          error && "border-red-500 ring-2 ring-red-500/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };