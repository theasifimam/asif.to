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
import { Input, Button } from '@/components/ui';









export function PasswordResetModal({ isOpen, onClose, user, onReset, submitting }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = async () => {
    if (!password || password.length < 8) {
      return; // Sonner toast handled in parent
    }
    if (password !== confirm) {
      return;
    }
    await onReset(password);
    setPassword('');
    setConfirm('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => {if (!o && !submitting) onClose();}}>
            <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2rem] p-10 sm:max-w-[440px] shadow-2xl">
                <DialogHeader className="mb-4 items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-[24px] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Key size={28} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter">Secure Reset</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                            Update security credentials for {user?.fullName}.
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <div className="flex flex-col gap-5 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Password</label>
                        <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
            
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Confirm Reset</label>
                        <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type new password again"
              className="w-full h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 text-sm font-bold focus:ring-0 focus:border-zinc-300 dark:focus:border-zinc-700 transition-colors" />
            
                    </div>
                </div>
                <DialogFooter className="mt-8 gap-3 sm:flex-row flex-col">
                    <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1 px-6 py-6 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">Abort</Button>
                    <Button
            onClick={handleSubmit}
            disabled={submitting || !password || password !== confirm}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-6 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xl shadow-amber-500/20 disabled:opacity-40">
            
                        {submitting ? <LogoLoader size={16} className=""  /> : "Confirm Reset"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>);

}