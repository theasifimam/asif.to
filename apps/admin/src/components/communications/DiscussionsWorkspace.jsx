"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMessaging } from "@/contexts/MessagingContext";
import { errorMessage } from "./api";
import api from "@/lib/axios";
export default function DiscussionsWorkspace() {
  const { socket } = useMessaging();
  const [items, setItems] = useState(null), [error, setError] = useState(""), [search, setSearch] = useState(""), [type, setType] = useState(""), [filter, setFilter] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    const load = () => api.get("/messaging/conversations?overview=discussions", { signal: controller.signal }).then(response => setItems(response.data.data.conversations)).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); });
    load(); socket?.on("new_message", load);
    return () => { controller.abort(); socket?.off("new_message", load); };
  }, [socket]);
  const filtered = items?.filter(item => (!type || item.entityType === type) && (!filter || (filter === "unread" ? item.unreadCount > 0 : item.mentionedMe)) && `${item.entityTitle} ${item.name}`.toLowerCase().includes(search.toLowerCase()));
  const input = "rounded-xl border border-zinc-200 bg-transparent p-2.5 text-sm dark:border-zinc-700";
  return <div className="space-y-4"><div className="flex flex-wrap gap-2"><input aria-label="Search discussions" className={input} placeholder="Search discussions" value={search} onChange={e => setSearch(e.target.value)} /><select aria-label="Content type" className={input} value={type} onChange={e => setType(e.target.value)}><option value="">All supported content</option>{["article", "course", "chapter", "interview_question", "cheatsheet"].map(t => <option key={t}>{t}</option>)}</select><select aria-label="Discussion filter" className={input} value={filter} onChange={e => setFilter(e.target.value)}><option value="">Recently active</option><option value="unread">Unread</option><option value="mentioned">Mentioned me</option></select></div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}{!items && !error && <p role="status">Loading discussions…</p>}{filtered?.map(item => <Link key={item._id} href={`/communications/team?conversation=${item._id}`} className="block rounded-2xl border border-zinc-200 p-4 hover:border-blue-400 dark:border-zinc-800"><div className="flex justify-between gap-3"><h3 className="font-semibold">{item.entityTitle || item.name}</h3>{item.unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">{item.unreadCount} unread</span>}</div><p className="mt-1 text-sm text-zinc-500">{item.entityType} · {item.messageCount} messages · {new Date(item.lastMessageAt).toLocaleString()}</p><p className="mt-2 truncate text-sm">{item.lastMessageText || "Open discussion"}</p></Link>)}{filtered?.length === 0 && <p className="rounded-2xl border p-6 text-sm text-zinc-500">No matching discussions. Use the existing Discuss action on content to start one.</p>}</div>;
}
