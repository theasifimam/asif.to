"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter } from
"@/components/ui/dialog";
import { Trash2, Loader2 } from 'lucide-react';
import { User } from './types';
import { Button } from '@/components/ui';








export function DeleteUserModal({ user, onClose, onDelete, submitting }) {
  return (
    <Dialog open={!!user} onOpenChange={(o) => {if (!o) onClose();}}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-10 sm:max-w-[400px]">
                <DialogHeader className="items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
                        <Trash2 size={28} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">Delete Associate?</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
                        This will permanently remove <strong>{user?.fullName}</strong> and all associated data. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-6 gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors">Cancel</Button>
                    <Button
            onClick={() => user && onDelete(user._id)}
            disabled={submitting}
            variant="destructive"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all disabled:opacity-60 shadow-lg shadow-red-500/20">
            
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                        Confirm Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);

}