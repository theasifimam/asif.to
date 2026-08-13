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
    <header className="relative overflow-hidden rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-sm transition-all duration-300">
      {/* Subtle Ambient Background Mesh & Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent dark:from-blue-500/20 dark:via-purple-500/10 dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-purple-500/15 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 dark:opacity-30 mask-radial-at-top" />
      </div>

      {/* Top Decorative Border Accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />

      {/* Profile Content Body */}
      <div className="p-6 sm:p-8 md:p-10 relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar with Status Ring */}
        <div className="relative shrink-0 group">
          <Avatar className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl sm:rounded-[2rem] ring-4 ring-white dark:ring-zinc-900 shadow-2xl shadow-indigo-500/10 shrink-0 transition-transform duration-500 group-hover:scale-[1.02] overflow-hidden bg-zinc-100 dark:bg-zinc-950">
            <AvatarImage src={avatarUrl || ""} className="object-cover" />
            <AvatarFallback className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 text-zinc-700 dark:text-zinc-200">
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight truncate">
              {user.fullName}
            </h1>
            <Badge
              className={`${roleConf.bg} ${roleConf.color} ${roleConf.ring} ring-1 border-none rounded-full px-3.5 py-1 text-[11px] font-black uppercase tracking-widest`}
            >
              {roleConf.label}
            </Badge>
          </div>

          {/* Metadata Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 text-zinc-600 dark:text-zinc-400 font-bold text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 truncate">
              <Mail size={13} className="text-blue-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.mNumber && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50">
                <Phone size={13} className="text-blue-500 shrink-0" />
                <span>{user.mNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50 uppercase text-[10px] tracking-wider">
              <MapPin size={13} className="text-blue-500 shrink-0" />
              <span>{user.location || "Remote Node"}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50">
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-xs"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 border border-zinc-200/60 dark:border-zinc-700/60 transition-all shadow-xs"
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
