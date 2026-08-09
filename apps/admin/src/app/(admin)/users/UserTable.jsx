"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Activity, MoreVertical, Loader2, Users as UsersIcon } from 'lucide-react';
import { User, ROLE_CONFIG, STATUS_CONFIG, initials, fmtDate } from './types';
import { Button } from '@/components/ui';






export function UserTable({ users, loading }) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
        <Loader2 className="animate-spin text-zinc-500" size={24} />
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Loading Users...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
        <UsersIcon className="text-zinc-300 dark:text-zinc-800" size={48} />
        <span className="text-zinc-400 dark:text-zinc-600 text-sm font-bold">No users found</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
      {/* Mobile View: Cards */}
      <div className="lg:hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {users.map((user, i) => {
          const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
          const RoleIcon = roleConf.icon;
          const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
          return (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 flex flex-col gap-4 active:bg-zinc-50 dark:active:bg-zinc-900/40 transition-colors"
              onClick={() => router.push(`/users/${user._id}`)}>
              
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300">
                                        {initials(user.fullName)}
                                    </div>
                                    <div>
                                        <div className="font-black font-outfit text-zinc-900 dark:text-white uppercase tracking-tight text-sm leading-none">{user.fullName}</div>
                                        <div className="text-[10px] text-zinc-500 dark:text-zinc-600 flex items-center gap-1 mt-1">
                                            <Mail size={10} />@{user.username}
                                        </div>
                                    </div>
                                </div>
                                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {e.stopPropagation();router.push(`/users/${user._id}`);}}
                  className="p-2 h-8 w-8 rounded-lg text-zinc-400">
                  
                                    <MoreVertical size={16} />
                                </Button>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2">
                                <div className={`flex items-center gap-1.5 ${roleConf.color}`}>
                                    <RoleIcon size={12} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{roleConf.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                    <span className={`text-[9px] font-black uppercase tracking-widest ${statusConf.text}`}>{user.status}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Activity size={10} />
                                    <span className="text-[9px] font-bold uppercase">{fmtDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </motion.div>);

        })}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800/60">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">User</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Joined</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 dark:text-zinc-600">Last Login</th>
                            <th className="px-8 py-6" />
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, i) => {
              const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
              const RoleIcon = roleConf.icon;
              const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
              return (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 transition-colors cursor-pointer"
                  onClick={() => router.push(`/users/${user._id}`)}>
                  
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-sm text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-110 transition-transform">
                                                {initials(user.fullName)}
                                            </div>
                                            <div>
                                                <div className="font-black font-outfit text-zinc-900 dark:text-white uppercase tracking-tight">{user.fullName}</div>
                                                <div className="text-[11px] text-zinc-500 dark:text-zinc-600 flex items-center gap-1 mt-0.5">
                                                    <Mail size={11} />@{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`flex items-center gap-2 ${roleConf.color}`}>
                                            <RoleIcon size={14} />
                                            <span className="text-[11px] font-black uppercase tracking-widest">{roleConf.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${statusConf.text}`}>{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-zinc-500 dark:text-zinc-600">{fmtDate(user.createdAt)}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-600">
                                            <Activity size={12} />
                                            <span className="text-xs font-bold">{fmtDate(user.lastLogin)}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Button
                      variant="ghost"
                      onClick={(e) => {e.stopPropagation();router.push(`/users/${user._id}`);}}
                      className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                      
                                            <MoreVertical size={18} />
                                        </Button>
                                    </td>
                                </motion.tr>);

            })}
                    </tbody>
                </table>
            </div>
        </div>);

}