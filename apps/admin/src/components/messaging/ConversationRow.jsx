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
          className="h-10 w-10 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {user?.fullName?.[0] || <UserRound size={16} />}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950"
          title="Online"
        >
          <span className="h-1 w-1 rounded-full bg-white" />
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
      className={`group relative mb-1.5 flex w-full items-center gap-3 rounded-2xl p-3 text-left border transition-all duration-150 cursor-pointer ${rowStyle}`}
    >
      {/* Left subtle unread accent vertical indicator bar */}
      {hasUnread && !isSelected && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-blue-600 dark:bg-blue-500 shadow-xs" />
      )}

      {conversation.type === "direct" ? (
        <RowAvatar user={member} online={online} />
      ) : (
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
            hasUnread
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
              : "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
          }`}
        >
          {conversation.type === "discussion" ? (
            <Link2 size={17} />
          ) : (
            <Hash size={17} />
          )}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`truncate text-xs ${
              hasUnread
                ? "font-black text-zinc-950 dark:text-white"
                : "font-bold text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {conversation.type === "discussion"
              ? conversation.entityTitle
              : conversationName(conversation, userId)}
          </p>
          <span
            className={`ml-auto shrink-0 text-[9px] ${
              hasUnread
                ? "font-bold text-blue-600 dark:text-blue-400"
                : "text-zinc-400"
            }`}
          >
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          {isTyping ? (
            <p className="truncate text-[10px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              typing…
            </p>
          ) : (
            <p
              className={`truncate text-[10.5px] ${
                hasUnread
                  ? "font-semibold text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {previewText}
            </p>
          )}

          {hasUnread && (
            <span className="ml-auto min-w-5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-500 px-1.5 text-center text-[9px] font-black leading-5 text-white shadow-xs">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

