"use client";
import { forwardRef } from "react";
const Button = forwardRef(({ className = "", variant = "default", ...props }, ref) => <button ref={ref} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 ${variant === "outline" ? "border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" : variant === "ghost" ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800" : "bg-blue-600 text-white shadow-sm hover:bg-blue-700"} ${className}`} {...props}/>);
Button.displayName = "Button";
export { Button };
