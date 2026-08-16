"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, ExternalLink } from "lucide-react";
import { activityApi } from "@/lib/api";

const timeAgo = (date) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date)) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const tone = { info: "bg-blue-500", important: "bg-amber-500", critical: "bg-rose-500" };

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const root = useRef(null);
  const load = async () => { const response = await activityApi.notifications({ limit: 8 }); if (response.success) setData(response.data.data); };
  useEffect(() => { load(); const interval = setInterval(load, 60_000); return () => clearInterval(interval); }, []);
  useEffect(() => { window.addEventListener("notifications:refresh", load); return () => window.removeEventListener("notifications:refresh", load); }, []);
  useEffect(() => { const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  const markRead = async (id) => { await activityApi.markRead(id); load(); };
  const markAll = async () => { await activityApi.markAllRead(); load(); };
  return <div ref={root} className="relative">
    <button onClick={() => setOpen(!open)} aria-label="Notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white xs:flex md:h-10 md:w-10">
      <Bell size={17} />
      {data.unreadCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-blue-600 px-1 text-[9px] font-black leading-4 text-white">{data.unreadCount > 99 ? "99+" : data.unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 z-60 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121215]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 dark:border-zinc-800"><div><p className="text-sm font-black text-zinc-900 dark:text-white">Notifications</p><p className="text-[10px] font-medium text-zinc-500">{data.unreadCount} unread</p></div><button onClick={markAll} disabled={!data.unreadCount} className="text-[10px] font-bold text-blue-600 disabled:opacity-40">Mark all read</button></div>
      <div className="max-h-96 overflow-y-auto">{data.notifications.length ? data.notifications.map((notice) => <div key={notice._id} className={`group flex gap-3 border-b border-zinc-100 px-4 py-3 last:border-0 dark:border-zinc-800 ${!notice.isRead ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${tone[notice.severity]}`} /><div className="min-w-0 flex-1">{notice.url ? <Link href={notice.url} onClick={() => { markRead(notice._id); setOpen(false); }} className="block"><p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{notice.message}</p></Link> : <p className="truncate text-xs font-bold text-zinc-800 dark:text-zinc-100">{notice.message}</p>}<p className="mt-1 text-[10px] text-zinc-500">{notice.activityId?.actorId?.fullName || notice.actorId?.fullName || "System"} · {timeAgo(notice.createdAt)}</p></div>{!notice.isRead && <button onClick={() => markRead(notice._id)} title="Mark as read" className="self-center text-zinc-400 hover:text-blue-600"><Check size={14}/></button>}</div>) : <p className="p-8 text-center text-xs text-zinc-500">You’re all caught up.</p>}</div>
      <Link href="/activity" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 border-t border-zinc-100 px-4 py-3 text-xs font-bold text-blue-600 dark:border-zinc-800">View all activity <ExternalLink size={13}/></Link>
    </div>}
  </div>;
}
