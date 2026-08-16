import { forwardRef } from "react";
const Input = forwardRef(({ className = "", ...props }, ref) => <input ref={ref} className={`h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none placeholder:text-zinc-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 ${className}`} {...props}/>);
Input.displayName = "Input";
export { Input };
