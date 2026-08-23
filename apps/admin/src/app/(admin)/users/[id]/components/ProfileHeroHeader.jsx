"use client";

import React from "react";
import {
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
}) {
  const theme =
    ROLE_THEMES[user.role] ||
    ROLE_THEMES[user.role?.toLowerCase()] ||
    ROLE_THEMES.reader;
  const RoleIcon = theme.icon;

  return (
    <header className="rounded-4xl sm:rounded-[36px] bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 md:p-7 shadow-xs space-y-4">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
        {/* Avatar with Status Ring */}
        <div className="relative shrink-0">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-3xl sm:rounded-[28px] border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-2xs">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 text-2xl font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-[#121215] ${statusConf.dot} shadow-2xs`}
            title={`Status: ${statusConf.label}`}
          />
        </div>

        {/* Profile Details */}
        <div className="flex-1 text-center md:text-left space-y-2 min-w-0">
          {/* Name & Role Tag */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-outfit tracking-[-0.03em] text-zinc-950 dark:text-white leading-none truncate">
              {user.fullName}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider ${theme.badge}`}
            >
              <RoleIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{theme.label}</span>
            </span>
          </div>

          {/* Clean Inline Metadata (No bulky pill borders) */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail
                size={13}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span className="truncate">{user.email}</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin
                size={13}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span>{user.location || "Remote Node"}</span>
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Globe
                size={13}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />
              <span>@{user.username}</span>
            </span>
            {user.mNumber && (
              <>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone
                    size={13}
                    className="text-zinc-400 dark:text-zinc-500 shrink-0"
                  />
                  <span>{user.mNumber}</span>
                </span>
              </>
            )}
          </div>

          {/* Minimalist Social Links */}
          {user.socials && Object.values(user.socials).some((link) => link) && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 pt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {user.socials.twitter && (
                <a
                  href={
                    user.socials.twitter.startsWith("http")
                      ? user.socials.twitter
                      : `https://twitter.com/${user.socials.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-sky-500 transition-colors"
                >
                  <Twitter size={13} className="text-sky-400" />
                  <span>Twitter</span>
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
                  className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <Linkedin size={13} className="text-blue-500" />
                  <span>LinkedIn</span>
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
                  className="inline-flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                >
                  <Globe size={13} className="text-emerald-500" />
                  <span>Website</span>
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
                  className="inline-flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <Github
                    size={13}
                    className="text-zinc-700 dark:text-zinc-300"
                  />
                  <span>GitHub</span>
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
                  className="inline-flex items-center gap-1.5 hover:text-pink-500 transition-colors"
                >
                  <Instagram size={13} className="text-pink-500" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Biography & Narrative */}
      <div className="pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
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
