"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { messagingApi } from "@/lib/api";
import {
  avatarUrl,
  conversationName,
  encodeContentCards,
  idOf,
  otherMember,
} from "./messaging-utils";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

function DockAvatar({ user, className = "h-8 w-8 rounded-xl" }) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img src={source} alt="" className={`${className} shrink-0 object-cover`} />
  ) : (
    <span
      className={`flex ${className} shrink-0 items-center justify-center bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
    >
      {user?.fullName?.[0] || <UserRound size={14} />}
    </span>
  );
}

export default function FloatingChatDock({ isNavVisible = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { socket, unread, refreshUnread } = useMessaging();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachedContent, setAttachedContent] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const currentUserId = user?._id || user?.id;

  const loadConversations = useCallback(async (term = "") => {
    setLoading(true);
    const result = await messagingApi.conversations(term ? { search: term } : {});
    if (result.success) {
      setConversations(result.data.data.conversations);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen && !selected) {
      loadConversations(search);
    }
  }, [isOpen, selected, search, loadConversations]);

  const openConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) return;
      setSelected(conversation);
      setLoading(true);
      const result = await messagingApi.messages(conversation._id, { limit: 30 });
      if (result.success) {
        setMessages(result.data.data.messages);
        requestAnimationFrame(() => {
          if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        });
        socket?.emit("conversation:join", { conversationId: conversation._id });
        await messagingApi.markRead(conversation._id);
        refreshUnread();
      }
      setLoading(false);
    },
    [socket, refreshUnread],
  );

  useEffect(() => {
    if (!socket || !selected) return;

    const onMessage = (message) => {
      if (idOf(message.conversationId) === idOf(selected._id)) {
        setMessages((items) => {
          const index = items.findIndex(
            (item) =>
              idOf(item) === idOf(message) ||
              (message.clientId && item.clientId === message.clientId),
          );
          if (index >= 0) {
            return items.map((item, itemIndex) =>
              itemIndex === index ? message : item,
            );
          }
          return [...items, message];
        });
        messagingApi.markRead(message.conversationId).then(refreshUnread);
        requestAnimationFrame(() => {
          if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
        });
      }
    };

    socket.on("new_message", onMessage);
    return () => {
      socket.off("new_message", onMessage);
    };
  }, [socket, selected, refreshUnread]);

  const send = async () => {
    const text = content.trim();
    if ((!text && !attachments.length && !attachedContent.length) || !selected) return;

    const clientId = `${user?._id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sendAttachments = attachments;
    const sendContent = attachedContent;
    const fullContent = encodeContentCards(text, sendContent);
    const options = {
      replyToMessageId: replyTo?._id,
      attachmentIds: sendAttachments.map((item) => item.attachmentId || item._id),
      attachedContent: sendContent,
    };

    setContent("");
    setReplyTo(null);
    setAttachments([]);
    setAttachedContent([]);
    setMessages((items) => [
      ...items,
      {
        _id: `pending-${clientId}`,
        clientId,
        conversationId: selected._id,
        senderId: user,
        content: fullContent,
        replyToMessageId: replyTo,
        attachments: sendAttachments,
        attachedContent: sendContent,
        createdAt: new Date().toISOString(),
        pending: true,
      },
    ]);

    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });

    if (socket?.connected) {
      socket.emit("message:send", {
        conversationId: selected._id,
        content: fullContent,
        clientId,
        ...options,
      });
    } else {
      await messagingApi.send(selected._id, fullContent, clientId, options);
    }
  };

  // Do not render floating dock on the main full-screen /messages page
  if (pathname?.startsWith("/messages")) {
    return null;
  }

  const other = selected ? otherMember(selected, currentUserId) : null;
  const bottomOffset = isNavVisible ? "bottom-20 lg:bottom-4" : "bottom-4";

  return (
    <div className={`hidden sm:block fixed right-4 z-40 transition-all duration-300 ${bottomOffset}`}>
      {!isOpen ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => {
            setIsOpen(true);
            if (!selected) loadConversations();
          }}
          className="flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-zinc-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/50 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <MessageSquare size={14} />
            </span>
            {unread.totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-black text-white">
                {unread.totalUnread}
              </span>
            )}
          </div>
          <span className="font-outfit text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Messages
          </span>
          <ChevronUp size={14} className="text-zinc-400" />
        </button>
      ) : (
        /* Expanded LinkedIn/Instagram-style Chat Dock Window */
        <div className="flex h-[470px] sm:h-[500px] w-[320px] sm:w-[360px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/70 animate-in fade-in zoom-in-95 duration-150">
          {/* Dock Header */}
          <div className="flex h-12 sm:h-13 shrink-0 items-center justify-between border-b border-zinc-200/80 px-3 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2">
              {selected ? (
                <>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    ‹ Back
                  </button>
                  <DockAvatar user={other} className="h-6 w-6 rounded-full" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {selected.type === "discussion"
                        ? selected.entityTitle
                        : conversationName(selected, currentUserId)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <MessageSquare size={13} />
                  </span>
                  <h3 className="font-outfit text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Messages
                  </h3>
                  {unread.totalUnread > 0 && (
                    <span className="rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-black text-white">
                      {unread.totalUnread}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5">
              {selected && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/messages?conversation=${selected._id}`);
                  }}
                  title="Open full page"
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
                >
                  <ExternalLink size={13} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Dock Content Body */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#121215]">
            {!selected ? (
              /* Conversation Picker List */
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search messages..."
                      className="h-7.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-2 text-[11px] outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-1.5 space-y-0.5">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-zinc-400">Loading...</div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conv) => {
                      const member = otherMember(conv, currentUserId);
                      return (
                        <button
                          key={conv._id}
                          onClick={() => openConversation(conv)}
                          className="flex w-full items-center gap-2 rounded-xl p-2 text-left transition hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
                        >
                          <DockAvatar user={member} className="h-7 w-7 rounded-xl" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                {conv.type === "discussion"
                                  ? conv.entityTitle
                                  : conversationName(conv, currentUserId)}
                              </p>
                              {conv.unreadCount > 0 && (
                                <span className="rounded-full bg-emerald-600 px-1.5 text-[8.5px] font-black text-white">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="truncate text-[10px] text-zinc-400">
                              {conv.lastMessageText || "Start a conversation"}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-zinc-400">
                      No conversations yet.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Live Mini Chat View */
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div
                  ref={listRef}
                  className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/50 p-2.5 dark:bg-zinc-950/40 space-y-1"
                >
                  {messages.map((message, index) => {
                    const prev = messages[index - 1];
                    const next = messages[index + 1];
                    const isMine = idOf(message.senderId) === String(currentUserId);

                    const isSameSenderAsPrev = Boolean(
                      prev && idOf(prev.senderId) === idOf(message.senderId)
                    );
                    const isSameSenderAsNext = Boolean(
                      next && idOf(next.senderId) === idOf(message.senderId)
                    );

                    return (
                      <MessageBubble
                        key={message._id || message.clientId}
                        message={message}
                        mine={isMine}
                        isFirst={!isSameSenderAsPrev && isSameSenderAsNext}
                        isMiddle={isSameSenderAsPrev && isSameSenderAsNext}
                        isLast={isSameSenderAsPrev && !isSameSenderAsNext}
                        isSingle={!isSameSenderAsPrev && !isSameSenderAsNext}
                        isSameSenderAsPrev={isSameSenderAsPrev}
                        isSameSenderAsNext={isSameSenderAsNext}
                        conversation={selected}
                        currentUserId={currentUserId}
                        onRetry={() => send()}
                        onReply={() => setReplyTo(message)}
                        onEdit={() => {}}
                        onDelete={() => {}}
                        onReact={() => {}}
                        onPin={() => {}}
                        compact={true}
                      />
                    );
                  })}
                </div>

                <MessageInput
                  content={content}
                  setContent={setContent}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  attachedContent={attachedContent}
                  setAttachedContent={setAttachedContent}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  editing={editing}
                  setEditing={setEditing}
                  uploadProgress={uploadProgress}
                  canPost={true}
                  members={selected.members || []}
                  error={error}
                  setError={setError}
                  onSend={send}
                  onUpload={() => {}}
                  compact={true}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
