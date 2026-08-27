"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Maximize2,
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

function DockAvatar({
  user,
  className = "h-8 w-8 rounded-full",
  online = false,
}) {
  const source = avatarUrl(user?.avatar);
  return (
    <div className="relative shrink-0">
      {source ? (
        <img
          src={source}
          alt=""
          className={`${className} shrink-0 object-cover`}
        />
      ) : (
        <span
          className={`flex ${className} shrink-0 items-center justify-center bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300`}
        >
          {user?.fullName?.[0] || <UserRound size={14} />}
        </span>
      )}
      {online && (
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950"
          title="Online"
        >
          <span className="h-0.5 w-0.5 rounded-full bg-white" />
        </span>
      )}
    </div>
  );
}

export default function FloatingChatDock({ isNavVisible = true }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { socket, unread, refreshUnread, isOnline } = useMessaging();

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeoutsRef = useRef({});
  const myTypingTimeoutRef = useRef(null);
  const isCurrentlyTypingRef = useRef(false);

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
    const result = await messagingApi.conversations(
      term ? { search: term } : {},
    );
    if (result.success) {
      setConversations(result.data.data.conversations || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadConversations();
    messagingApi
      .team()
      .then((res) => {
        if (res.success && res.data?.data?.users) {
          setTeamMembers(res.data.data.users);
        }
      })
      .catch(() => {});
  }, [loadConversations]);

  useEffect(() => {
    if (isOpen && !selected) {
      loadConversations(search);
    }
  }, [isOpen, selected, search, loadConversations]);

  // Extract unique online users
  const onlineUsers = useMemo(() => {
    const map = new Map();
    conversations.forEach((conv) => {
      conv.members?.forEach((member) => {
        const id = idOf(member);
        if (id && id !== String(currentUserId) && isOnline(id)) {
          map.set(id, member);
        }
      });
    });
    teamMembers.forEach((member) => {
      const id = idOf(member);
      if (id && id !== String(currentUserId) && isOnline(id)) {
        map.set(id, member);
      }
    });
    return Array.from(map.values());
  }, [conversations, teamMembers, currentUserId, isOnline]);

  const startDirectChatWithUser = async (targetUser) => {
    const targetId = idOf(targetUser);
    if (!targetId) return;
    const existing = conversations.find(
      (c) =>
        c.type === "direct" && c.members?.some((m) => idOf(m) === targetId),
    );
    if (existing) {
      openConversation(existing);
    } else {
      setLoading(true);
      const res = await messagingApi.startDirect(targetId);
      if (res.success && res.data?.data?.conversation) {
        const newConv = res.data.data.conversation;
        setConversations((prev) => [newConv, ...prev]);
        openConversation(newConv);
      }
      setLoading(false);
    }
  };

  const scrollToBottom = useCallback((smooth = false) => {
    const doScroll = () => {
      if (listRef.current) {
        listRef.current.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: smooth ? "smooth" : "auto",
        });
      }
    };
    doScroll();
    requestAnimationFrame(doScroll);
    setTimeout(doScroll, 50);
    setTimeout(doScroll, 150);
  }, []);

  const openConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) return;
      setSelected(conversation);
      setTypingUsers({});
      setLoading(true);
      const result = await messagingApi.messages(conversation._id, {
        limit: 30,
      });
      if (result.success) {
        setMessages(result.data.data.messages);
        socket?.emit("conversation:join", { conversationId: conversation._id });
        await messagingApi.markRead(conversation._id);
        refreshUnread();
      }
      setLoading(false);
      scrollToBottom();
    },
    [socket, refreshUnread, scrollToBottom],
  );

  useEffect(() => {
    if (!loading && selected?._id && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, selected?._id, scrollToBottom, messages.length]);

  const handleTyping = useCallback(
    (isTyping) => {
      if (!socket?.connected || !selected?._id) return;
      const conversationId = selected._id;

      if (!isTyping) {
        if (isCurrentlyTypingRef.current) {
          socket.emit("typing:stop", { conversationId });
          isCurrentlyTypingRef.current = false;
        }
        if (myTypingTimeoutRef.current) {
          clearTimeout(myTypingTimeoutRef.current);
          myTypingTimeoutRef.current = null;
        }
        return;
      }

      if (!isCurrentlyTypingRef.current) {
        socket.emit("typing:start", { conversationId });
        isCurrentlyTypingRef.current = true;
      }

      if (myTypingTimeoutRef.current) {
        clearTimeout(myTypingTimeoutRef.current);
      }

      myTypingTimeoutRef.current = setTimeout(() => {
        if (socket?.connected && selected?._id) {
          socket.emit("typing:stop", { conversationId: selected._id });
        }
        isCurrentlyTypingRef.current = false;
      }, 3000);
    },
    [socket, selected],
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
        scrollToBottom(true);
      }
    };

    const onTypingStart = ({ conversationId, user: typingUser }) => {
      if (!conversationId || !typingUser?._id) return;
      const typerId = String(typingUser._id);
      if (typerId === String(user?._id || user?.id)) return;

      if (String(conversationId) === idOf(selected._id)) {
        if (typingTimeoutsRef.current[typerId]) {
          clearTimeout(typingTimeoutsRef.current[typerId]);
        }

        setTypingUsers((prev) => ({ ...prev, [typerId]: typingUser }));

        typingTimeoutsRef.current[typerId] = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[typerId];
            return next;
          });
          delete typingTimeoutsRef.current[typerId];
        }, 4000);

        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        });
      }
    };

    const onTypingStop = ({ conversationId, userId: typerId }) => {
      if (!conversationId || !typerId) return;
      const uId = String(typerId);
      if (String(conversationId) === idOf(selected._id)) {
        if (typingTimeoutsRef.current[uId]) {
          clearTimeout(typingTimeoutsRef.current[uId]);
          delete typingTimeoutsRef.current[uId];
        }
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[uId];
          return next;
        });
      }
    };

    socket.on("new_message", onMessage);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("new_message", onMessage);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, selected, refreshUnread, user]);

  const send = async () => {
    const text = content.trim();
    if ((!text && !attachments.length && !attachedContent.length) || !selected)
      return;

    const clientId = `${user?._id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sendAttachments = attachments;
    const sendContent = attachedContent;
    const fullContent = encodeContentCards(text, sendContent);
    const options = {
      replyToMessageId: replyTo?._id,
      attachmentIds: sendAttachments.map(
        (item) => item.attachmentId || item._id,
      ),
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

    scrollToBottom(true);

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

  const upload = async (files) => {
    if (!files?.length || !selected?._id) return;
    const array = Array.from(files);
    setUploadProgress(10);
    const result = await messagingApi.upload(selected._id, array, (progress) =>
      setUploadProgress(progress),
    );
    setUploadProgress(0);
    if (result.success) {
      setAttachments((prev) => [...prev, ...result.data.data.attachments]);
    } else {
      setError(result.error || "Upload failed.");
    }
  };

  // Do not render floating dock on the main full-screen /messages page
  if (pathname?.startsWith("/messages")) {
    return null;
  }

  const other = selected ? otherMember(selected, currentUserId) : null;
  const bottomOffset = isNavVisible ? "bottom-20 lg:bottom-4" : "bottom-4";

  return (
    <div
      className={`hidden sm:block fixed right-4 z-40 transition-all duration-300 ${bottomOffset}`}
    >
      {!isOpen ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => {
            setIsOpen(true);
            if (!selected) loadConversations();
          }}
          className="flex items-center gap-2.5 rounded-full border border-zinc-200/90 bg-white px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-xl shadow-zinc-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/50 cursor-pointer"
        >
          {onlineUsers.length > 0 ? (
            <div className="flex items-center -space-x-2 shrink-0">
              {onlineUsers.slice(0, 3).map((u, idx) => {
                const src = avatarUrl(u.avatar);
                return (
                  <div
                    key={idOf(u)}
                    className="relative rounded-full ring-2 ring-white dark:ring-[#121215] shrink-0"
                    style={{ zIndex: 10 - idx }}
                    title={`${u.fullName || "User"} (Online)`}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={u.fullName || ""}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {u.fullName?.[0] || <UserRound size={11} />}
                      </span>
                    )}
                    {idx === 0 && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-zinc-950" />
                    )}
                  </div>
                );
              })}
              {onlineUsers.length > 3 && (
                <div
                  className="relative z-0 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[9px] font-black text-zinc-600 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-300 dark:ring-[#121215]"
                  title={`${onlineUsers.length - 3} more online`}
                >
                  +{onlineUsers.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <MessageSquare size={14} />
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {onlineUsers.length > 0 && (
              <span
                className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
                title={`${onlineUsers.length} online`}
              />
            )}
          </div>

          {unread.totalUnread > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[9px] font-black text-white">
              {unread.totalUnread}
            </span>
          )}

          <ChevronUp size={14} className="text-zinc-400 ml-0.5" />
        </button>
      ) : (
        /* Expanded LinkedIn/Instagram-style Chat Dock Window */
        <div className="flex h-125 sm:h-140 w-85 sm:w-96 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/70 animate-in fade-in zoom-in-95 duration-150">
          {/* Dock Header */}
          <div className="flex h-14 sm:h-15 shrink-0 items-center justify-between border-b border-zinc-200/80 px-4 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 backdrop-blur-md">
            <div className="flex min-w-0 items-center gap-2.5">
              {selected ? (
                <>
                  <button
                    onClick={() => setSelected(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title="Go back"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <DockAvatar
                    user={other}
                    className="h-8 w-8 rounded-full"
                    online={selected.type === "direct" && isOnline(other?._id)}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {selected.type === "discussion"
                        ? selected.entityTitle
                        : conversationName(selected, currentUserId)}
                    </p>
                    {Object.values(typingUsers).length > 0 ? (
                      <p className="truncate text-[10px] font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                        typing…
                      </p>
                    ) : selected.type === "direct" ? (
                      <p className="truncate text-[10px] text-zinc-400">
                        {isOnline(other?._id) ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Online
                          </span>
                        ) : (
                          "Offline"
                        )}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2.5">
                  {onlineUsers.length > 0 ? (
                    <div className="flex items-center -space-x-2 shrink-0">
                      {onlineUsers.slice(0, 3).map((u, idx) => {
                        const src = avatarUrl(u.avatar);
                        return (
                          <div
                            key={idOf(u)}
                            className="relative rounded-full ring-2 ring-white dark:ring-[#121215] shrink-0"
                            style={{ zIndex: 10 - idx }}
                            title={`${u.fullName || "User"} (Online)`}
                          >
                            {src ? (
                              <img
                                src={src}
                                alt={u.fullName || ""}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                {u.fullName?.[0] || <UserRound size={12} />}
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-500 dark:border-zinc-950" />
                            )}
                          </div>
                        );
                      })}
                      {onlineUsers.length > 3 && (
                        <div
                          className="relative z-0 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-black text-zinc-600 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-300 dark:ring-[#121215]"
                          title={`${onlineUsers.length - 3} more online`}
                        >
                          +{onlineUsers.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                      <MessageSquare size={14} />
                    </span>
                  )}
                  <div>
                    <h3 className="font-outfit text-sm font-black tracking-tight text-zinc-950 dark:text-white">
                      Messages
                    </h3>
                    {onlineUsers.length > 0 && (
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {onlineUsers.length} online
                      </p>
                    )}
                  </div>
                  {unread.totalUnread > 0 && (
                    <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white">
                      {unread.totalUnread}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {selected && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/messages?conversation=${selected._id}`);
                  }}
                  title="Open full page"
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  <Maximize2 size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Dock Content Body */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#121215]">
            {!selected ? (
              /* Conversation Picker List */
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="p-3 border-b border-zinc-100 dark:border-zinc-800/80">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search messages..."
                      className="h-10 w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-xs font-medium outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all"
                    />
                  </div>
                </div>

                {/* Instagram-style Active Now Online Row */}
                {onlineUsers.length > 0 && !search && (
                  <div className="flex items-center gap-3 overflow-x-auto px-3.5 py-2.5 border-b border-zinc-100 dark:border-zinc-800/80 scrollbar-none">
                    {onlineUsers.map((onlineUser) => {
                      const src = avatarUrl(onlineUser.avatar);
                      return (
                        <button
                          key={idOf(onlineUser)}
                          onClick={() => startDirectChatWithUser(onlineUser)}
                          className="flex flex-col items-center gap-1 group shrink-0 cursor-pointer"
                          title={`Chat with ${onlineUser.fullName}`}
                        >
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full ring-2 ring-emerald-500/80 p-0.5 transition-transform group-hover:scale-105">
                              {src ? (
                                <img
                                  src={src}
                                  alt={onlineUser.fullName || ""}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center rounded-full bg-zinc-200 text-xs font-black text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                  {onlineUser.fullName?.[0] || (
                                    <UserRound size={14} />
                                  )}
                                </span>
                              )}
                            </div>
                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-950" />
                          </div>
                          <span className="max-w-12 truncate text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white">
                            {onlineUser.fullName?.split(" ")[0] || "User"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto p-2.5 space-y-1">
                  {loading ? (
                    <div className="p-6 text-center text-xs text-zinc-400">
                      Loading...
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conv) => {
                      const member = otherMember(conv, currentUserId);
                      const hasUnread = (conv.unreadCount || 0) > 0;
                      return (
                        <button
                          key={conv._id}
                          onClick={() => openConversation(conv)}
                          className="group relative flex w-full items-center gap-3 rounded-xl p-2.5 text-left border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-150 cursor-pointer"
                        >
                          <DockAvatar
                            user={member}
                            className="h-9 w-9 rounded-full"
                            online={
                              conv.type === "direct" && isOnline(member?._id)
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p
                                className={`truncate text-sm ${
                                  hasUnread
                                    ? "font-extrabold text-zinc-950 dark:text-white"
                                    : "font-semibold text-zinc-800 dark:text-zinc-200"
                                }`}
                              >
                                {conv.type === "discussion"
                                  ? conv.entityTitle
                                  : conversationName(conv, currentUserId)}
                              </p>
                              <div className="flex items-center gap-1.5 pl-2 shrink-0">
                                {hasUnread && (
                                  <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                                    {conv.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p
                              className={`truncate text-xs mt-0.5 ${
                                hasUnread
                                  ? "font-bold text-zinc-800 dark:text-zinc-200"
                                  : "text-zinc-400 dark:text-zinc-500 font-medium"
                              }`}
                            >
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
                    const isMine =
                      idOf(message.senderId) === String(currentUserId);

                    const isSameSenderAsPrev = Boolean(
                      prev && idOf(prev.senderId) === idOf(message.senderId),
                    );
                    const isSameSenderAsNext = Boolean(
                      next && idOf(next.senderId) === idOf(message.senderId),
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

                  {/* Live Mini Typing Indicator */}
                  {Object.values(typingUsers).length > 0 && (
                    <div className="flex flex-col gap-1 py-1">
                      {Object.values(typingUsers).map((typer) => (
                        <div
                          key={typer._id}
                          className="flex items-center gap-1.5 animate-in fade-in"
                        >
                          <DockAvatar
                            user={typer}
                            className="h-5 w-5 rounded-full"
                          />
                          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-200/80 px-2.5 py-1 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            <span className="flex items-center gap-0.5">
                              <span
                                className="h-1 w-1 rounded-full bg-blue-500 animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="h-1 w-1 rounded-full bg-blue-500 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="h-1 w-1 rounded-full bg-blue-500 animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  onUpload={upload}
                  onTyping={handleTyping}
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
