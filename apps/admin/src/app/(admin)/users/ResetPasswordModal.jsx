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
import { Key } from 'lucide-react';
import { User } from './types';
import { Input, Button } from '@/components/ui';








export function ResetPasswordModal({ user, onClose, onReset, submitting }) {
  const [newPw, setNewPw] = useState('');

  const handleSubmit = async () => {
    if (!user) return;
    await onReset(user._id, newPw);
    setNewPw('');
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => {if (!o) {onClose();setNewPw('');}}}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-10 sm:max-w-[400px]">
                <DialogHeader className="gap-3">
                    <div className="w-14 h-14 rounded-[20px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                        <Key size={24} />
                    </div>
                    <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white">Reset Password</DialogTitle>
                    <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Set a new password for <strong>{user?.fullName}</strong>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 mt-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">New Password</label>
                    <Input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-white transition-colors" />
          
                </div>
                <DialogFooter className="mt-6 gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 transition-colors">Cancel</Button>
                    <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-60">
            
                        {submitting ? <LogoLoader size={14} className=""  /> : null}
                        Reset Password
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);

}