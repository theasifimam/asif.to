"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';








export function DeleteUserModal({ user, onClose, onDelete, submitting }) {
  const [reason, setReason] = useState("");

  return (
    <Dialog open={!!user} onOpenChange={(o) => {if (!o) { setReason(""); onClose(); }}}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-10 sm:max-w-[400px]">
                <DialogHeader className="items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                        <Trash2 size={28} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">Delete User?</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
                        This removes <strong>{user?.fullName}</strong> from the admin user list and immediately revokes access. Published content and attribution are preserved.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6 space-y-2">
                  <label htmlFor="delete-user-reason" className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Reason
                  </label>
                  <textarea
                    id="delete-user-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Why is this account being deleted?"
                    className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:border-red-400 dark:border-zinc-800 dark:bg-zinc-900"
                  />
                </div>
                <DialogFooter className="mt-6 gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors">Cancel</Button>
                    <Button
            onClick={() => user && onDelete(user._id, reason.trim())}
            disabled={submitting || !reason.trim()}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
            
                        {submitting ? <LogoLoader size={14} className=""  /> : null}
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);

}
