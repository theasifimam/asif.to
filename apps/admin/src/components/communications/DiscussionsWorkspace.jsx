"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  MessagesSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogoLoader from "@/components/ui/LogoLoader";
import { useMessaging } from "@/contexts/MessagingContext";
import { errorMessage } from "./api";
import api from "@/lib/axios";

function formatDiscussionDate(dateString) {
  if (!dateString) return "No recent activity";
  const date = new Date(dateString);
  if (isNaN(date.getTime()) || date.getFullYear() <= 1970) {
    return "No recent activity";
  }
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const CONTENT_TYPES = [
  { value: "all", label: "All supported content" },
  { value: "article", label: "Article" },
  { value: "course", label: "Course" },
  { value: "chapter", label: "Chapter" },
  { value: "interview_question", label: "Interview Question" },
  { value: "cheatsheet", label: "Cheatsheet" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "Recently active" },
  { value: "unread", label: "Unread" },
  { value: "mentioned", label: "Mentioned me" },
];

export default function DiscussionsWorkspace() {
  const { socket } = useMessaging();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      api
        .get("/messaging/conversations?overview=discussions", {
          signal: controller.signal,
        })
        .then((response) => setItems(response.data.data.conversations))
        .catch((e) => {
          if (!controller.signal.aborted) setError(errorMessage(e));
        });
    load();
    socket?.on("new_message", load);
    return () => {
      controller.abort();
      socket?.off("new_message", load);
    };
  }, [socket]);

  const filtered = items?.filter((item) => {
    const matchType = !type || type === "all" || item.entityType === type;
    const matchFilter =
      !filter ||
      filter === "all" ||
      (filter === "unread" ? item.unreadCount > 0 : item.mentionedMe);
    const matchSearch =
      !search.trim() ||
      `${item.entityTitle || ""} ${item.name || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchType && matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input with Shadcn Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <Input
            aria-label="Search discussions"
            placeholder="Search discussions by title or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs focus-visible:ring-blue-500/20 text-xs font-medium"
          />
        </div>

        {/* Filters Row using Shadcn Select */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={type} onValueChange={(val) => setType(val)}>
            <SelectTrigger className="h-11 w-48 rounded-2xl border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs text-xs font-medium">
              <SelectValue placeholder="Content type" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800">
              {CONTENT_TYPES.map((t) => (
                <SelectItem
                  key={t.value}
                  value={t.value}
                  className="text-xs font-medium rounded-xl cursor-pointer"
                >
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter} onValueChange={(val) => setFilter(val)}>
            <SelectTrigger className="h-11 w-44 rounded-2xl border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-xs text-xs font-medium">
              <SelectValue placeholder="Discussion filter" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800">
              {FILTER_OPTIONS.map((f) => (
                <SelectItem
                  key={f.value}
                  value={f.value}
                  className="text-xs font-medium rounded-xl cursor-pointer"
                >
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {!items && !error && (
        <div className="flex flex-col items-center justify-center min-h-60 gap-3">
          <LogoLoader className="h-8 w-8 text-blue-600" />
          <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
            Loading discussions…
          </span>
        </div>
      )}

      {/* Discussions Cards Grid */}
      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {filtered.map((item) => (
            <Link
              key={item._id}
              href={`/communications/team?conversation=${item._id}`}
              className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/40 hover:shadow-md dark:border-zinc-800/80 dark:bg-[#121215] dark:hover:border-blue-500/40"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <MessagesSquare className="h-5 w-5" />
                    </span>
                    <h3 className="truncate text-sm font-black text-zinc-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.entityTitle || item.name}
                    </h3>
                  </div>

                  {item.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                      {item.unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {item.entityType && (
                    <span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.entityType}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                    <MessageSquare className="h-3 w-3" /> {item.messageCount || 0}{" "}
                    {item.messageCount === 1 ? "message" : "messages"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                    <Clock className="h-3 w-3" />{" "}
                    {formatDiscussionDate(item.lastMessageAt)}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.lastMessageText || "Open discussion"}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800/60">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 group-hover:underline">
                  Open discussion
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filtered?.length === 0 && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-black text-zinc-900 dark:text-white">
            No matching discussions
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            Use the existing Discuss action on content pages to start a new
            discussion, or adjust your filters.
          </p>
        </div>
      )}
    </div>
  );
}
