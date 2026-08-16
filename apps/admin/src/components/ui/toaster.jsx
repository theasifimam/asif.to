"use client";

import { Toaster as SonnerToaster } from "sonner";
import { useTheme } from "next-themes";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

export function AdminToaster() {
  const { theme = "dark" } = useTheme();

  return (
    <SonnerToaster
      theme={theme === "light" ? "light" : "dark"}
      position="top-right"
      richColors={false}
      expand={true}
      closeButton={false}
      duration={4000}
      className="admin-toaster font-sans"
      toastOptions={{
        unstyled: false,
        className: "admin-toast-item",
      }}
      icons={{
        success: (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        ),
        error: (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:bg-red-500/15 dark:border-red-500/30 dark:text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]">
            <AlertCircle className="h-4.5 w-4.5" />
          </div>
        ),
        warning: (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:bg-amber-500/15 dark:border-amber-500/30 dark:text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
        ),
        info: (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.15)]">
            <Info className="h-4.5 w-4.5" />
          </div>
        ),
        loading: (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:bg-blue-500/15 dark:border-blue-500/30 dark:text-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.15)]">
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          </div>
        ),
      }}
    />
  );
}

export default AdminToaster;
