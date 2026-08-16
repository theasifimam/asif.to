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

function RowAvatar({ user }) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img
      src={source}
      alt=""
      className="h-10 w-10 shrink-0 rounded-xl object-cover"
    />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {user?.fullName?.[0] || <UserRound size={16} />}
    </span>
  );
}

export default function ConversationRow({ conversation, userId, onClick }) {
  const member = otherMember(conversation, userId);

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

  return (
    <button
      onClick={onClick}
      className="mb-1 flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
    >
      {conversation.type === "direct" ? (
        <RowAvatar user={member} />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
          {conversation.type === "discussion" ? (
            <Link2 size={17} />
          ) : (
            <Hash size={17} />
          )}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-xs font-black text-zinc-800 dark:text-zinc-100">
            {conversation.type === "discussion"
              ? conversation.entityTitle
              : conversationName(conversation, userId)}
          </p>
          <span className="ml-auto shrink-0 text-[9px] text-zinc-400">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="truncate text-[10px] text-zinc-500">
            {previewText}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-auto min-w-5 shrink-0 rounded-full bg-emerald-600 px-1.5 text-center text-[9px] font-black leading-5 text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
