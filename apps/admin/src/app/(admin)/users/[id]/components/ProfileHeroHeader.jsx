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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Badge } from "@/components/ui";

export default function ProfileHeroHeader({
  user,
  avatarUrl,
  roleConf,
  statusConf,
  getInitials,
}) {
  return (
    <header className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] border border-zinc-200/90 bg-linear-to-br from-white via-blue-50/30 to-indigo-50/40 shadow-xl shadow-blue-500/3 dark:border-white/8 dark:bg-linear-to-br dark:from-[#111319] dark:via-[#131622] dark:to-[#0f1118] dark:shadow-2xl dark:shadow-black/60">
      {/* Subtle dot matrix texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.06)_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[16px_16px] opacity-70" />

      {/* Ambient Top-Right & Bottom-Left Lighting Meshes */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-linear-to-br from-blue-500/15 via-indigo-500/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-linear-to-tr from-sky-500/10 to-transparent blur-3xl" />

      {/* Profile Content Body */}
      <div className="p-6 sm:p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar with Status Ring */}
        <div className="relative shrink-0 group">
          <Avatar className="h-28 w-28 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-zinc-100 shadow-md transition-transform duration-200 group-hover:scale-[1.01] dark:border-zinc-900 dark:bg-zinc-950 sm:h-36 sm:w-36">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 text-3xl font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:text-4xl font-outfit">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white dark:border-zinc-900 ${statusConf.dot} shadow-md flex items-center justify-center`}
            title={`Status: ${statusConf.label}`}
          />
        </div>

        {/* Profile Information */}
        <div className="flex-1 text-center md:text-left space-y-4 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white leading-tight truncate">
              {user.fullName}
            </h1>
            <Badge
              className={`${roleConf.bg} ${roleConf.color} ${roleConf.ring} ring-1 border-none rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-widest shadow-2xs`}
            >
              {roleConf.label}
            </Badge>
          </div>

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 text-zinc-600 dark:text-zinc-400 font-bold text-xs">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/6 border border-zinc-200/80 dark:border-white/10 shadow-2xs backdrop-blur-xs truncate">
              <Mail size={13} className="text-blue-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.mNumber && (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/6 border border-zinc-200/80 dark:border-white/10 shadow-2xs backdrop-blur-xs">
                <Phone size={13} className="text-blue-500 shrink-0" />
                <span>{user.mNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/6 border border-zinc-200/80 dark:border-white/10 shadow-2xs backdrop-blur-xs uppercase text-[10px] tracking-wider">
              <MapPin size={13} className="text-blue-500 shrink-0" />
              <span>{user.location || "Remote Node"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-white/6 border border-zinc-200/80 dark:border-white/10 shadow-2xs backdrop-blur-xs">
              <Globe size={13} className="text-blue-500 shrink-0" />
              <span className="opacity-80">@{user.username}</span>
            </div>
          </div>

          {/* Social Links Row */}
          {user.socials && Object.values(user.socials).some((link) => link) && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {user.socials.twitter && (
                <a
                  href={
                    user.socials.twitter.startsWith("http")
                      ? user.socials.twitter
                      : `https://twitter.com/${user.socials.twitter}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/6 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 transition-all shadow-2xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/6 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 transition-all shadow-2xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/6 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 transition-all shadow-2xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/6 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 transition-all shadow-2xs"
                >
                  <Github
                    size={13}
                    className="text-zinc-900 dark:text-zinc-100"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-white/6 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 transition-all shadow-2xs"
                >
                  <Instagram size={13} className="text-pink-500" />
                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
