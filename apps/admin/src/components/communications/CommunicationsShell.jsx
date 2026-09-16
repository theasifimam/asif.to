"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Send,
  Users,
  Workflow,
  MailCheck,
  FileText,
  MessageSquare,
  MessagesSquare,
  ChartNoAxesCombined,
  Settings,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { hasPermission } from "@/lib/permissions";
import { communicationApi } from "./api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const sections = [
  [
    "inbox",
    "Inbox",
    Inbox,
    "inbox.read",
    "Customer enquiries and email threads",
  ],
  [
    "campaigns",
    "Campaigns",
    Send,
    "campaigns.read",
    "Newsletters and subscriber announcements",
  ],
  [
    "subscribers",
    "Subscribers",
    Users,
    "subscribers.read",
    "Consent, interests and suppression",
  ],
  [
    "automations",
    "Automations",
    Workflow,
    "automations.manage",
    "Event-based communication workflows",
  ],
  [
    "transactional",
    "Transactional",
    MailCheck,
    "transactional.read",
    "System email delivery and failures",
  ],
  [
    "templates",
    "Templates",
    FileText,
    "templates.manage",
    "Reusable support and email content",
  ],
  [
    "team",
    "Team",
    MessageSquare,
    "messages.view",
    "Existing team chat, presence and mentions",
  ],
  [
    "discussions",
    "Discussions",
    MessagesSquare,
    "messages.view",
    "Conversations attached to content",
  ],
  [
    "analytics",
    "Analytics",
    ChartNoAxesCombined,
    "analytics.read",
    "Support, delivery and subscriber metrics",
  ],
  [
    "settings",
    "Settings",
    Settings,
    "settings.manage",
    "Senders, topics, routing and email health",
  ],
].map(([key, label, icon, permission, description]) => ({
  key,
  label,
  icon,
  permission: permission.startsWith("messages.")
    ? permission
    : `communications.${permission}`,
  description,
}));

export default function CommunicationsShell({ children }) {
  const { user } = useAuth();
  const { unread, socket } = useMessaging();
  const pathname = usePathname();
  const router = useRouter();
  const [inboxUnread, setInboxUnread] = useState(0);
  const [query, setQuery] = useState("");
  const [found, setFound] = useState([]);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!hasPermission(user, "communications.inbox.read")) return;
    const load = () =>
      communicationApi("/inbox?limit=1")
        .then((data) => setInboxUnread(data.unread))
        .catch(() => {});
    load();
    socket?.on("communications:updated", load);
    return () => socket?.off("communications:updated", load);
  }, [user, socket]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (query.trim().length > 1)
        communicationApi(`/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
          .then((data) => setFound(data.items))
          .catch(() => {});
      else setFound([]);
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const currentSection = sections.find((s) =>
    pathname.startsWith(`/communications/${s.key}`)
  );
  const activeKey = currentSection ? currentSection.key : "inbox";

  const chat =
    pathname.startsWith("/communications/team") ||
    pathname.startsWith("/communications/inbox");

  return (
    <div
      className={
        chat
          ? "flex h-full min-h-0 flex-col bg-white dark:bg-[#0c0c0e]"
          : "h-full min-h-0 overflow-y-auto bg-zinc-50/50 dark:bg-[#09090b]"
      }
    >
      {chat ? (
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 px-4 py-3.5 dark:border-zinc-800 sm:px-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white truncate">
                Communications
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Select
                value={activeKey}
                onValueChange={(val) => router.push(`/communications/${val}`)}
              >
                <SelectTrigger className="h-10 w-36 sm:w-48 rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-xs sm:text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-none">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 z-10050">
                  {sections
                    .filter((item) => hasPermission(user, item.permission))
                    .map((item) => {
                      const count =
                        item.key === "inbox"
                          ? inboxUnread
                          : item.key === "team"
                          ? unread.totalUnread
                          : 0;
                      const IconComponent = item.icon;
                      return (
                        <SelectItem
                          key={item.key}
                          value={item.key}
                          className="rounded-xl py-2 px-3 text-xs sm:text-sm font-medium"
                        >
                          <div className="flex items-center justify-between gap-3 w-full min-w-0">
                            <div className="flex items-center gap-2 truncate">
                              <IconComponent className="h-4 w-4 shrink-0 text-zinc-400" />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {count > 0 && (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                                {count}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>

              {!isSearchExpanded && !query ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchExpanded(true);
                    setTimeout(() => searchInputRef.current?.focus(), 50);
                  }}
                  aria-label="Search communications"
                  title="Search communications"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              ) : (
                <div className="relative w-44 sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    aria-label="Search communications"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsSearchExpanded(true)}
                    onBlur={() => {
                      if (!query) {
                        setTimeout(() => setIsSearchExpanded(false), 150);
                      }
                    }}
                    placeholder="Search..."
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-8 text-xs sm:text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setIsSearchExpanded(false);
                    }}
                    className="absolute right-2 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {query.length > 1 && (
                    <div className="absolute right-0 z-40 mt-2 max-h-80 w-72 sm:w-80 max-w-[90vw] overflow-y-auto rounded-2xl border bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                      {found.map((item, i) => (
                        <Link
                          onClick={() => {
                            setQuery("");
                            setIsSearchExpanded(false);
                          }}
                          key={`${item.url}:${i}`}
                          href={item.url}
                          className="block rounded-xl p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <span className="text-xs text-blue-500">{item.type}</span>
                          <p className="truncate text-sm font-semibold">
                            {item.title}
                          </p>
                        </Link>
                      ))}
                      {!found.length && (
                        <p className="p-3 text-sm text-zinc-500">
                          No matching communications.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>
        </div>
      ) : (
        <div className="min-w-0 pb-6">{children}</div>
      )}
    </div>
  );
}
