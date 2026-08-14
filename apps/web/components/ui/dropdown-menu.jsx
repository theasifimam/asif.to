"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSeparator = ({ className = "", ...props }) => (
  <DropdownMenuPrimitive.Separator
    className={`-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-700 ${className}`}
    {...props}
  />
);
export const DropdownMenuLabel = ({ className = "", ...props }) => (
  <DropdownMenuPrimitive.Label
    className={`px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ${className}`}
    {...props}
  />
);
export const DropdownMenuContent = ({
  className = "",
  sideOffset = 6,
  container,
  ...props
}) => {
  const portalContainer =
    container !== undefined
      ? container
      : typeof document !== "undefined"
        ? document.fullscreenElement || undefined
        : undefined;

  return (
    <DropdownMenuPrimitive.Portal container={portalContainer}>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        align="end"
        className={`z-100 min-w-56 rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};
export const DropdownMenuItem = ({ className = "", inset, ...props }) => (
  <DropdownMenuPrimitive.Item
    className={`flex cursor-default select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold outline-none transition data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-blue-600 data-highlighted:text-white dark:data-highlighted:bg-blue-600 dark:data-highlighted:text-white ${
      className.includes("text-") ? "" : "text-zinc-800 dark:text-zinc-200"
    } ${inset ? "pl-8" : ""} ${className}`}
    {...props}
  />
);
export const DropdownMenuCheckboxItem = ({
  className = "",
  children,
  checked,
  ...props
}) => (
  <DropdownMenuPrimitive.CheckboxItem
    checked={checked}
    className={`relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-2 text-xs font-semibold text-zinc-800 outline-none data-highlighted:bg-blue-600 data-highlighted:text-white dark:text-zinc-200 ${className}`}
    {...props}
  >
    <span className="absolute left-2.5">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-3.5 w-3.5" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
);
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuSubTrigger = ({ children, ...props }) => (
  <DropdownMenuPrimitive.SubTrigger
    className="flex cursor-default items-center rounded-lg px-2.5 py-2 text-xs font-semibold text-zinc-800 outline-none data-highlighted:bg-blue-600 data-highlighted:text-white dark:text-zinc-200"
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-3.5 w-3.5" />
  </DropdownMenuPrimitive.SubTrigger>
);
export const DropdownMenuSubContent = ({
  className = "",
  container,
  ...props
}) => {
  const portalContainer =
    container !== undefined
      ? container
      : typeof document !== "undefined"
        ? document.fullscreenElement || undefined
        : undefined;

  return (
    <DropdownMenuPrimitive.Portal container={portalContainer}>
      <DropdownMenuPrimitive.SubContent
        className={`z-100 min-w-40 rounded-xl border border-zinc-200 bg-white p-1.5 text-zinc-900 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ${className}`}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
};
