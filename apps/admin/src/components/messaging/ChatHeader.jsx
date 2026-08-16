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
          className="h-10 w-10 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {user?.fullName?.[0] || <UserRound size={16} />}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950"
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
    <header className="flex min-h-18 shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
      <button
        onClick={onBack}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
        aria-label="Back to conversations"
      >
        <ArrowLeft size={18} />
      </button>

      {isDirect ? (
        <HeaderAvatar user={other} online={userOnline} />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
          {selected.type === "discussion" ? (
            <Link2 size={18} />
          ) : (
            <Hash size={18} />
          )}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-black text-zinc-950 dark:text-white">
          {selected.type === "discussion"
            ? selected.entityTitle
            : conversationName(selected, currentUserId)}
        </h2>
        <div className="truncate text-[10px]">
          {typingLabel ? (
            <span className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              <span className="flex gap-0.5 items-center">
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1 w-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
              {typingLabel}
            </span>
          ) : isDirect ? (
            userOnline ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            ) : (
              <span className="text-zinc-500 dark:text-zinc-400 capitalize">
                {other?.role ? `${other.role.replace("_", " ")} · Offline` : "Offline"}
              </span>
            )
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400">{selected.description}</span>
          )}
        </div>
      </div>

      {selected.entityUrl && (
        <a
          href={selected.entityUrl}
          className="hidden rounded-lg border border-zinc-200 px-2.5 py-1.5 text-[10px] font-bold text-blue-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 sm:inline-flex"
        >
          Open content
        </a>
      )}

      {status !== "connected" && (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
          <RefreshCw className="animate-spin" size={12} /> Reconnecting…
        </span>
      )}
    </header>
  );
}

