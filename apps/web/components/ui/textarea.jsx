import { forwardRef } from "react";
const Textarea = forwardRef(({ className = "", ...props }, ref) => <textarea ref={ref} className={`w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 ${className}`} {...props}/>);
Textarea.displayName = "Textarea";
export { Textarea };
