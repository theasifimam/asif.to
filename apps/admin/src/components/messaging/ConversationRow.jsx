"use client";

import { useMemo } from "react";
import { Hash, Link2, UserRound } from "lucide-react";
import {
  avatarUrl,
  conversationName,
  formatTime,
  otherMember,
  parseContentCards,
} from "./messaging-utils";
import { useMessaging } from "@/contexts/MessagingContext";

function RowAvatar({ user, online = false }) {
  const source = avatarUrl(user?.avatar);
  return (
    <div className="relative shrink-0">
      {source ? (
        <img
          src={source}
          alt=""
          className="h-11 w-11 shrink-0 rounded-2xl object-cover shadow-2xs border border-zinc-200/60 dark:border-zinc-800"
        />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-200 text-sm font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {user?.fullName?.[0] || <UserRound size={18} />}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950 shadow-2xs"
          title="Online"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}

export default function ConversationRow({
  conversation,
  userId,
  isSelected = false,
  isTyping = false,
  onClick,
}) {
  const { isOnline } = useMessaging();
  const member = otherMember(conversation, userId);
  const online = conversation.type === "direct" && isOnline(member?._id);
  const hasUnread = (conversation.unreadCount || 0) > 0;

  const previewText = useMemo(() => {
    const raw = conversation.lastMessageText;
    if (!raw) {
      return conversation.type !== "direct"
        ? conversation.description
        : "Start a conversation";
    }
    const { text, cards } = parseContentCards(raw);
    if (text) return text;
    if (cards.length > 0) return `📎 ${cards[0].title || "Shared content"}`;
    return raw;
  }, [conversation]);

  // Determine dynamic row style: selected vs unread vs read
  const rowStyle = isSelected
    ? "bg-zinc-100 dark:bg-zinc-800/90 border-zinc-200/90 dark:border-zinc-700/80 shadow-xs"
    : hasUnread
      ? "bg-blue-50/80 dark:bg-blue-950/25 border-blue-200/70 dark:border-blue-900/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/35 shadow-xs"
      : "bg-transparent border-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80";

  return (
    <button
      onClick={onClick}
      className={`group relative mb-1.5 flex w-full items-center gap-3.5 rounded-2xl p-3 sm:p-3.5 text-left border transition-all duration-150 cursor-pointer ${rowStyle}`}
    >
      {/* Left subtle unread accent vertical indicator bar */}
      {hasUnread && !isSelected && (
        <span className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-full bg-blue-600 dark:bg-blue-500 shadow-xs" />
      )}

      {conversation.type === "direct" ? (
        <RowAvatar user={member} online={online} />
      ) : (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
            hasUnread
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
              : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          }`}
        >
          {conversation.type === "discussion" ? (
            <Link2 size={19} />
          ) : (
            <Hash size={19} />
          )}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-sm sm:text-base ${
              hasUnread
                ? "font-black text-zinc-950 dark:text-white"
                : "font-bold text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {conversation.type === "discussion"
              ? conversation.entityTitle
              : conversationName(conversation, userId)}
          </p>
          <span
            className={`ml-auto shrink-0 text-xs font-semibold ${
              hasUnread
                ? "text-blue-600 dark:text-blue-400"
                : "text-zinc-400 dark:text-zinc-500"
            }`}
          >
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          {isTyping ? (
            <p className="truncate text-xs font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              typing…
            </p>
          ) : (
            <p
              className={`truncate text-xs sm:text-sm leading-relaxed ${
                hasUnread
                  ? "font-medium text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {previewText}
            </p>
          )}

          {hasUnread && (
            <span className="ml-auto min-w-5.5 h-5.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500 px-2 flex items-center justify-center text-xs font-black text-white shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
