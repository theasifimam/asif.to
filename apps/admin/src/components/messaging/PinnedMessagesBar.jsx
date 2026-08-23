"use client";

import { Pin } from "lucide-react";
import { parseContentCards } from "./messaging-utils";

function getPinPreview(message) {
  if (message?.deletedAt) return "Message deleted";
  const raw = message?.content;
  if (!raw) return "Attachment";
  const { text, cards } = parseContentCards(raw);
  if (text) return text;
  if (cards.length > 0) return `📎 ${cards[0].title || "Shared content"}`;
  return raw;
}

export default function PinnedMessagesBar({
  pins = [],
  selected,
  onOpenConversation,
}) {
  if (!pins.length) return null;

  return (
    <div className="flex shrink-0 items-center gap-2.5 overflow-x-auto border-b border-zinc-100 bg-amber-50/70 px-4 py-2.5 dark:border-zinc-800 dark:bg-amber-500/10">
      <Pin size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
      <span className="shrink-0 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
        Pinned
      </span>
      {pins.map((pinItem) => (
        <button
          key={pinItem._id}
          onClick={() =>
            pinItem.message &&
            onOpenConversation(selected, pinItem.message._id)
          }
          className="max-w-72 shrink-0 truncate rounded-full bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 cursor-pointer"
        >
          {getPinPreview(pinItem.message)}
        </button>
      ))}
    </div>
  );
}
