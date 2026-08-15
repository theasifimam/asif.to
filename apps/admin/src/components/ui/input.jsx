import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-zinc-200/90 bg-white px-4 py-2 text-sm text-zinc-900 shadow-none transition-[border-color,box-shadow,background-color] duration-200 outline-none placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-blue-500 dark:focus-visible:ring-blue-500/15 dark:disabled:bg-zinc-900/60 dark:[color-scheme:dark]",
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
