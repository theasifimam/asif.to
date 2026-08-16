"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { activityApi } from "@/lib/api";

export default function NotificationsPage() {
  const [tab, setTab] = useState("all"); const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const load = async () => { const query = tab === "unread" ? { unread: true } : ["important", "critical"].includes(tab) ? { severity: tab } : {}; const result = await activityApi.notifications({ ...query, limit: 100 }); if (result.success) setData(result.data.data); };
  useEffect(() => { load(); }, [tab]); const allRead = async () => { await activityApi.markAllRead(); load(); };
  return <div className="mx-auto max-w-4xl p-5 sm:p-8"><div className="mb-6 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-blue-600">Inbox</p><h1 className="text-3xl font-black tracking-tight dark:text-white">Notifications</h1></div><button onClick={allRead} className="flex items-center gap-2 text-xs font-bold text-blue-600"><CheckCheck size={15}/> Mark all read</button></div><div className="mb-4 flex gap-2">{["all", "unread", "important", "critical"].map((value) => <button key={value} onClick={() => setTab(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${tab === value ? "bg-blue-600 text-white" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{value}</button>)}</div><div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#121215]">{data.notifications.map((item) => <Link key={item._id} href={item.url || "/activity"} onClick={() => !item.isRead && activityApi.markRead(item._id)} className={`block border-b border-zinc-100 p-4 last:border-0 dark:border-zinc-800 ${!item.isRead ? "bg-blue-50/60 dark:bg-blue-500/5" : ""}`}><p className="text-sm font-bold dark:text-zinc-100">{item.message}</p><p className="mt-1 text-[11px] text-zinc-500">{item.activityId?.actorId?.fullName || "System"} · {new Date(item.createdAt).toLocaleString()}</p></Link>)}{!data.notifications.length && <p className="p-10 text-center text-sm text-zinc-500">No notifications here.</p>}</div></div>;
}
