"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/config";
import { getUserMasteryTier } from "@/lib/masteryTier";
import ProfileCourseProgressSummary from "@/components/profile/ProfileCourseProgressSummary";
import {
  Link2,
  MapPin,
  Calendar,
  Edit3,
  LogOut,
  Flame,
  BookMarked,
  BookOpen,
  Award,
  Sparkles,
} from "lucide-react";

export default function ProfileHero({
  user,
  isOwnProfile,
  onOpenLogout,
  streak = 0,
  libraryCount = 0,
  completedCoursesCount = 0,
  certificatesCount = 0,
  onSelectTab,
}) {
  const currentStreak = streak || user?.streak || 0;
  const currentLibraryCount =
    libraryCount || (user?.libraryCount || 0) + (user?.bookmarks?.length || 0);
  const currentCompletedCoursesCount =
    completedCoursesCount || user?.completedCourses?.length || 0;
  const currentCertificatesCount =
    certificatesCount || user?.certificates?.length || 0;

  const masteryTier = getUserMasteryTier(user, { streak: currentStreak });
  const displayLevel = masteryTier.level || user?.masteryLevel || 1;
  const displayTitle = masteryTier.title || "Learning Explorer";

  const pillStats = [
    currentStreak > 0 && {
      key: "streak",
      render: () => (
        <Link
          key="streak"
          href="/revision"
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
          <span>{currentStreak} Days Streak</span>
        </Link>
      ),
    },
    currentLibraryCount > 0 && {
      key: "library",
      render: () => (
        <button
          key="library"
          type="button"
          onClick={() => onSelectTab && onSelectTab("library")}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <BookMarked className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>{currentLibraryCount} Saved Items</span>
        </button>
      ),
    },
    currentCompletedCoursesCount > 0 && {
      key: "courses",
      render: () => (
        <button
          key="courses"
          type="button"
          onClick={() => onSelectTab && onSelectTab("courses")}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{currentCompletedCoursesCount} Courses Completed</span>
        </button>
      ),
    },
    currentCertificatesCount > 0 && {
      key: "certs",
      render: () => (
        <button
          key="certs"
          type="button"
          onClick={() => onSelectTab && onSelectTab("certificates")}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>{currentCertificatesCount} Certs Won</span>
        </button>
      ),
    },
    (displayLevel > 1 || currentStreak > 0 || currentCompletedCoursesCount > 0) && {
      key: "mastery",
      render: () => (
        <button
          key="mastery"
          type="button"
          onClick={() => onSelectTab && onSelectTab("quiz")}
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-none hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Level {displayLevel} ({displayTitle})</span>
        </button>
      ),
    },
  ].filter(Boolean);

  return (
    <section className="p-6 sm:p-9 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md flex flex-col gap-6 relative overflow-hidden border border-zinc-100 dark:border-zinc-800">
      {/* Subtle gradient blob */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar with Ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 shadow-lg ring-4 ring-blue-500/20 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {user?.avatar ? (
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
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Pill-shaped stats at bottom of first card (minimal border, no shadow) */}
      {pillStats.length > 0 && (
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center gap-2 sm:gap-2.5">
          {pillStats.map((stat) => stat.render())}
        </div>
      )}

      {/* Embedded Learning Progress Summary */}
      {isOwnProfile && <ProfileCourseProgressSummary />}
    </section>
  );
}
