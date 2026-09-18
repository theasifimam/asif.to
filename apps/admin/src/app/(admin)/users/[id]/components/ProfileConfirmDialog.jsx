"use client";

import React, { useState } from "react";
import { Button, Input } from "@/components/ui";

export default function ProfileConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant,
  loading,
  confirmText,
  requireReason = false,
}) {
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:p-4">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 sm:p-8 max-w-md w-full space-y-5 sm:space-y-6 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)] dark:shadow-[0_24px_80px_-20px_rgba(0,0,0,0.7)] animate-in fade-in-50 slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tight text-zinc-900 dark:text-white leading-none">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            {description}
          </p>
        </div>
        {requireReason && (
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
              Reason
            </label>
            <Input
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this action is necessary"
            />
          </div>
        )}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:flex-1 h-11 sm:h-12 rounded-full font-black text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(reason.trim())}
            disabled={loading || (requireReason && !reason.trim())}
            variant={variant === "destructive" ? "destructive" : "default"}
            className="w-full sm:flex-1 h-11 sm:h-12 rounded-full font-black text-xs uppercase tracking-widest shadow-md cursor-pointer"
          >
            {confirmText || "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}
