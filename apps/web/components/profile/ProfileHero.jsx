"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/config";
import { getUserMasteryTier } from "@/lib/masteryTier";
import {
  Link2,
  MapPin,
  Calendar,
  Edit3,
  LogOut,
} from "lucide-react";

export default function ProfileHero({
  user,
  isOwnProfile,
  onOpenLogout,
}) {
  const masteryTier = getUserMasteryTier(user);

  return (
    <section className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-6 relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
      {/* Subtle gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with Ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 shadow-lg ring-4 ring-blue-500/20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {user?.avatar && !user.avatar.includes("ui-avatars.com") ? (
            <Image
              src={getImageUrl(user.avatar)}
              alt={user?.fullName || "Avatar"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 font-outfit uppercase tracking-tight select-none">
              {user?.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "U"}
            </span>
          )}
        </div>

        {/* User Info Details */}
        <div className="flex-1 flex flex-col items-center sm:items-start gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
              {user?.fullName}
            </h1>
            <span className={`px-3 py-0.5 rounded-full font-bold text-xs transition-colors ${masteryTier.badgeColor}`}>
              {masteryTier.badgeText}
            </span>
          </div>

          {/* Username pill */}
          <div className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-400">
              asif.to/{user?.username}
            </span>
          </div>

          {isOwnProfile && user?.email && (
            <p className="text-xs sm:text-sm text-zinc-500 font-medium">
              {user.email}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-zinc-400 pt-1">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {user?.location || "Earth"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Member since{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "2024"}
            </span>
          </div>

          {user?.bio && (
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed mt-1">
              {user.bio}
            </p>
          )}
        </div>

        {/* Profile Action Buttons (Own Profile Only) */}
        {isOwnProfile && (
          <div className="flex items-center gap-2 self-stretch sm:self-start justify-center">
            <Link
              href={`/${user?.username || ""}/settings`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
            <button
              type="button"
              onClick={onOpenLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
