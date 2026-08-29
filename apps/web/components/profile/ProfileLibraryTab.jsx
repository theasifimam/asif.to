"use client";

import LogoLoader from "@/components/ui/LogoLoader";
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
  BookMarked,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    <div className="space-y-4">
      {/* Main Knowledge Card Container */}
      <div className="rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-xs border border-zinc-200/70 dark:border-zinc-800 p-5 sm:p-7 space-y-5">
        {/* Top Controls: Type/Collection Selectors & Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          {/* Left: Filters & Search */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Type Selector */}
            <div className="w-full sm:w-52 shrink-0">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-bold text-foreground">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl max-h-80">
                  <SelectItem value="all">
                    <span className="flex items-center gap-2">
                      <span>All Knowledge</span>
                      <span className="text-[10px] opacity-60 font-mono">
                        ({entries.length + bookmarks.length})
                      </span>
                    </span>
                  </SelectItem>
                  {Object.entries(LIBRARY_TYPE_CONFIG).map(([tKey, cfg]) => {
                    const count = entries.filter((e) => e.type === tKey).length;
                    if (count === 0 && !isOwnProfile) return null;
                    const Icon = cfg.icon;
                    return (
                      <SelectItem key={tKey} value={tKey}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{cfg.label}</span>
                          <span className="text-[10px] opacity-60 font-mono">
                            ({count})
                          </span>
                        </span>
                      </SelectItem>
                    );
                  })}
                  {bookmarks.length > 0 && (
                    <SelectItem value="bookmark">
                      <span className="flex items-center gap-2">
                        <Bookmark className="w-3.5 h-3.5 text-purple-500" />
                        <span>Bookmarks</span>
                        <span className="text-[10px] opacity-60 font-mono">
                          ({bookmarks.length})
                        </span>
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Collection Selector */}
            {collections.length > 0 && (
              <div className="w-full sm:w-44 shrink-0">
                <Select value={collectionId} onValueChange={setCollectionId}>
                  <SelectTrigger className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 px-3.5 py-2.5 text-xs font-bold text-foreground">
                    <SelectValue placeholder="All Collections" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl">
                    <SelectItem value="all">
                      All Collections ({collections.length})
                    </SelectItem>
                    {collections.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        📁 {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-64 grow sm:grow-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, code, fixes, tags..."
                className="w-full rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-zinc-400 outline-none focus:border-blue-500 dark:focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Right: Action Buttons (For Own Profile) */}
          {isOwnProfile && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/library/new"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition active:scale-95"
              >
                <Plus size={14} />
                <span>New Knowledge</span>
              </Link>
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/80 px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition active:scale-95"
              >
                <span>Full Workspace</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Quick Create Shortcuts (For Own Profile) */}
        {isOwnProfile && (
          <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mr-1 hidden sm:inline-block">
              Quick Add:
            </span>
            <Link
              href="/library/new?type=note"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/40 px-3 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 transition active:scale-95"
            >
              <BookOpen size={12} className="text-blue-500" />
              <span>Note</span>
            </Link>
            <Link
              href="/library/new?type=code_snippet"
              className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 border border-cyan-200/60 dark:border-cyan-800/40 px-3 py-1.5 text-[11px] font-bold text-cyan-700 dark:text-cyan-300 transition active:scale-95"
            >
              <Code2 size={12} className="text-cyan-500" />
              <span>Snippet</span>
            </Link>
            <Link
              href="/library/new?type=debug_fix"
              className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-800/40 px-3 py-1.5 text-[11px] font-bold text-rose-700 dark:text-rose-300 transition active:scale-95"
            >
              <Bug size={12} className="text-rose-500" />
              <span>Fix</span>
            </Link>
            <Link
              href="/library/new?type=command"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200/60 dark:border-amber-800/40 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 transition active:scale-95"
            >
              <Terminal size={12} className="text-amber-500" />
              <span>Command</span>
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 transition active:scale-95"
            >
              <FolderPlus size={12} className="text-emerald-500" />
              <span>Collection</span>
            </Link>
          </div>
        )}

        {/* Knowledge Entries Grid */}
        {isLoading ? (
          <div className="p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-950/60 shadow-xs flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
            <LogoLoader className="w-6 h-6  text-blue-500"  />
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
                  className="group p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-950/70 shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col justify-between gap-4 hover:border-blue-500/40 dark:hover:border-blue-500/30 hover:shadow-md transition-all"
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
                            <span className="text-[10px] font-bold">
                              Public
                            </span>
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
                            <span className="text-[10px] font-bold">
                              Private
                            </span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {entry.title}
                    </h4>

                    {entry.content && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-normal">
                        {entry.content
                          .replace(/[#`*_\-\[\]]/g, "")
                          .slice(0, 140)}
                      </p>
                    )}

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {entry.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md"
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

                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
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
                              ? `/${user?.username}/${entry.slug}`
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
                        href={`/${user?.username}/${entry.slug}`}
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
                className="group p-5 rounded-3xl bg-zinc-50/70 dark:bg-zinc-950/70 shadow-xs border border-zinc-200/60 dark:border-zinc-800/80 flex flex-col justify-between gap-4 hover:border-purple-500/40 hover:shadow-md transition-all"
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

                <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Open Link</span>
                  <ExternalLink size={13} />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 text-center flex flex-col items-center gap-3">
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
    </div>
  );
}
