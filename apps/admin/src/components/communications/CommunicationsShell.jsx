"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { hasPermission } from "@/lib/permissions";
import { communicationApi } from "./api";
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
  const { user } = useAuth(),
    { unread, socket } = useMessaging();
  const pathname = usePathname();
  const [inboxUnread, setInboxUnread] = useState(0),
    [query, setQuery] = useState(""),
    [found, setFound] = useState([]);
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
  useEffect(() => {
    document
      .querySelector('nav[aria-label="Communications"] [aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [pathname]);
  const chat =
    pathname.startsWith("/communications/team") ||
    pathname.startsWith("/communications/inbox");
  return (
    <div
      className={
        chat
          ? "flex h-full min-h-0 flex-col bg-white dark:bg-[#0c0c0e]"
          : "h-full min-h-0 overflow-y-auto bg-white dark:bg-[#0c0c0e] p-4 sm:p-6"
      }
    >
      <div
        className={
          chat
            ? "flex h-full min-h-0 flex-col"
            : "mx-auto w-full max-w-375 space-y-4"
        }
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 px-4 py-4 dark:border-zinc-800 sm:px-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
              Communications
            </h1>
            {!chat && (
              <p className="mt-1 text-sm text-zinc-500">
                Conversations, email and your team.
              </p>
            )}
          </div>
          <div className="relative w-48 sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <input
              aria-label="Search communications"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communications..."
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            />
            {query.length > 1 && (
              <div className="absolute right-0 z-40 mt-2 max-h-80 w-80 max-w-[90vw] overflow-y-auto rounded-2xl border bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                {found.map((item, i) => (
                  <Link
                    onClick={() => setQuery("")}
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
        </header>
        <nav
          aria-label="Communications"
          className="flex shrink-0 gap-1 overflow-x-auto scrollbar-none border-b border-zinc-200 px-3 dark:border-zinc-800 sm:px-5"
        >
          {sections
            .filter((item) => hasPermission(user, item.permission))
            .map((item) => {
              const count =
                item.key === "inbox"
                  ? inboxUnread
                  : item.key === "team"
                    ? unread.totalUnread
                    : 0;
              const active = pathname.startsWith(`/communications/${item.key}`);
              return (
                <Link
                  key={item.key}
                  href={`/communications/${item.key}`}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-3.5 py-3 text-sm font-semibold transition-colors motion-reduce:transition-none ${active ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
                >
                  <item.icon className="hidden h-4 w-4 2xl:block" />
                  {item.label}
                  {count > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
        </nav>
        <div
          className={
            chat ? "min-h-0 min-w-0 flex-1 overflow-hidden" : "min-w-0 pt-4"
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
