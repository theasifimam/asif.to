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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Mail, Ban, CheckCircle2, Key, Trash2, Clock } from 'lucide-react';
import { User, ROLE_CONFIG, STATUS_CONFIG, initials, fmtDate } from './types';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

export function UserDetailModal({
  user,
  onClose,
  onToggleStatus,
  onUpdateRole,
  onResetPasswordAction,
  onDeleteAction
}) {
  if (!user) return null;

  const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
  const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const RoleIcon = roleConf.icon;

  const avatarUrl = user.avatar && !user.avatar.includes("ui-avatars.com")
    ? (user.avatar.startsWith("http") ? user.avatar : `${STORAGE_URL}${user.avatar}`)
    : null;

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-[2rem] p-10 sm:max-w-[440px] shadow-2xl">
        <DialogHeader className="gap-3 flex items-center flex-row text-center mb-2">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl || ""} />
            <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-black font-outfit uppercase tracking-tighter">{user.fullName}</DialogTitle>
            <DialogDescription className="flex items-center justify-center gap-1 text-[11px] font-bold">
              <Mail size={12} />{user.email}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-6 border-y border-zinc-100 dark:border-zinc-800 my-4 overflow-y-auto max-h-[250px]">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Clearance Role</span>
            <div className={`flex items-center gap-2 ${roleConf.color}`}>
              <RoleIcon size={14} />
              <span className="text-[11px] font-black uppercase tracking-widest">{roleConf.label}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${statusConf.text}`}>{user.status}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Username</span>
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">@{user.username}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Account Since</span>
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">{fmtDate(user.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Login</span>
            <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              {user.lastLogin ? fmtDate(user.lastLogin) : "Never"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Change Role</span>
            <Select value={user.role} onValueChange={(val) => onUpdateRole(user._id, val)}>
              <SelectTrigger className="w-36 h-8 text-[11px] font-black border-zinc-200 dark:border-zinc-800 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-2">
          <Button
            onClick={() => onToggleStatus(user)}
            variant="destructive"
            className='px-4 py-3 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all'>
            {user.status === "active" ? <><Ban size={16} /> Suspend Access</> : <><CheckCircle2 size={16} /> Restore Access</>}
          </Button>
          <Button
            onClick={() => {onClose();onResetPasswordAction(user);}}
            variant="outline"
            className='px-4 py-3 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-all border-zinc-200 dark:border-zinc-800'>
            <Key size={16} /> Reset Password
          </Button>
          <Button
            onClick={() => {onClose();onDeleteAction(user);}}
            variant="destructive"
            className="w-full px-4 py-3 rounded-3xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all">
            <Trash2 size={16} /> Permanently Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}