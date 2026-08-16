"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  ExternalLink,
  BookOpen,
  Code2,
  Bug,
  Terminal,
  FolderPlus,
  Search,
  Bookmark,
  FileCode,
  BookmarkCheck,
  Layers,
  Newspaper,
  Lightbulb,
  Globe2,
  EyeOff,
  Lock,
  Edit3,
  ChevronRight,
  Loader2,
  BookMarked,
} from "lucide-react";

export const LIBRARY_TYPE_CONFIG = {
  note: {
    label: "Note",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: BookOpen,
  },
  cheatsheet: {
    label: "Cheatsheet",
    color:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: FileCode,
  },
  code_snippet: {
    label: "Code Snippet",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    icon: Code2,
  },
  debug_fix: {
    label: "Debug / Fix",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: Bug,
  },
  command: {
    label: "Command",
    color:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Terminal,
  },
  setup_guide: {
    label: "Setup Guide",
    color:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Sparkles,
  },
  interview_note: {
    label: "Interview Note",
    color:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: BookmarkCheck,
  },
  template: {
    label: "Template",
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: Layers,
  },
  mini_article: {
    label: "Mini Article",
    color: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    icon: Newspaper,
  },
  tip: {
    label: "Tip / TIL",
    color:
      "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    icon: Lightbulb,
  },
};

export default function ProfileLibraryTab({
  user,
  isOwnProfile,
  entries = [],
  bookmarks = [],
  collections = [],
  isLoading = false,
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [collectionId, setCollectionId] = useState("all");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesType = typeFilter === "all" || entry.type === typeFilter;
      const matchesCollection =
        collectionId === "all" ||
        (entry.collectionId?._id || entry.collectionId) === collectionId;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${entry.title || ""} ${entry.content || ""} ${entry.tags?.join(" ") || ""}`
          .toLowerCase()
          .includes(q);
      return matchesType && matchesCollection && matchesQuery;
    });
  }, [entries, typeFilter, collectionId, query]);

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      const matchesCollection =
        collectionId === "all" ||
        (b.collectionId?._id || b.collectionId) === collectionId;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        `${b.title || ""} ${b.url || ""} ${b.description || ""} ${b.tags?.join(" ") || ""}`
          .toLowerCase()
          .includes(q);
      return (
        (typeFilter === "all" || typeFilter === "bookmark") &&
        matchesCollection &&
        matchesQuery
      );
    });
  }, [bookmarks, collectionId, query, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Library Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-200/80 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-500/10 dark:border-white/8 dark:bg-linear-to-br dark:from-[#11141f] dark:via-[#131728] dark:to-[#0f111a] dark:text-zinc-100 dark:shadow-2xl dark:shadow-black/60">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-blue-400/20 dark:bg-blue-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-xs dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-3 w-3 text-blue-200 dark:text-blue-400" />
              <span>
                {isOwnProfile
                  ? "Personal Knowledge Hub"
                  : `@${user?.username}'s Library`}
              </span>
            </div>
            <h3 className="mt-2 text-xl sm:text-2xl font-black text-white tracking-tight">
              {isOwnProfile
                ? "Developer Second Brain"
                : "Shared Knowledge & Code Notes"}
            </h3>
            <p className="mt-1 text-xs sm:text-sm font-medium text-blue-100/90 dark:text-zinc-400 max-w-xl">
              {isOwnProfile
                ? "All your saved code snippets, debug fixes, command cheatsheets, and bookmarks in one place."
                : `Public notes, useful fixes, and snippets shared by ${user?.fullName || user?.username}.`}
            </p>
          </div>

          {isOwnProfile && (
            <div className="flex flex-row items-center gap-2 w-full sm:w-auto *:flex-1 sm:*:flex-initial">
              <Link
                href="/library/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 transition active:scale-95 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 text-center whitespace-nowrap"
              >
                <Plus size={15} />
                <span>New knowledge</span>
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-3.5 py-2.5 text-xs font-bold text-white transition active:scale-95 dark:bg-white/6 dark:border-white/10 dark:text-zinc-200 text-center whitespace-nowrap"
              >
                <span>Full Workspace</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Action Chips (For Own Profile) */}
        {isOwnProfile && (
          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-white/15 dark:border-white/10 *:flex-1 *:grow">
            <Link
              href="/library/new?type=note"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 dark:bg-white/4 dark:border-white/8 dark:hover:bg-white/8 px-3 py-1.5 text-[11px] font-bold text-inherit transition text-center whitespace-nowrap"
            >
              <BookOpen
                size={13}
                className="text-blue-300 dark:text-blue-400"
              />
              <span>New Note</span>
            </Link>
            <Link
              href="/library/new?type=code_snippet"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 dark:bg-white/4 dark:border-white/8 dark:hover:bg-white/8 px-3 py-1.5 text-[11px] font-bold text-inherit transition text-center whitespace-nowrap"
            >
              <Code2 size={13} className="text-cyan-300 dark:text-cyan-400" />
              <span>Code Snippet</span>
            </Link>
            <Link
              href="/library/new?type=debug_fix"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 dark:bg-white/4 dark:border-white/8 dark:hover:bg-white/8 px-3 py-1.5 text-[11px] font-bold text-inherit transition text-center whitespace-nowrap"
            >
              <Bug size={13} className="text-rose-300 dark:text-rose-400" />
              <span>Save a Fix</span>
            </Link>
            <Link
              href="/library/new?type=command"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 dark:bg-white/4 dark:border-white/8 dark:hover:bg-white/8 px-3 py-1.5 text-[11px] font-bold text-inherit transition text-center whitespace-nowrap"
            >
              <Terminal
                size={13}
                className="text-amber-300 dark:text-amber-400"
              />
              <span>Command</span>
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 dark:bg-white/4 dark:border-white/8 dark:hover:bg-white/8 px-3 py-1.5 text-[11px] font-bold text-inherit transition text-center whitespace-nowrap"
            >
              <FolderPlus
                size={13}
                className="text-emerald-300 dark:text-emerald-400"
              />
              <span>Collection</span>
            </Link>
          </div>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, code, fixes, tags..."
            className="w-full rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-zinc-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 shadow-xs transition"
          />
        </div>

        {collections.length > 0 && (
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-semibold text-foreground outline-none shadow-xs cursor-pointer"
          >
            <option value="all">All Collections ({collections.length})</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                📁 {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            typeFilter === "all"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
          }`}
        >
          All ({entries.length + bookmarks.length})
        </button>
        {Object.entries(LIBRARY_TYPE_CONFIG).map(([tKey, cfg]) => {
          const count = entries.filter((e) => e.type === tKey).length;
          if (count === 0 && !isOwnProfile) return null;
          const Icon = cfg.icon;
          return (
            <button
              key={tKey}
              type="button"
              onClick={() => setTypeFilter(tKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                typeFilter === tKey
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cfg.label}</span>
              <span className="text-[10px] opacity-75 font-semibold">
                ({count})
              </span>
            </button>
          );
        })}
        {bookmarks.length > 0 && (
          <button
            type="button"
            onClick={() => setTypeFilter("bookmark")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              typeFilter === "bookmark"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
            }`}
          >
            <Bookmark className="w-3 h-3 text-purple-500" />
            <span>Bookmarks</span>
            <span className="text-[10px] opacity-75 font-semibold">
              ({bookmarks.length})
            </span>
          </button>
        )}
      </div>

      {/* Knowledge Entries Grid */}
      {isLoading ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : filteredEntries.length > 0 || filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => {
            const cfg =
              LIBRARY_TYPE_CONFIG[entry.type] || LIBRARY_TYPE_CONFIG.note;
            const Icon = cfg.icon;
            const isPublic = entry.visibility === "public";
            const isUnlisted = entry.visibility === "unlisted";

            return (
              <div
                key={entry._id}
                className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col justify-between gap-4 hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-md transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg.color}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cfg.label}</span>
                    </span>

                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      {isPublic ? (
                        <span
                          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"
                          title="Publicly accessible"
                        >
                          <Globe2 size={13} />
                          <span className="text-[10px] font-bold">Public</span>
                        </span>
                      ) : isUnlisted ? (
                        <span
                          className="inline-flex items-center gap-1 text-amber-500"
                          title="Unlisted link"
                        >
                          <EyeOff size={13} />
                          <span className="text-[10px] font-bold">
                            Unlisted
                          </span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-zinc-400"
                          title="Private knowledge"
                        >
                          <Lock size={13} />
                          <span className="text-[10px] font-bold">Private</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {entry.title}
                  </h4>

                  {entry.content && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                      {entry.content.replace(/[#`*_\-\[\]]/g, "").slice(0, 140)}
                    </p>
                  )}

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-[10px] text-zinc-400 font-semibold">
                          +{entry.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
                  {isOwnProfile ? (
                    <>
                      <Link
                        href={`/library/edit/${entry._id}`}
                        className="inline-flex items-center gap-1 font-bold text-zinc-600 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </Link>
                      <Link
                        href={
                          isPublic && entry.slug
                            ? `/@${user?.username}/${entry.slug}`
                            : `/library`
                        }
                        className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>Open</span>
                        <ChevronRight size={14} />
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/@${user?.username}/${entry.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline ml-auto"
                    >
                      <span>Read Note</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}

          {filteredBookmarks.map((b) => (
            <a
              key={b._id}
              href={b.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-5 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col justify-between gap-4 hover:border-purple-500/40 hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <Bookmark className="w-3 h-3" />
                    <span>Bookmark</span>
                  </span>
                  <span className="text-[11px] font-semibold text-zinc-400 truncate max-w-30">
                    {b.domain}
                  </span>
                </div>

                <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {b.title}
                </h4>

                {b.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                    {b.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>Open Link</span>
                <ExternalLink size={13} />
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-sm text-center flex flex-col items-center gap-3 border border-zinc-100 dark:border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-foreground">
            {query
              ? "No matching notes found"
              : isOwnProfile
                ? "Your Library is Empty"
                : "No Public Notes Yet"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            {query
              ? "Try adjusting your search terms or filters to find what you're looking for."
              : isOwnProfile
                ? "Save code snippets, debug solutions, useful commands and guides so you never lose them again."
                : `@${user?.username} hasn't published any public notes or code snippets yet.`}
          </p>
          {isOwnProfile && (
            <Link
              href="/library/new"
              className="mt-2 px-6 py-2.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
            >
              Create your first note
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
