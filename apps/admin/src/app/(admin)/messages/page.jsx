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
  encodeContentCards,
  idOf,
} from "@/components/messaging";

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
        requestAnimationFrame(() => {
          const target =
            targetMessageId &&
            document.getElementById(`message-${targetMessageId}`);
          if (target) {
            target.scrollIntoView({ block: "center" });
          } else if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        });
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
    },
    [socket, refreshUnread, loadPins],
  );

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
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        });
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

    socket.on("new_message", onMessage);
    socket.on("conversation_updated", onConversation);
    socket.on("message_updated", replaceMessage);
    socket.on("message_reaction_updated", onReaction);
    socket.on("message_pinned", onPin);
    socket.on("message_unpinned", onPin);

    return () => {
      socket.off("new_message", onMessage);
      socket.off("conversation_updated", onConversation);
      socket.off("message_updated", replaceMessage);
      socket.off("message_reaction_updated", onReaction);
      socket.off("message_pinned", onPin);
      socket.off("message_unpinned", onPin);
      if (selectedRef.current?._id) {
        socket.emit("conversation:leave", {
          conversationId: selectedRef.current._id,
        });
      }
    };
  }, [socket, loadSidebar, refreshUnread, search, loadPins]);

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

  const deliver = async (text, clientId, options) => {
    if (socket?.connected) {
      return new Promise((resolve) =>
        socket
          .timeout(10_000)
          .emit(
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
    } else {
      setMessages((items) =>
        items.map((item) =>
          item.clientId === clientId
            ? { ...item, failed: false, pending: true }
            : item,
        ),
      );
    }

    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    });

    const result = await deliver(fullContent, clientId, options);
    if (result.success && result.message) {
      setMessages((items) =>
        items.map((item) =>
          item.clientId === clientId ? result.message : item,
        ),
      );
      loadSidebar(search);
    } else {
      setMessages((items) =>
        items.map((item) =>
          item.clientId === clientId
            ? { ...item, pending: false, failed: true }
            : item,
        ),
      );
      setError(result.message || "Message failed to send.");
    }
  };

  const upload = async (files) => {
    if (!files?.length || !selected) return;
    setUploadProgress(1);
    setError("");
    const result = await messagingApi.upload(
      selected._id,
      [...files].slice(0, 4 - attachments.length),
      setUploadProgress,
    );
    if (result.success) {
      setAttachments((items) =>
        [...items, ...result.data.data.attachments].slice(0, 4),
      );
    } else {
      setError(result.error || "Attachment upload failed.");
    }
    setUploadProgress(0);
  };

  const removeMessage = async (message) => {
    if (
      !window.confirm(
        "Delete this message? Replies will retain a deleted-message reference.",
      )
    ) {
      return;
    }
    const result = await messagingApi.delete(message._id);
    if (result.success) {
      setMessages((items) =>
        items.map((item) =>
          idOf(item) === idOf(message) ? result.data.data.message : item,
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
    const result = await messagingApi.pin(message._id);
    if (result.success) loadPins(selected._id);
    else setError(result.error || "Pin permission denied.");
  };

  const currentUserId = user?._id || user?.id;
  const canPost =
    selected &&
    (selected.type === "direct" ||
      selected.postRoles?.includes(user.role) ||
      selected.allowedMemberIds?.some(
        (id) => idOf(id) === String(currentUserId),
      ));

  return (
    <div className="flex h-full w-full min-h-0 overflow-hidden bg-white dark:bg-[#121215]">
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
        onOpenConversation={openConversation}
        onStartDirect={startDirect}
      />

      {/* Chat Main Area */}
      <main
        className={`${selected ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-white dark:bg-[#121215]`}
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
                <div className="flex min-h-40 items-center justify-center text-center text-xs text-zinc-500">
                  Loading messages…
                </div>
              ) : (
                <>
                  {loadingOlder && (
                    <p className="pb-3 text-center text-[10px] text-zinc-500">
                      Loading older messages…
                    </p>
                  )}
                  {!messages.length && (
                    <div className="flex min-h-40 items-center justify-center text-center text-xs text-zinc-500">
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

                      const isFirst =
                        !isSameSenderAsPrev && isSameSenderAsNext;
                      const isMiddle =
                        isSameSenderAsPrev && isSameSenderAsNext;
                      const isLast =
                        isSameSenderAsPrev && !isSameSenderAsNext;
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
            />
          </>
        )}
      </main>
    </div>
  );
}
