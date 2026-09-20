"use client";

import React from "react";
import {
  Camera,
  Edit3,
  Mail,
  MapPin,
  Globe,
  Phone,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  ShieldCheck,
  ShieldAlert,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";

const ROLE_THEMES = {
  super_admin: {
    label: "Super Admin",
    badge:
      "bg-fuchsia-100/90 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-200 border border-fuchsia-200/80 dark:border-fuchsia-500/30",
    icon: ShieldCheck,
  },
  admin: {
    label: "Admin",
    badge:
      "bg-rose-100/90 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200 border border-rose-200/80 dark:border-rose-500/30",
    icon: ShieldCheck,
  },
  editor: {
    label: "Editor",
    badge:
      "bg-blue-100/90 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200 border border-blue-200/80 dark:border-blue-500/30",
    icon: ShieldAlert,
  },
  author: {
    label: "Author",
    badge:
      "bg-purple-100/90 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200 border border-purple-200/80 dark:border-purple-500/30",
    icon: Shield,
  },
  reader: {
    label: "Reader",
    badge:
      "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700",
    icon: UserIcon,
  },
};

export default function ProfileHeroHeader({
  user,
  avatarUrl,
  roleConf,
  statusConf,
  getInitials,
  onEditAvatar,
  onEditProfile,
}) {
  const theme =
    ROLE_THEMES[user.role] ||
    ROLE_THEMES[user.role?.toLowerCase()] ||
    ROLE_THEMES.reader;
  const RoleIcon = theme.icon;

  return (
    <header className="relative rounded-3xl sm:rounded-[36px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-4.5 sm:p-6 md:p-7 shadow-xs space-y-3.5 sm:space-y-4">
      {/* Top Right Edit Profile Pen Button */}
      <button
        type="button"
        onClick={onEditProfile || onEditAvatar}
        className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/80 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-all shadow-2xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 z-10"
        title="Edit profile information"
        aria-label="Edit Profile"
      >
        <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>

      <div className="flex flex-row items-start gap-3.5 sm:gap-6 pr-8 sm:pr-10 min-w-0">
        {/* Avatar with Status Ring */}
        <button
          type="button"
          onClick={onEditAvatar}
          className="group relative shrink-0 cursor-pointer focus:outline-none"
          title="Click to edit profile picture"
          aria-label="Edit profile picture"
        >
          <Avatar className="h-14 w-14 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-2xs transition-transform group-hover:scale-[1.02]">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 text-lg sm:text-2xl font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl bg-black/45 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 backdrop-blur-xs">
            <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="mt-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider">
              Edit
            </span>
          </div>
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 rounded-full border-2 border-white dark:border-[#121215] ${statusConf.dot} shadow-2xs`}
            title={`Status: ${statusConf.label}`}
          />
        </button>

        {/* Profile Details */}
        <div className="flex-1 text-left space-y-1.5 min-w-0">
          {/* Name & Role Tag */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black font-outfit tracking-[-0.03em] text-zinc-950 dark:text-white leading-tight truncate">
              {user.fullName}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${theme.badge}`}
            >
              <RoleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <span>{theme.label}</span>
            </span>
          </div>

          {/* Clean Inline Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1 min-w-0">
              <Mail
                size={12}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span className="truncate">{user.email}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin
                size={12}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span>{user.location || "Remote"}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Globe
                size={12}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span>@{user.username}</span>
            </span>
            {user.mNumber && (
              <span className="inline-flex items-center gap-1">
                <Phone
                  size={12}
                  className="text-zinc-400 dark:text-zinc-500 shrink-0"
                />
                <span>{user.mNumber}</span>
              </span>
            )}
          </div>

          {/* Minimalist Social Links */}
          {user.socials && Object.values(user.socials).some((link) => link) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {user.socials.twitter && (
                <a
                  href={
                    user.socials.twitter.startsWith("http")
                      ? user.socials.twitter
                      : `https://twitter.com/${user.socials.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="Twitter / X"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-sky-50 hover:text-sky-500 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-sky-950/50 dark:hover:text-sky-400 transition-all"
                >
                  <Twitter size={13} />
                </a>
              )}
              {user.socials.linkedin && (
                <a
                  href={
                    user.socials.linkedin.startsWith("http")
                      ? user.socials.linkedin
                      : `https://linkedin.com/in/${user.socials.linkedin}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-blue-50 hover:text-blue-600 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 transition-all"
                >
                  <Linkedin size={13} />
                </a>
              )}
              {user.socials.website && (
                <a
                  href={
                    user.socials.website.startsWith("http")
                      ? user.socials.website
                      : `https://${user.socials.website}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="Website"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-all"
                >
                  <Globe size={13} />
                </a>
              )}
              {user.socials.github && (
                <a
                  href={
                    user.socials.github.startsWith("http")
                      ? user.socials.github
                      : `https://github.com/${user.socials.github}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-all"
                >
                  <Github size={13} />
                </a>
              )}
              {user.socials.instagram && (
                <a
                  href={
                    user.socials.instagram.startsWith("http")
                      ? user.socials.instagram
                      : `https://instagram.com/${user.socials.instagram}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  title="Instagram"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-pink-50 hover:text-pink-500 dark:bg-zinc-800/80 dark:text-zinc-400 dark:hover:bg-pink-950/50 dark:hover:text-pink-400 transition-all"
                >
                  <Instagram size={13} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biography & Narrative */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1">
        <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          Biography & Narrative
        </h2>
        <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {user.bio || "No public biography provided for this user profile."}
        </p>
        {user.expertise && user.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {user.expertise.map((exp) => (
              <span
                key={exp}
                className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60 text-[10px] font-bold text-zinc-600 dark:text-zinc-400"
              >
                {exp}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
