"use client";

import { ArrowLeft, Hash, Link2, RefreshCw, UserRound } from "lucide-react";
import { avatarUrl, conversationName, otherMember } from "./messaging-utils";

function HeaderAvatar({ user }) {
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

export default function ChatHeader({
  selected,
  currentUserId,
  status,
  onBack,
}) {
  if (!selected) return null;

  const other = otherMember(selected, currentUserId);

  return (
    <header className="flex min-h-18 shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
      <button
        onClick={onBack}
        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
        aria-label="Back to conversations"
      >
        <ArrowLeft size={18} />
      </button>

      {selected.type === "direct" ? (
        <HeaderAvatar user={other} />
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
        <p className="truncate text-[10px] text-zinc-500">
          {selected.type === "direct" ? (
            <span className="capitalize">
              {other?.role?.replace("_", " ")}
            </span>
          ) : (
            selected.description
          )}
        </p>
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
