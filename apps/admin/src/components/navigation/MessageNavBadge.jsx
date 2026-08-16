"use client";

import { useMessaging } from "@/contexts/MessagingContext";

export default function MessageNavBadge({ compact = false }) {
  const { unread } = useMessaging();
  if (!unread.totalUnread) return null;
  return <span className={`${compact ? "absolute right-1 top-1" : "ml-auto"} min-w-5 rounded-full bg-emerald-600 px-1.5 text-center text-[9px] font-black leading-5 text-white`}>{unread.totalUnread > 99 ? "99+" : unread.totalUnread}</span>;
}
