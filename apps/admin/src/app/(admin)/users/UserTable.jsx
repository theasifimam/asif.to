"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Activity,
  MoreVertical,
  Loader2,
  Users as UsersIcon,
} from "lucide-react";
import { User, ROLE_CONFIG, STATUS_CONFIG, initials, fmtDate } from "./types";
import { Button } from "@/components/ui";

export function UserTable({ users, loading, viewMode = "table" }) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 gap-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
        <Loader2 className="animate-spin text-zinc-500" size={24} />
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          Loading Users...
        </span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80">
        <UsersIcon className="text-zinc-300 dark:text-zinc-800" size={48} />
        <span className="text-zinc-400 dark:text-zinc-600 text-sm font-bold">
          No users found
        </span>
      </div>
    );
  }

  if (viewMode === "card") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              className="group flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-blue-500/50 hover:shadow-md dark:border-zinc-800/80 dark:bg-zinc-900 cursor-pointer"
              onClick={() => router.push(`/users/${user._id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-105 transition-transform">
                      {initials(user.fullName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black font-outfit text-zinc-900 dark:text-white uppercase tracking-tight text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {user.fullName}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-600 flex items-center gap-1 mt-0.5 truncate">
                        <Mail size={10} className="shrink-0" />
                        <span className="truncate">@{user.username}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/users/${user._id}`);
                    }}
                    className="h-8 w-8 rounded-lg text-zinc-400 shrink-0"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-wider ${roleConf.color}`}
                  >
                    <RoleIcon size={12} />
                    <span>{roleConf.label}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${statusConf.text}`}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80 text-[10px] font-bold text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Activity size={11} />
                  <span>Joined {fmtDate(user.createdAt)}</span>
                </div>
                <span>View Profile &rarr;</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl sm:rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs overflow-hidden">
      {/* Mobile View: Cards */}
      <div className="lg:hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/70">
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
              className="p-4 sm:p-5 flex flex-col gap-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
              onClick={() => router.push(`/users/${user._id}`)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0">
                    {initials(user.fullName)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-zinc-900 dark:text-white text-sm leading-tight truncate">
                      {user.fullName}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                      <Mail size={11} className="shrink-0" />
                      <span className="truncate">@{user.username}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/users/${user._id}`);
                  }}
                  className="h-8 w-8 rounded-xl text-zinc-400 shrink-0"
                >
                  <MoreVertical size={16} />
                </Button>
              </div>

              <div className="flex items-center justify-between pt-1 flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleConf.bg} ${roleConf.color} border border-current/20`}
                  >
                    <RoleIcon size={11} />
                    <span>{roleConf.label}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${statusConf.text}`}
                    >
                      {user.status}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-zinc-400 text-[11px] font-medium">
                  <Activity size={11} />
                  <span>{fmtDate(user.createdAt)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Last Login</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {users.map((user, i) => {
              const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
              const RoleIcon = roleConf.icon;
              const statusConf =
                STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
              return (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/users/${user._id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-105 transition-transform">
                        {initials(user.fullName)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                          <Mail size={11} className="shrink-0" />
                          <span className="truncate">@{user.username}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${roleConf.bg} ${roleConf.color} border border-current/20`}
                    >
                      <RoleIcon size={12} />
                      <span>{roleConf.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`}
                      />
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${statusConf.text}`}
                      >
                        {user.status}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                    {fmtDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                    {user.lastLoginAt ? fmtDate(user.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/users/${user._id}`);
                      }}
                      className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
