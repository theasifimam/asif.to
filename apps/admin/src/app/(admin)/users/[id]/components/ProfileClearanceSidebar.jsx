"use client";

import React from "react";
import { Ban, CheckCircle2, Key, Trash2, Lock } from "lucide-react";
import { format } from "date-fns";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import SectionHeader from "./SectionHeader";

export default function ProfileClearanceSidebar({
  user,
  isOwnProfile,
  setConfirmAction,
  setIsPwOpen,
  canManageRoles,
}) {
  return (
    <aside className="lg:col-span-4 space-y-6">
      {/* System Clearance Box */}
      <section className="space-y-3">
        <SectionHeader title="System Clearance" />
        <div className="rounded-[28px] sm:rounded-4xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Clearance Level
            </label>
            <Select
              disabled={!canManageRoles}
              value={user.role}
              onValueChange={(val) =>
                setConfirmAction({
                  type: "role",
                  isOpen: true,
                  title: "Authorize Level Shift?",
                  description: `Elevate or reduce user clearance to '${val}'?`,
                  variant: "warning",
                  data: { role: val },
                })
              }
            >
              <SelectTrigger className="h-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 font-bold text-xs focus:ring-0 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800 z-1000">
                <SelectItem value="reader">Reader</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            {isOwnProfile && !canManageRoles && (
              <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 mt-1 px-1">
                <Lock size={11} className="text-zinc-400" /> You cannot change
                your own clearance level.
              </p>
            )}
            {isOwnProfile && canManageRoles && (
              <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Changing your own role signs you out immediately. At least one
                other active super admin must remain.
              </p>
            )}
            {!isOwnProfile && !canManageRoles && (
              <p className="text-[10px] font-bold text-zinc-500">
                Only a super admin can change roles.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Security Credentials
            </label>
            <Button
              variant="outline"
              onClick={() => setIsPwOpen(true)}
              disabled={user.provider !== "credentials"}
              className="w-full h-10 rounded-full border-zinc-200/80 dark:border-zinc-800 gap-2 font-bold uppercase tracking-wider text-[10px] hover:bg-zinc-50 dark:hover:bg-zinc-900 bg-white dark:bg-transparent shadow-2xs transition-all cursor-pointer"
            >
              <Key size={13} />
              {user.provider !== "credentials"
                ? "Managed by OAuth provider"
                : isOwnProfile
                  ? "Change My Password"
                  : "Reset password"}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Account Lifecycle
            </label>
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-zinc-400 dark:text-zinc-500">Joined</span>
                <span className="text-zinc-700 dark:text-zinc-200">
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMM d, yyyy")
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-zinc-400 dark:text-zinc-500">
                  Last Login
                </span>
                <span className="text-zinc-700 dark:text-zinc-200">
                  {user.lastLogin
                    ? format(new Date(user.lastLogin), "MMM d, yyyy")
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Account Security Controls / Danger Zone */}
      <section className="space-y-3">
        <SectionHeader title="Account Security Controls" />
        <div className="rounded-[28px] sm:rounded-4xl bg-white dark:bg-[#121215] border border-rose-200/80 dark:border-rose-900/30 p-5 sm:p-6 shadow-xs space-y-3">
          {isOwnProfile ? (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 text-center text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
              Self-Account Protection Active. Account suspension & deletion are
              restricted.
            </div>
          ) : (
            <>
              <Button
                variant={user.status === "active" ? "destructive" : "default"}
                onClick={() =>
                  setConfirmAction({
                    type: "suspend",
                    isOpen: true,
                    title:
                      user.status === "active"
                        ? "Suspend System Access?"
                        : "Restore System Access?",
                    description:
                      user.status === "active"
                        ? "User will be blocked from all nodes."
                        : "Re-authorizing user access.",
                    variant:
                      user.status === "active" ? "destructive" : "default",
                    requireReason: user.status === "active",
                  })
                }
                className={`w-full h-10 rounded-full gap-2 font-black uppercase tracking-wider text-[10px] cursor-pointer ${
                  user.status === "active"
                    ? "bg-rose-500 hover:bg-rose-600 shadow-2xs border-none"
                    : ""
                }`}
              >
                {user.status === "active" ? (
                  <>
                    <Ban size={13} /> Suspend Operations
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} /> Activate Protocol
                  </>
                )}
              </Button>

              {user.status !== "banned" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmAction({
                      type: "ban",
                      isOpen: true,
                      title: "Ban this account?",
                      description:
                        "The user will immediately lose access. Published content remains preserved.",
                      variant: "destructive",
                      requireReason: true,
                    })
                  }
                  className="w-full h-10 rounded-full gap-2 font-black uppercase tracking-wider text-[10px] border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60"
                >
                  <Ban size={13} /> Ban account
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={() =>
                  setConfirmAction({
                    type: "delete",
                    isOpen: true,
                    title: "Deactivate this account?",
                    description:
                      "The user will lose access, while published content and attribution are preserved.",
                    variant: "destructive",
                    requireReason: true,
                  })
                }
                className="w-full h-10 rounded-full gap-2 font-black uppercase tracking-wider text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
              >
                <Trash2 size={13} />
                Deactivate account
              </Button>
            </>
          )}
        </div>
      </section>
    </aside>
  );
}
