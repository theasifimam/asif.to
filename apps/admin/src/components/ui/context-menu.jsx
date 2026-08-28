"use client";

import * as React from "react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function ContextMenu(props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger(props) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuContent({ className, collisionPadding = 16, ...props }) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        collisionPadding={collisionPadding}
        className={cn(
          "z-2000 min-w-48 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-1.5 text-zinc-950 shadow-[0_18px_50px_-20px_rgba(24,24,27,.35)] outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({ className, inset, variant = "default", ...props }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold outline-hidden focus:bg-zinc-100 focus:text-zinc-950 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-zinc-800 dark:focus:text-white",
        "data-[variant=destructive]:text-red-600 data-[variant=destructive]:focus:bg-red-50 data-[variant=destructive]:focus:text-red-700 dark:data-[variant=destructive]:text-red-400 dark:data-[variant=destructive]:focus:bg-red-950/40",
        "data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({ className, children, checked, ...props }) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      checked={checked}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-xl py-2 pr-3 pl-8 text-xs font-semibold outline-hidden focus:bg-zinc-100 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-zinc-800",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup(props) {
  return (
    <ContextMenuPrimitive.RadioGroup
      data-slot="context-menu-radio-group"
      {...props}
    />
  );
}

function ContextMenuRadioItem({ className, children, ...props }) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-xl py-2 pr-3 pl-8 text-xs font-semibold outline-hidden focus:bg-zinc-100 data-disabled:pointer-events-none data-disabled:opacity-50 dark:focus:bg-zinc-800",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("-mx-1 my-1 h-px bg-zinc-100 dark:bg-zinc-800", className)}
      {...props}
    />
  );
}

function ContextMenuSub(props) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({ className, children, inset, ...props }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold outline-hidden focus:bg-zinc-100 data-[state=open]:bg-zinc-100 data-inset:pl-8 dark:focus:bg-zinc-800 dark:data-[state=open]:bg-zinc-800 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto size-4 text-zinc-400" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({ className, collisionPadding = 16, ...props }) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      collisionPadding={collisionPadding}
      className={cn(
        "z-2050 min-w-40 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-1.5 text-zinc-950 shadow-[0_18px_50px_-20px_rgba(24,24,27,.4)] outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
};
