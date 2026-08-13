"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export function Select(props) { return <SelectPrimitive.Root {...props} />; }
export function SelectValue(props) { return <SelectPrimitive.Value {...props} />; }

export function SelectTrigger({ className = "", children, ...props }) {
  return <SelectPrimitive.Trigger className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-left text-sm font-bold shadow-sm outline-none transition hover:border-zinc-300 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:border-zinc-600 ${className}`} {...props}>{children}<SelectPrimitive.Icon><ChevronDown className="h-4 w-4 text-zinc-500" /></SelectPrimitive.Icon></SelectPrimitive.Trigger>;
}

export function SelectContent({ className = "", children, ...props }) {
  return <SelectPrimitive.Portal><SelectPrimitive.Content position="popper" sideOffset={6} className={`z-50 min-w-(--radix-select-trigger-width) overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 ${className}`} {...props}><SelectPrimitive.ScrollUpButton className="flex justify-center py-1"><ChevronUp className="h-4 w-4" /></SelectPrimitive.ScrollUpButton><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport><SelectPrimitive.ScrollDownButton className="flex justify-center py-1"><ChevronDown className="h-4 w-4" /></SelectPrimitive.ScrollDownButton></SelectPrimitive.Content></SelectPrimitive.Portal>;
}

export function SelectItem({ className = "", children, ...props }) {
  return <SelectPrimitive.Item className={`relative flex cursor-default select-none items-center rounded-lg py-2.5 pl-9 pr-3 text-sm font-semibold outline-none data-highlighted:bg-blue-500/10 data-highlighted:text-blue-700 dark:data-highlighted:text-blue-300 ${className}`} {...props}><span className="absolute left-3"><SelectPrimitive.ItemIndicator><Check className="h-4 w-4 text-blue-500" /></SelectPrimitive.ItemIndicator></span><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText></SelectPrimitive.Item>;
}
