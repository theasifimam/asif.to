"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useMessaging } from "@/contexts/MessagingContext";

export default function MessageHeaderButton() {
  const { unread } = useMessaging();
  return <Link href="/messages" aria-label={`${unread.totalUnread} unread messages`} className="relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:h-10 md:w-10">
    <MessageSquare size={17}/>
    {unread.totalUnread > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-emerald-600 px-1 text-center text-[9px] font-black leading-4 text-white">{unread.totalUnread > 99 ? "99+" : unread.totalUnread}</span>}
  </Link>;
}
