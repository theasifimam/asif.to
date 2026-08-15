"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from 'lucide-react';













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
            <DialogContent className="overflow-hidden p-7 sm:max-w-[440px] sm:p-8">
                <DialogHeader className="items-center text-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconStyles[variant]}`}>
                        <AlertTriangle size={28} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <DialogTitle className="font-outfit text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
                    <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
            
                        {cancelText}
                    </Button>
                    <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold transition-all ${variantStyles[variant]}`}>
            
                        {loading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);

}
