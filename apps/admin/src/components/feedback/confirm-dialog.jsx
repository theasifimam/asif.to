"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';













export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false
}) {

  const variantStyles = {
    default: "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200",
    destructive: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
  };

  const iconStyles = {
    default: "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
    destructive: "bg-red-50 dark:bg-red-500/10 text-red-500",
    warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-500"
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && !loading && onClose()}>
      <DialogContent variant="island" className="p-6 sm:p-8 sm:max-w-[440px]">
        <DialogHeader className="items-center text-center gap-3 sm:gap-4">
          <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${iconStyles[variant]}`}>
            <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            <DialogTitle className="font-outfit text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              {title}
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-6 sm:mt-8 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:flex-1 h-11 sm:h-12 px-4 sm:px-6 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:flex-1 flex items-center justify-center gap-2 h-11 sm:h-12 rounded-full px-4 sm:px-6 text-xs font-bold transition-all cursor-pointer shadow-sm ${variantStyles[variant]}`}
          >
            {loading ? <LogoLoader size={16} className="" /> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
