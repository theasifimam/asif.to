"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Pin,
  Reply,
  Trash2,
  UserRound,
} from "lucide-react";
import AttachmentView from "./AttachmentView";
import MessageText from "./MessageText";
import ContentMessageCard from "./ContentMessageCard";
import {
  avatarUrl,
  formatTime,
  getBubbleRadius,
  idOf,
  parseContentCards,
} from "./messaging-utils";

function BubbleAvatar({
  user,
  className = "h-8 w-8 sm:h-9 sm:w-9 rounded-2xl object-cover shadow-2xs border border-zinc-200/80 dark:border-zinc-800/80",
}) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img src={source} alt="" className={className} />
  ) : (
    <span
      className={`flex ${className} items-center justify-center bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
    >
      {user?.fullName?.[0] || <UserRound size={16} />}
    </span>
  );
}

export default function MessageBubble({
  message,
  mine,
  isFirst,
  isMiddle,
  isLast,
  isSingle,
  isSameSenderAsPrev,
  isSameSenderAsNext,
  conversation,
  currentUserId,
  onRetry,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  compact = false,
}) {
  const [actions, setActions] = useState(false);
  const [placement, setPlacement] = useState("top");
  const actionsRef = useRef(null);

  const handleToggleActions = (e) => {
    e.stopPropagation();
    if (!actions) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPlacement(rect.top < 260 ? "bottom" : "top");
      setActions(true);
    } else {
      setActions(false);
    }
  };

  // Dismiss actions menu on click outside or Escape
  useEffect(() => {
    if (!actions) return;

    const handlePointerDown = (e) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target)) {
        setActions(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setActions(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions]);

  const grouped = (message.reactions || []).reduce((acc, curr) => {
    acc[curr.emoji] = acc[curr.emoji] || [];
    acc[curr.emoji].push(curr);
    return acc;
  }, {});

  const bubbleRadius = getBubbleRadius(mine, {
    isFirst,
    isMiddle,
    isLast,
    isSingle,
  });

  // Extract text and inline cards
  const { text: displayText, cards: parsedCards } = useMemo(
    () => parseContentCards(message.content || ""),
    [message.content],
  );

  const displayMessage = useMemo(
    () => ({
      ...message,
      content: displayText,
    }),
    [message, displayText],
  );

  // Combine attachedContent from schema with cards parsed from content string
  const allContentCards = useMemo(() => {
    const fromSchema = message.attachedContent || [];
    const combined = [...fromSchema];
    for (const card of parsedCards) {
      if (
        !combined.some(
          (c) =>
            (c.id || c._id || c.adminUrl) ===
            (card.id || card._id || card.adminUrl),
        )
      ) {
        combined.push(card);
      }
    }
    return combined;
  }, [message.attachedContent, parsedCards]);

  const scrollReply = () => {
    if (!message.replyToMessageId?._id) return;
    const target = document.getElementById(
      `msg-${message.replyToMessageId._id}`,
    );
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("ring-2", "ring-blue-500", "rounded-2xl");
      setTimeout(
        () => target.classList.remove("ring-2", "ring-blue-500", "rounded-2xl"),
        2000,
      );
    }
  };

  return (
    <div
      id={`msg-${message._id || message.clientId}`}
      className={`group relative flex w-full flex-col ${
        mine ? "items-end" : "items-start"
      } ${
        isFirst
          ? "mt-3"
          : isMiddle
            ? "mt-0.5"
            : isLast
              ? "mt-0.5 mb-2.5"
              : "my-2"
      }`}
    >
      <div
        className={`flex max-w-[90%] sm:max-w-[78%] md:max-w-[70%] ${
          compact ? "max-w-[95%] sm:max-w-[90%]" : ""
        } items-end gap-2 ${
          mine ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar for incoming messages */}
        {!mine && (
          <div className="w-8 sm:w-9 shrink-0 flex items-end justify-center mb-0.5">
            {isLast || isSingle ? (
              <BubbleAvatar user={message.senderId} />
            ) : (
              <div className="w-8 sm:w-9" />
            )}
          </div>
        )}

        {/* Bubble & Floating Actions Wrapper */}
        <div className="relative group/bubble flex flex-col">
          {/* Sender name for channel conversations on first message */}
          {!mine && isFirst && conversation?.type !== "direct" && (
            <span className="mb-1 ml-3 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {message.senderId?.fullName || "Team Member"}
            </span>
          )}

          {/* Actual Chat Bubble */}
          <div
            onClick={() => setActions((prev) => !prev)}
            className={`relative transition-all duration-150 cursor-pointer select-text ${bubbleRadius} ${
              compact
                ? "px-3.5 py-2 text-sm"
                : "px-4 py-2.5 sm:px-4.5 sm:py-3 text-sm sm:text-[15px] leading-relaxed"
            } ${
              mine
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-zinc-950 shadow-xs border border-zinc-200/90 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-100"
            }`}
          >
            {/* Reply Quote Reference */}
            {message.replyToMessageId && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollReply();
                }}
                className={`mb-2 block w-full rounded-xl border-l-3 p-2 text-left transition-opacity hover:opacity-100 cursor-pointer ${
                  mine
                    ? "border-white/90 bg-white/15 text-white"
                    : "border-blue-500 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <span className="block text-xs font-bold opacity-95">
                  {message.replyToMessageId.senderId?.fullName || "Team member"}
                </span>
                <span className="block truncate text-xs opacity-85 mt-0.5">
                  {message.replyToMessageId.deletedAt
                    ? "Message deleted"
                    : message.replyToMessageId.content}
                </span>
              </button>
            )}

            {/* Message Body */}
            {message.deletedAt ? (
              <p className="text-sm italic opacity-70">Message deleted</p>
            ) : (
              <>
                {displayText && <MessageText message={displayMessage} />}

                {/* Attached Admin Content Cards */}
                {allContentCards.length > 0 && (
                  <div className="my-2 flex flex-col gap-2">
                    {allContentCards.map((item, idx) => (
                      <ContentMessageCard
                        key={idx}
                        item={item}
                        mine={mine}
                        compact={compact}
                      />
                    ))}
                  </div>
                )}

                {message.attachments?.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {message.attachments.map((file) => (
                      <AttachmentView
                        key={file.attachmentId || file._id}
                        file={file}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Status indicators (Pin / Pending / Failed) */}
            {(message.pin || message.pending || message.failed) && (
              <div
                className={`mt-1.5 flex items-center justify-end gap-1.5 text-xs ${
                  mine ? "text-blue-100/90" : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {message.pin && <Pin size={11} className="ml-0.5" />}
                {message.pending && <span>Sending…</span>}
                {message.failed && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRetry) onRetry();
                    }}
                    className="font-bold text-rose-200 underline cursor-pointer"
                  >
                    Failed · Retry
                  </button>
                )}
              </div>
            )}

            {/* Floating Reaction Badges */}
            {Object.keys(grouped).length > 0 && (
              <div
                className={`absolute -bottom-3 flex flex-wrap gap-1 z-10 ${
                  mine ? "right-2" : "left-2"
                }`}
              >
                {Object.entries(grouped).map(([emoji, items]) => (
                  <button
                    key={emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      onReact(emoji);
                    }}
                    className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold shadow-xs transition-transform active:scale-110 cursor-pointer ${
                      items.some(
                        (item) => idOf(item.userId) === String(currentUserId),
                      )
                        ? "border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-500/40 dark:bg-blue-950 dark:text-blue-300"
                        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    <span>{emoji}</span>
                    {items.length > 1 && <span>{items.length}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Button on Hover */}
          {!message.pending && !message.deletedAt && (
            <div ref={actionsRef} className="contents">
              <button
                onClick={handleToggleActions}
                className={`absolute top-1/2 -translate-y-1/2 z-10 hidden rounded-full border border-zinc-200 bg-white p-1.5 text-zinc-500 shadow-xs transition hover:bg-zinc-100 group-hover:block dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 ${
                  mine ? "-left-9" : "-right-9"
                }`}
              >
                <MoreHorizontal size={15} />
              </button>

              {/* Actions Popover Menu */}
              {actions && (
                <div
                  className={`absolute z-30 flex w-48 sm:w-52 flex-col rounded-2xl border border-zinc-200/90 bg-white/95 backdrop-blur-md p-1.5 text-sm font-semibold shadow-2xl dark:border-zinc-800/90 dark:bg-[#18181c]/95 max-w-[calc(100vw-2.5rem)] animate-in fade-in zoom-in-95 duration-100 ${
                    placement === "bottom"
                      ? mine
                        ? "right-0 top-full mt-2 origin-top-right"
                        : "left-0 top-full mt-2 origin-top-left"
                      : mine
                        ? "right-0 bottom-full mb-2 origin-bottom-right"
                        : "left-0 bottom-full mb-2 origin-bottom-left"
                  }`}
                >
                  <div className="flex justify-between gap-1 px-1.5 py-1">
                    {["👍", "❤️", "🔥", "😂", "🎉"].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onReact(emoji);
                          setActions(false);
                        }}
                        className="rounded-xl p-1.5 text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-transform active:scale-125 cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800/80" />
                  <button
                    onClick={() => {
                      onReply();
                      setActions(false);
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Reply size={15} /> Reply
                  </button>
                  {mine && (
                    <button
                      onClick={() => {
                        onEdit();
                        setActions(false);
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onPin();
                      setActions(false);
                    }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    <Pin size={15} /> {message.pin ? "Unpin" : "Pin"}
                  </button>
                  {mine && (
                    <button
                      onClick={() => {
                        onDelete();
                        setActions(false);
                      }}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Time & Read/Delivery indicators below bubble */}
          <div
            className={`mt-1 flex items-center gap-1.5 px-2 text-xs text-zinc-400 dark:text-zinc-500 font-medium ${
              mine ? "justify-end" : "justify-start"
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
