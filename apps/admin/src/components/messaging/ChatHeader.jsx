"use client";

import { ArrowLeft, Hash, Link2, RefreshCw, UserRound } from "lucide-react";
import { avatarUrl, conversationName, otherMember } from "./messaging-utils";
import { useMessaging } from "@/contexts/MessagingContext";

function HeaderAvatar({ user, online = false }) {
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
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        </span>
      )}
    </div>
  );
}

export default function ChatHeader({
  selected,
  currentUserId,
  status,
  typingUsers = [],
  onBack,
}) {
  const { isOnline } = useMessaging();
  if (!selected) return null;

  const other = otherMember(selected, currentUserId);
  const isDirect = selected.type === "direct";
  const userOnline = isDirect && isOnline(other?._id);

  const activeTypers = Array.isArray(typingUsers)
    ? typingUsers.filter((u) => String(u?._id) !== String(currentUserId))
    : [];

  const typingLabel =
    activeTypers.length === 1
      ? isDirect
        ? "typing…"
        : `${activeTypers[0]?.fullName?.split(" ")[0] || "Someone"} is typing…`
      : activeTypers.length > 1
        ? `${activeTypers.length} people are typing…`
        : null;

  return (
    <header className="flex min-h-18 shrink-0 items-center gap-3.5 border-b border-zinc-200 px-4 py-3.5 dark:border-zinc-800 sm:px-6 bg-white dark:bg-[#0c0c0e]">
      <button
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white md:hidden cursor-pointer transition-colors"
        aria-label="Back to conversations"
      >
        <ArrowLeft size={20} />
      </button>

      {isDirect ? (
        <HeaderAvatar user={other} online={userOnline} />
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {selected.type === "discussion" ? (
            <Link2 size={20} />
          ) : (
            <Hash size={20} />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base sm:text-lg font-black font-outfit text-zinc-950 dark:text-white">
          {selected.type === "discussion"
            ? selected.entityTitle
            : conversationName(selected, currentUserId)}
        </h2>
        <div className="truncate text-xs sm:text-sm mt-0.5">
          {typingLabel ? (
            <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              <span className="flex gap-0.5 items-center">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </span>
              {typingLabel}
            </span>
          ) : isDirect ? (
            userOnline ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400 capitalize font-medium">
                {other?.role
                  ? `${other.role.replace("_", " ")} · Offline`
                  : "Offline"}
              </span>
            )
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">
              {selected.description}
            </span>
          )}
        </div>
      </div>

      {selected.entityUrl && (
        <a
          href={selected.entityUrl}
          className="hidden rounded-full border border-zinc-200 px-3.5 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 sm:inline-flex"
        >
          Open content
        </a>
      )}

      {status !== "connected" && (
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
          <RefreshCw className="animate-spin" size={13} /> Reconnecting…
        </span>
      )}
    </header>
  );
}
