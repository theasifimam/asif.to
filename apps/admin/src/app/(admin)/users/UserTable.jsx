"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Activity,
  Eye,
  Pencil,
  Loader2,
  Users as UsersIcon,
  Clock,
} from "lucide-react";
import { ROLE_CONFIG, STATUS_CONFIG, initials, fmtDate } from "./types";
import { Button, Skeleton } from "@/components/ui";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

const getCustomAvatar = (avatar) => {
  if (!avatar || avatar.includes("ui-avatars.com")) return null;
  return avatar.startsWith("http") ? avatar : `${STORAGE_URL}${avatar}`;
};

function UserCardSkeleton() {
  return (
    <div className="admin-surface flex flex-col justify-between p-5 min-h-[200px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 w-full">
            <Skeleton className="w-11 h-11 rounded-2xl shrink-0" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4.5 w-3/4 rounded-md" />
              <Skeleton className="h-3 w-1/2 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="space-y-1 w-1/2">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-3/4 rounded-md" />
        </div>
        <div className="grid grid-cols-2 gap-2 w-1/3">
          <Skeleton className="h-8 rounded-xl" />
          <Skeleton className="h-8 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function UserMobileRowSkeleton() {
  return (
    <div className="p-4 sm:p-5 flex flex-col gap-3.5">
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-1 w-24">
          <Skeleton className="h-3 w-full rounded-md" />
          <Skeleton className="h-3 w-3/4 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        <Skeleton className="h-8 rounded-xl" />
        <Skeleton className="h-8 rounded-xl" />
      </div>
    </div>
  );
}

function UserRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="space-y-1.5 w-36">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-3 w-2/3 rounded-md" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="mt-1 h-3 w-14 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20 rounded-md" />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-16 rounded-xl" />
        </div>
      </td>
    </tr>
  );
}

function UserTableComponent({
  users,
  loading,
  viewMode = "table",
  onUpdate,
  canUpdate = false,
  limit = 10,
}) {
  const router = useRouter();

  if (!loading && users.length === 0) {
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
        {loading ? (
          Array.from({ length: limit }).map((_, i) => (
            <UserCardSkeleton key={i} />
          ))
        ) : (
          users.map((user, i) => {
            const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
            const RoleIcon = roleConf.icon;
            const statusConf = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
          return (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="admin-surface group flex cursor-pointer flex-col justify-between p-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
              onClick={() => router.push(`/users/${user._id}`)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                      {getCustomAvatar(user.avatar) ? (
                        <img
                          src={getCustomAvatar(user.avatar)}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials(user.fullName)
                      )}
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

              <div className="mt-5 border-t border-zinc-100 pt-4 dark:border-zinc-800/80">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <Activity size={11} />
                      <span>Joined {fmtDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} />
                      <span>
                        Login:{" "}
                        {user.lastLogin ? fmtDate(user.lastLogin) : "Never"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/users/${user._id}`);
                    }}
                    className="rounded-xl"
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" /> View profile
                  </Button>
                  {canUpdate && (
                    <Button
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onUpdate?.(user);
                      }}
                      className="rounded-xl"
                    >
                      <Pencil className="mr-2 h-3.5 w-3.5" /> Edit user
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        }))}
      </div>
    );
  }

  return (
    <div className="admin-surface w-full overflow-hidden">
      {/* Mobile View: Cards */}
      <div className="lg:hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/70">
        {loading ? (
          Array.from({ length: limit }).map((_, i) => (
            <UserMobileRowSkeleton key={i} />
          ))
        ) : (
          users.map((user, i) => {
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
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0 overflow-hidden">
                    {getCustomAvatar(user.avatar) ? (
                      <img
                        src={getCustomAvatar(user.avatar)}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials(user.fullName)
                    )}
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
                <div className="flex flex-col gap-1 items-end text-zinc-400 text-[10px] font-medium">
                  <span className="flex items-center gap-1">
                    <Activity size={10} /> {fmtDate(user.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} /> Login:{" "}
                    {user.lastLogin ? fmtDate(user.lastLogin) : "Never"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/users/${user._id}`);
                  }}
                  className="rounded-xl"
                >
                  <Eye className="mr-2 h-3.5 w-3.5" /> View
                </Button>
                {canUpdate && (
                  <Button
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      onUpdate?.(user);
                    }}
                    className="rounded-xl"
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </div>
            </motion.div>
          );
        }))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="admin-table w-full text-left text-sm">
          <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-900/30 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Auth</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Last active</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {loading ? (
              Array.from({ length: limit }).map((_, i) => (
                <UserRowSkeleton key={i} />
              ))
            ) : (
              users.map((user, i) => {
              const roleConf = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
              const RoleIcon = roleConf.icon;
              const statusConf =
                STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
              return (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                  onClick={() => router.push(`/users/${user._id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center font-black text-xs text-zinc-700 dark:text-zinc-300 shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                        {getCustomAvatar(user.avatar) ? (
                          <img
                            src={getCustomAvatar(user.avatar)}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          initials(user.fullName)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-zinc-950 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
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
                      <RoleIcon size={11} />
                      <span>{roleConf.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50">
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
                  <td className="px-6 py-4">
                    <div className="text-xs font-semibold capitalize text-zinc-700 dark:text-zinc-300">
                      {user.provider === "credentials"
                        ? "Email"
                        : user.provider}
                    </div>
                    <div
                      className={`mt-0.5 text-[10px] font-bold ${user.isVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                    >
                      {user.isVerified ? "Verified" : "Unverified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                    {fmtDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium text-xs">
                    {user.lastActiveAt
                      ? fmtDate(user.lastActiveAt)
                      : user.lastLogin
                        ? fmtDate(user.lastLogin)
                        : "Never"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/users/${user._id}`);
                        }}
                        className="h-8 rounded-full px-3 text-xs font-bold text-zinc-600 dark:text-zinc-300"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> View
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdate?.(user);
                          }}
                          className="h-8 rounded-full px-3 text-xs font-bold border-zinc-200/80 dark:border-zinc-800"
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            }))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const UserTable = React.memo(UserTableComponent);
