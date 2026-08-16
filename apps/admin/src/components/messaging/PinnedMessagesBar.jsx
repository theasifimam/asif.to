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
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-b border-zinc-100 bg-amber-50/60 px-4 py-2 dark:border-zinc-800 dark:bg-amber-500/5">
      <Pin size={12} className="shrink-0 text-amber-600" />
      <span className="shrink-0 text-[9px] font-black uppercase text-amber-700">
        Pinned
      </span>
      {pins.map((pinItem) => (
        <button
          key={pinItem._id}
          onClick={() =>
            pinItem.message &&
            onOpenConversation(selected, pinItem.message._id)
          }
          className="max-w-64 shrink-0 truncate rounded-lg bg-white px-2.5 py-1 text-[10px] text-zinc-600 shadow-xs transition hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
        >
          {getPinPreview(pinItem.message)}
        </button>
      ))}
    </div>
  );
}
