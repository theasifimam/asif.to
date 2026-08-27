"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function AuthHeader() {
  return (
    <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-0">
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="asif.to"
          className="w-8 h-8 rounded-xl object-contain shrink-0"
        />
        <span className="font-outfit font-black text-xl tracking-tight text-foreground">
          asif
          <span className="text-blue-600 dark:text-blue-400">
            .to
          </span>
        </span>
      </div>
      <Dialog.Close asChild>
        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500 dark:text-zinc-400">
          <X size={18} />
        </button>
      </Dialog.Close>
    </div>
  );
}
