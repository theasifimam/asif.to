"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";

export function DeleteUserModal({ user, onClose, onDelete, submitting }) {
  const [reason, setReason] = useState("");

  return (
    <Dialog
      open={!!user}
      onOpenChange={(o) => {
        if (!o) {
          setReason("");
          onClose();
        }
      }}
    >
      <DialogContent
        variant="island"
        className="p-6 sm:p-8 sm:max-w-110 rounded-4xl"
      >
        <DialogHeader className="items-center text-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 size={28} />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">
            Delete User?
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">
            This removes <strong>{user?.fullName}</strong> from the admin user
            list and immediately revokes access. Published content and
            attribution are preserved.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 sm:mt-6 space-y-2">
          <label
            htmlFor="delete-user-reason"
            className="block text-[10px] font-black uppercase tracking-widest text-zinc-500"
          >
            Reason
          </label>
          <textarea
            id="delete-user-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            maxLength={1000}
            placeholder="Why is this account being deleted?"
            className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm outline-none focus:border-red-400 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <DialogFooter className="mt-6 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:flex-1 h-11 sm:h-12 px-4 sm:px-6 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => user && onDelete(user._id, reason.trim())}
            disabled={submitting || !reason.trim()}
            variant="destructive"
            className="w-full sm:flex-1 flex items-center justify-center gap-2 h-11 sm:h-12 px-4 sm:px-6 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60 shadow-lg shadow-red-500/20 cursor-pointer"
          >
            {submitting ? <LogoLoader size={14} className="" /> : null}
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
