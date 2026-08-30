"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { messagingApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import {
  ChatHeader,
  ConversationSidebar,
  MessageBubble,
  MessageInput,
  PinnedMessagesBar,
  avatarUrl,
  encodeContentCards,
  idOf,
} from "@/components/messaging";

function TypingAvatar({ user }) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img
      src={source}
      alt=""
      className="h-8 w-8 rounded-full object-cover shadow-xs border border-zinc-200/80 dark:border-zinc-800/80"
    />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 shadow-xs">
      {user?.fullName?.[0] || "•"}
    </span>
  );
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket, status, unread, refreshUnread } = useMessaging();

  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [pins, setPins] = useState([]);
  const [members, setMembers] = useState([]);
  const [team, setTeam] = useState([]);

  const [typingUsers, setTypingUsers] = useState({}); // userId -> user
  const [typingByConversation, setTypingByConversation] = useState({}); // conversationId -> boolean
  const typingTimeoutsRef = useRef({});
  const myTypingTimeoutRef = useRef(null);
  const isCurrentlyTypingRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [attachedContent, setAttachedContent] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");

  const listRef = useRef(null);
  const initializedFromUrl = useRef(false);

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

  const loadSidebar = useCallback(async (term) => {
    setLoading(true);
    const [conversationResult, teamResult] = await Promise.all([
      messagingApi.conversations(term ? { search: term } : {}),
      messagingApi.team(term ? { search: term } : {}),
    ]);
    if (conversationResult.success) {
      setConversations(conversationResult.data.data.conversations);
    }
    if (teamResult.success) {
      setTeam(teamResult.data.data.users);
    }
    if (!conversationResult.success || !teamResult.success) {
      setError("Messaging is temporarily unavailable.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadSidebar(search), search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [search, loadSidebar]);

  useEffect(() => {
    if (status === "connected") loadSidebar(search);
  }, [status, loadSidebar, search]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const loadPins = useCallback(async (conversationId) => {
    const result = await messagingApi.pins(conversationId);
    if (result.success) setPins(result.data.data.pins);
  }, []);

  const openConversation = useCallback(
    async (conversation, targetMessageId = null) => {
      if (!conversation?._id) return;
      if (selectedRef.current?._id && socket) {
        socket.emit("conversation:leave", {
          conversationId: selectedRef.current._id,
        });
      }
      setSelected(conversation);
      selectedRef.current = conversation;
      setTypingUsers({});
      setLoadingMessages(true);
      setError("");
      window.history.replaceState(
        null,
        "",
        `/messages?conversation=${conversation._id}`,
      );

      const [result, memberResult] = await Promise.all([
        targetMessageId
          ? messagingApi.context(targetMessageId)
          : messagingApi.messages(conversation._id, { limit: 30 }),
        messagingApi.members(conversation._id),
      ]);

      if (result.success) {
        setMessages(result.data.data.messages);
        setCursor(result.data.data.nextCursor || null);
        setHasMore(Boolean(result.data.data.hasMore));
        if (memberResult.success) setMembers(memberResult.data.data.users);
        loadPins(conversation._id);
        socket?.emit(
          "conversation:join",
          { conversationId: conversation._id },
          () => refreshUnread(),
        );
        await messagingApi.markRead(conversation._id);
        setConversations((items) =>
          items.map((item) =>
            idOf(item) === idOf(conversation)
              ? { ...item, unreadCount: 0 }
              : item,
          ),
        );
        refreshUnread();
      } else {
        setError("Messages could not be loaded.");
      }
      setLoadingMessages(false);
      requestAnimationFrame(() => {
        const target =
          targetMessageId &&
          document.getElementById(`message-${targetMessageId}`);
        if (target) {
          target.scrollIntoView({ block: "center" });
        } else {
          scrollToBottom();
        }
      });
    },
    [socket, refreshUnread, loadPins, scrollToBottom],
  );

  useEffect(() => {
    if (!loadingMessages && selected?._id && messages.length > 0) {
      scrollToBottom();
    }
  }, [loadingMessages, selected?._id, scrollToBottom, messages.length]);

  useEffect(() => {
    if (initializedFromUrl.current || !conversations.length) return;
    initializedFromUrl.current = true;
    const requested = new URLSearchParams(window.location.search).get(
      "conversation",
    );
    const conversation = conversations.find((item) => idOf(item) === requested);
    if (conversation) openConversation(conversation);
  }, [conversations, openConversation]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (message) => {
      if (idOf(message.conversationId) === idOf(selectedRef.current)) {
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
      loadSidebar(search);
    };

    const onConversation = (updated) => {
      setConversations((items) => {
        const index = items.findIndex(
          (item) => idOf(item) === idOf(updated.conversation),
        );
        if (index === -1) return [updated.conversation, ...items];
        return items.map((item) =>
          idOf(item) === idOf(updated.conversation)
            ? updated.conversation
            : item,
        );
      });
      if (idOf(updated.conversation) === idOf(selectedRef.current)) {
        setSelected(updated.conversation);
      }
      refreshUnread();
    };

    const replaceMessage = (message) =>
      setMessages((items) =>
        items.map((item) => (idOf(item) === idOf(message) ? message : item)),
      );

    const onReaction = ({ messageId, reactions }) =>
      setMessages((items) =>
        items.map((item) =>
          idOf(item) === String(messageId) ? { ...item, reactions } : item,
        ),
      );

    const onPin = () =>
      selectedRef.current?._id && loadPins(selectedRef.current._id);

    const onTypingStart = ({ conversationId, user: typingUser }) => {
      if (!conversationId || !typingUser?._id) return;
      const typerId = String(typingUser._id);
      if (typerId === String(user?._id || user?.id)) return;

      const convId = String(conversationId);
      setTypingByConversation((prev) => ({ ...prev, [convId]: true }));

      if (convId === idOf(selectedRef.current)) {
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
            const isNearBottom =
              listRef.current.scrollHeight -
                listRef.current.scrollTop -
                listRef.current.clientHeight <
              150;
            if (isNearBottom) {
              listRef.current.scrollTop = listRef.current.scrollHeight;
            }
          }
        });
      }
    };

    const onTypingStop = ({ conversationId, userId: typerId }) => {
      if (!conversationId || !typerId) return;
      const uId = String(typerId);
      const convId = String(conversationId);

      setTypingByConversation((prev) => {
        const next = { ...prev };
        delete next[convId];
        return next;
      });

      if (convId === idOf(selectedRef.current)) {
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
    socket.on("conversation_updated", onConversation);
    socket.on("message_updated", replaceMessage);
    socket.on("message_reaction_updated", onReaction);
    socket.on("message_pinned", onPin);
    socket.on("message_unpinned", onPin);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.off("new_message", onMessage);
      socket.off("conversation_updated", onConversation);
      socket.off("message_updated", replaceMessage);
      socket.off("message_reaction_updated", onReaction);
      socket.off("message_pinned", onPin);
      socket.off("message_unpinned", onPin);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
      if (selectedRef.current?._id) {
        socket.emit("conversation:leave", {
          conversationId: selectedRef.current._id,
        });
      }
    };
  }, [socket, loadSidebar, refreshUnread, search, loadPins, user]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (messageSearch.trim().length < 2) return setSearchResults([]);
      const result = await messagingApi.search({ q: messageSearch.trim() });
      if (result.success) setSearchResults(result.data.data.results);
      else setError("Message search is unavailable.");
    }, 300);
    return () => clearTimeout(timer);
  }, [messageSearch]);

  const startDirect = async (member) => {
    const result = await messagingApi.startDirect(member._id);
    if (!result.success) {
      return setError(result.error || "Unable to start this conversation.");
    }
    await loadSidebar("");
    setSearch("");
    openConversation(result.data.data.conversation);
  };

  const loadOlder = async () => {
    if (!selected || !hasMore || loadingOlder || !cursor) return;
    setLoadingOlder(true);
    const previousHeight = listRef.current?.scrollHeight || 0;
    const result = await messagingApi.messages(selected._id, {
      limit: 30,
      before: cursor,
    });
    if (result.success) {
      const older = result.data.data.messages;
      setMessages((items) => [
        ...older.filter(
          (message) => !items.some((item) => idOf(item) === idOf(message)),
        ),
        ...items,
      ]);
      setCursor(result.data.data.nextCursor);
      setHasMore(result.data.data.hasMore);
      requestAnimationFrame(() => {
        if (listRef.current) {
          listRef.current.scrollTop =
            listRef.current.scrollHeight - previousHeight;
        }
      });
    }
    setLoadingOlder(false);
  };

  const handleTyping = useCallback(
    (isTyping) => {
      if (!socket?.connected || !selectedRef.current?._id) return;
      const conversationId = selectedRef.current._id;

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
        if (socket?.connected && selectedRef.current?._id) {
          socket.emit("typing:stop", {
            conversationId: selectedRef.current._id,
          });
        }
        isCurrentlyTypingRef.current = false;
      }, 3000);
    },
    [socket],
  );

  const deliver = async (text, clientId, options) => {
    if (socket?.connected) {
      return new Promise((resolve) =>
        socket.timeout(10_000).emit(
          "message:send",
          {
            conversationId: selected._id,
            content: text,
            clientId,
            ...options,
          },
          (timeoutError, response) =>
            resolve(
              timeoutError
                ? { success: false, message: "Delivery timed out." }
                : response,
            ),
        ),
      );
    }
    const result = await messagingApi.send(
      selected._id,
      text,
      clientId,
      options,
    );
    return result.success
      ? { success: true, ...result.data.data }
      : { success: false, message: result.error };
  };

  const send = async (retryMessage) => {
    const text = (retryMessage ? retryMessage.content : content).trim();
    const sendContent = retryMessage?.attachedContent || attachedContent;
    if (
      (!text && !attachments.length && !sendContent?.length) ||
      text.length > 4000 ||
      !selected
    ) {
      return;
    }

    handleTyping(false);

    if (editing && !retryMessage) {
      const result = await messagingApi.edit(editing._id, text);
      if (result.success) {
        setMessages((items) =>
          items.map((item) =>
            idOf(item) === idOf(editing) ? result.data.data.message : item,
          ),
        );
        setEditing(null);
        setContent("");
      } else {
        setError(result.error || "Unable to edit message.");
      }
      return;
    }

    const clientId =
      retryMessage?.clientId ||
      `${user._id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const sendAttachments = retryMessage?.attachments || attachments;
    const fullContent = encodeContentCards(text, sendContent);
    const options = {
      replyToMessageId: retryMessage?.replyToMessageId?._id || replyTo?._id,
      attachmentIds: sendAttachments.map(
        (item) => item.attachmentId || item._id,
      ),
      attachedContent: sendContent,
    };

    if (!retryMessage) {
      const optimisticMessage = {
        _id: clientId,
        clientId,
        conversationId: selected._id,
        senderId: user,
        content: fullContent,
        attachments: sendAttachments,
        attachedContent: sendContent,
        replyToMessageId: replyTo,
        reactions: [],
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages((items) => [...items, optimisticMessage]);
      setContent("");
      setAttachments([]);
      setAttachedContent([]);
      setReplyTo(null);
      scrollToBottom(true);
    }

    const result = await deliver(fullContent, clientId, options);
    if (!result.success) {
      setMessages((items) =>
        items.map((item) =>
          item.clientId === clientId
            ? { ...item, pending: false, failed: true }
            : item,
        ),
      );
      setError(result.message || "Message delivery failed.");
      return;
    }

    setMessages((items) =>
      items.map((item) => (item.clientId === clientId ? result.message : item)),
    );
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

  const removeMessage = async (message) => {
    const result = await messagingApi.delete(message._id);
    if (result.success) {
      setMessages((items) =>
        items.map((item) =>
          idOf(item) === idOf(message)
            ? {
                ...item,
                deletedAt: new Date().toISOString(),
                content: "This message was deleted.",
                attachments: [],
                attachedContent: [],
              }
            : item,
        ),
      );
    } else {
      setError(result.error || "Unable to delete message.");
    }
  };

  const react = async (message, emoji) => {
    const result = await messagingApi.react(message._id, emoji);
    if (result.success) {
      setMessages((items) =>
        items.map((item) =>
          idOf(item) === idOf(message)
            ? { ...item, reactions: result.data.data.reactions }
            : item,
        ),
      );
    } else {
      setError(result.error);
    }
  };

  const togglePin = async (message) => {
    const result = message.pin
      ? await messagingApi.unpin(message._id)
      : await messagingApi.pin(message._id);
    if (result.success) {
      loadPins(selected._id);
    } else {
      setError(result.error || "Unable to update pin.");
    }
  };

  const currentUserId = user?._id || user?.id;
  const canPost =
    selected?.type !== "channel" ||
    ["founder", "admin", "super_admin", "maintainer"].includes(user?.role);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-white dark:bg-[#0c0c0e]">
      {/* Conversations Sidebar */}
      <ConversationSidebar
        selected={selected}
        conversations={conversations}
        team={team}
        unread={unread}
        search={search}
        setSearch={setSearch}
        messageSearch={messageSearch}
        setMessageSearch={setMessageSearch}
        searchResults={searchResults}
        loading={loading}
        currentUserId={currentUserId}
        typingByConversation={typingByConversation}
        onOpenConversation={openConversation}
        onStartDirect={startDirect}
      />

      {/* Chat Main Area */}
      <main
        className={`${selected ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-[#0c0c0e]`}
      >
        {!selected ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/30">
            <div className="mb-4 rounded-2xl bg-blue-50 p-4 text-blue-600 dark:bg-blue-500/10">
              <MessageCircle size={30} />
            </div>
            <h2 className="font-black text-zinc-950 dark:text-white text-lg">
              Choose a conversation
            </h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">
              Send a direct message or coordinate in a focused team channel.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <ChatHeader
              selected={selected}
              currentUserId={currentUserId}
              status={status}
              typingUsers={Object.values(typingUsers)}
              onBack={() => {
                socket?.emit("conversation:leave", {
                  conversationId: selected._id,
                });
                setSelected(null);
                window.history.replaceState(null, "", "/messages");
              }}
            />

            {/* Pinned Messages Bar */}
            <PinnedMessagesBar
              pins={pins}
              selected={selected}
              onOpenConversation={openConversation}
            />

            {/* Message List */}
            <div
              ref={listRef}
              onScroll={(event) => {
                if (event.currentTarget.scrollTop < 40) loadOlder();
              }}
              className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/60 px-4 py-5 dark:bg-zinc-950/40 sm:px-6"
            >
              {loadingMessages ? (
                <div className="flex min-h-40 items-center justify-center text-center text-sm font-medium text-zinc-500">
                  Loading messages…
                </div>
              ) : (
                <>
                  {loadingOlder && (
                    <p className="pb-3 text-center text-xs font-semibold text-zinc-500">
                      Loading older messages…
                    </p>
                  )}
                  {!messages.length && (
                    <div className="flex min-h-40 items-center justify-center text-center text-sm font-medium text-zinc-500">
                      No messages yet. Start the conversation.
                    </div>
                  )}
                  <div className="flex flex-col">
                    {messages.map((message, index) => {
                      const prev = messages[index - 1];
                      const next = messages[index + 1];
                      const isMine =
                        idOf(message.senderId) === String(currentUserId);

                      const isSameSenderAsPrev = Boolean(
                        prev &&
                        idOf(prev.senderId) === idOf(message.senderId) &&
                        !prev.deletedAt &&
                        !message.deletedAt &&
                        Math.abs(
                          new Date(message.createdAt) -
                            new Date(prev.createdAt),
                        ) <
                          5 * 60 * 1000,
                      );

                      const isSameSenderAsNext = Boolean(
                        next &&
                        idOf(next.senderId) === idOf(message.senderId) &&
                        !next.deletedAt &&
                        !message.deletedAt &&
                        Math.abs(
                          new Date(next.createdAt) -
                            new Date(message.createdAt),
                        ) <
                          5 * 60 * 1000,
                      );

                      const isFirst = !isSameSenderAsPrev && isSameSenderAsNext;
                      const isMiddle = isSameSenderAsPrev && isSameSenderAsNext;
                      const isLast = isSameSenderAsPrev && !isSameSenderAsNext;
                      const isSingle =
                        !isSameSenderAsPrev && !isSameSenderAsNext;

                      return (
                        <MessageBubble
                          key={message._id || message.clientId}
                          message={message}
                          mine={isMine}
                          isFirst={isFirst}
                          isMiddle={isMiddle}
                          isLast={isLast}
                          isSingle={isSingle}
                          isSameSenderAsPrev={isSameSenderAsPrev}
                          isSameSenderAsNext={isSameSenderAsNext}
                          conversation={selected}
                          currentUserId={currentUserId}
                          onRetry={() => send(message)}
                          onReply={() => {
                            setReplyTo(message);
                            setEditing(null);
                          }}
                          onEdit={() => {
                            setEditing(message);
                            setReplyTo(null);
                            setContent(message.content);
                          }}
                          onDelete={() => removeMessage(message)}
                          onReact={(emoji) => react(message, emoji)}
                          onPin={() => togglePin(message)}
                        />
                      );
                    })}

                    {/* Live Typing Indicator Bubble in Stream */}
                    {Object.values(typingUsers).length > 0 && (
                      <div className="flex flex-col gap-1.5 pt-2 pb-1">
                        {Object.values(typingUsers).map((typer) => (
                          <div
                            key={typer._id}
                            className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
                          >
                            <div className="w-8 sm:w-9 shrink-0 flex items-end justify-center mb-0.5">
                              <TypingAvatar user={typer} />
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-[#18181c] px-4 py-2.5 shadow-xs">
                              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                {selected?.type !== "direct"
                                  ? `${typer.fullName?.split(" ")[0] || "Someone"}`
                                  : "typing"}
                              </span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                                  style={{ animationDelay: "0ms" }}
                                />
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                                  style={{ animationDelay: "150ms" }}
                                />
                                <span
                                  className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                                  style={{ animationDelay: "300ms" }}
                                />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Message Composer */}
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
              canPost={canPost}
              members={members}
              error={error}
              setError={setError}
              onSend={send}
              onUpload={upload}
              onTyping={handleTyping}
            />
          </>
        )}
      </main>
    </div>
  );
}
