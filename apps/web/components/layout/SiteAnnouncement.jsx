"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Info,
  X,
} from "lucide-react";
import { API_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

const TYPE_STYLES = {
  maintenance: {
    container:
      "border-purple-400/50 bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/20",
    iconBg: "bg-white/20 text-white",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  info: {
    container:
      "border-blue-400/50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/20",
    iconBg: "bg-white/20 text-white",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  warning: {
    container:
      "border-amber-400/50 bg-gradient-to-r from-amber-600 via-amber-600 to-orange-700 text-white shadow-lg shadow-amber-600/20",
    iconBg: "bg-white/20 text-white",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
  success: {
    container:
      "border-emerald-400/50 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20",
    iconBg: "bg-white/20 text-white",
    badge: "bg-black/25 text-white border border-white/25",
    link: "text-white hover:text-white/80",
  },
};

const TYPE_ICONS = {
  maintenance: CalendarClock,
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
};

function formatWindow(start, end) {
  if (!start && !end) return "";
  const formatter = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  if (start && end)
    return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
  return start
    ? `Starts ${formatter.format(new Date(start))}`
    : `Until ${formatter.format(new Date(end))}`;
}

function dismissalKey(item) {
  return `asif-site-announcement:${item?._id || "site-header"}:${item?.updatedAt || "current"}`;
}

export default function SiteAnnouncement({ isNavVisible = true }) {
  const [announcement, setAnnouncement] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    if (!API_URL) return;
    try {
      const response = await fetch(`${API_URL}/announcements/public`, {
        cache: "no-store",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!response.ok) return;
      const body = await response.json();
      const item = body.data || null;
      setAnnouncement(item);
      setDismissed(
        Boolean(
          item &&
          item.dismissible &&
          window.localStorage.getItem(dismissalKey(item)),
        ),
      );
    } catch {
      // Public navigation should remain usable when the announcement API is unavailable.
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(load, 0);
    const interval = window.setInterval(load, 60_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [load]);

  const schedule = useMemo(
    () => formatWindow(announcement?.eventStartsAt, announcement?.eventEndsAt),
    [announcement?.eventEndsAt, announcement?.eventStartsAt],
  );

  if (!announcement || dismissed) return null;

  const Icon = TYPE_ICONS[announcement.type] || Info;
  const styles = TYPE_STYLES[announcement.type] || TYPE_STYLES.info;
  const externalLink = /^https?:\/\//i.test(announcement.linkUrl || "");

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissalKey(announcement), "dismissed");
    } catch {
      // Dismiss for the current visit even when private browsing blocks storage.
    }
    setDismissed(true);
  };

  return (
    <>
      <div aria-hidden="true" className="h-14 sm:h-16" />
      <aside
        aria-label="Site announcement"
        aria-live="polite"
        className={`fixed left-0 top-20 z-40 w-full px-2 transition-all duration-300 md:top-21 md:px-8 ${
          isNavVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-28 pointer-events-none opacity-0"
        }`}
      >
        <div
          className={cn(
            "mx-auto max-w-7xl overflow-hidden rounded-full border transition-all duration-300 text-white backdrop-blur-md",
            styles.container,
            expanded && "rounded-3xl",
          )}
        >
          <div className="flex min-h-11 items-center gap-2.5 px-3 py-2 sm:gap-3 sm:px-4">
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold",
                styles.iconBg,
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-2">
              {announcement.title && (
                <p className="truncate text-xs font-black sm:max-w-64 sm:text-xs tracking-tight text-white">
                  {announcement.title}
                </p>
              )}
              {announcement.title && announcement.message && (
                <span className="hidden text-white/50 sm:inline text-xs">
                  •
                </span>
              )}
              {announcement.message && (
                <p className="line-clamp-1 text-[11px] font-medium text-white/90 sm:text-xs">
                  {announcement.message}
                </p>
              )}
            </div>
            {schedule && (
              <span
                className={cn(
                  "hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold lg:inline text-white",
                  styles.badge,
                )}
              >
                {schedule}
              </span>
            )}
            {announcement.linkUrl && (
              <a
                href={announcement.linkUrl}
                target={externalLink ? "_blank" : undefined}
                rel={externalLink ? "noreferrer" : undefined}
                className={cn(
                  "hidden shrink-0 items-center gap-1 text-xs font-black underline underline-offset-2 text-white sm:flex",
                  styles.link,
                )}
              >
                {announcement.linkLabel || "Learn more"}
                {externalLink && <ExternalLink className="h-3 w-3" />}
              </a>
            )}
            {(announcement.details || schedule || announcement.linkUrl) && (
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/20 text-white"
                title="More information"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
            {announcement.dismissible && (
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss announcement"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/20 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {expanded && (
            <div className="border-t border-white/20 px-4 py-3 text-xs leading-5 text-white">
              {schedule && (
                <p className="font-black lg:hidden text-white mb-1">
                  {schedule}
                </p>
              )}
              {announcement.details && (
                <p className="whitespace-pre-line text-white/90 font-medium">
                  {announcement.details}
                </p>
              )}
              {announcement.linkUrl && (
                <a
                  href={announcement.linkUrl}
                  target={externalLink ? "_blank" : undefined}
                  rel={externalLink ? "noreferrer" : undefined}
                  className={cn(
                    "mt-2.5 inline-flex items-center gap-1 font-black underline underline-offset-2 sm:hidden text-white",
                    styles.link,
                  )}
                >
                  {announcement.linkLabel || "Learn more"}
                  {externalLink && <ExternalLink className="h-3 w-3" />}
                </a>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
