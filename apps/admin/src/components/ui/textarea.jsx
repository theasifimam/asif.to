import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-24 w-full rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 shadow-none transition-[border-color,box-shadow] duration-200 outline-none placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:ring-3 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus-visible:border-blue-500 dark:focus-visible:ring-blue-500/15",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
