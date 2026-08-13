"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function ProfileConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant,
  loading,
  confirmText,
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
        <div className="space-y-2">
          <h3 className="text-xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 rounded-full font-black text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={variant === "destructive" ? "destructive" : "default"}
            className="flex-1 h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-md cursor-pointer"
          >
            {confirmText || "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
