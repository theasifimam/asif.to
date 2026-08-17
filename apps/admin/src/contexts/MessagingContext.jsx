"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { X, AlertCircle } from "lucide-react";
import { getAuthToken } from "@/lib/auth";
import { messagingApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const MessagingContext = createContext(null);
const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "";

const imageUrl = (avatar) => {
  if (!avatar) return "";
  return avatar.startsWith("http") ? avatar : `${STORAGE_URL}${avatar}`;
};

const socketOrigin = () => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  } catch {
    return undefined;
  }
};

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [unread, setUnread] = useState({ totalUnread: 0, conversations: {} });
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const refreshUnread = useCallback(async () => {
    const result = await messagingApi.unread();
    if (result.success) setUnread(result.data.data);
  }, []);

  const isOnline = useCallback(
    (userId) => {
      if (!userId) return false;
      const id = String(userId?._id || userId?.id || userId);
      return onlineUserIds.includes(id);
    },
    [onlineUserIds],
  );

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    const connection = io(socketOrigin(), {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      transports: ["websocket", "polling"],
    });
    connection.on("connect", () => {
      setSocket(connection);
      setStatus("connected");
      refreshUnread();
    });
    connection.on("disconnect", () => setStatus("reconnecting"));
    connection.io.on("reconnect_attempt", () => setStatus("reconnecting"));
    connection.on("connect_error", () => setStatus("reconnecting"));
    connection.on("unread_updated", setUnread);
    connection.on("presence:list", (ids) => {
      if (Array.isArray(ids)) setOnlineUserIds(ids.map(String));
    });
    connection.on("presence:update", ({ userId, status: userStatus }) => {
      if (!userId) return;
      const targetId = String(userId);
      setOnlineUserIds((prev) =>
        userStatus === "online"
          ? Array.from(new Set([...prev, targetId]))
          : prev.filter((id) => id !== targetId),
      );
    });
    connection.on("notification_updated", (payload) => {
      window.dispatchEvent(new Event("notifications:refresh"));

      if (payload && (payload.title || payload.message)) {
        const isHighPriority =
          payload.severity === "important" ||
          payload.severity === "critical" ||
          payload.severity === "warning";

        if (isHighPriority) {
          toast.custom(
            (t) => (
              <div
                onClick={() => {
                  if (payload.url) {
                    window.location.href = payload.url;
                  }
                  toast.dismiss(t);
                }}
                className="flex items-start gap-3.5 p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xl hover:border-blue-500/60 transition-all cursor-pointer max-w-sm w-full"
              >
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    payload.severity === "critical"
                      ? "bg-red-500/15 text-red-600 dark:text-red-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  <AlertCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        payload.severity === "critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      }`}
                    >
                      {payload.severity || "Important"}
                    </span>
                    <span className="text-[10px] text-zinc-400">just now</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                    {payload.title || "Important Activity Alert"}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {payload.message}
                  </p>
                </div>
              </div>
            ),
            { duration: 7000 },
          );
        }
      }
    });
    connection.on("new_message", (message) => {
      const myId = String(userRef.current?._id || userRef.current?.id || "");
      const sender = message?.senderId;
      const senderId = String(sender?._id || sender || "");
      const conversationId = String(message?.conversationId || "");

      // Do not notify self-sent messages
      if (!message?._id || (myId && senderId === myId)) return;

      // Check if user is actively viewing this specific conversation
      let isViewingThisConversation = false;
      if (typeof window !== "undefined") {
        const isMessagesRoute =
          window.location.pathname.startsWith("/messages");
        const activeConvInUrl = new URLSearchParams(window.location.search).get(
          "conversation",
        );
        if (isMessagesRoute && activeConvInUrl === conversationId) {
          isViewingThisConversation = true;
        }
      }

      // If user is already actively viewing this chat, do not display toast
      if (isViewingThisConversation) return;

      const senderName = sender?.fullName || sender?.username || "Team member";
      const avatarSrc = imageUrl(sender?.avatar);
      const preview = (
        message.content ||
        (message.attachments?.length ? "Sent an attachment" : "New message")
      )
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);

      toast.custom(
        (toastId) => (
          <div
            role="link"
            tabIndex={0}
            onClick={() => {
              toast.dismiss(toastId);
              window.location.assign(
                `/messages?conversation=${conversationId}`,
              );
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toast.dismiss(toastId);
                window.location.assign(
                  `/messages?conversation=${conversationId}`,
                );
              }
            }}
            className="admin-rich-toast flex w-full max-w-sm items-start gap-3 rounded-2xl border border-zinc-200/90 bg-white p-3.5 text-left shadow-xl shadow-zinc-950/10 transition-transform hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-[#121215] dark:shadow-black/40 cursor-pointer select-none"
          >
            {/* Sender Profile Picture (DP) */}
            <div className="relative shrink-0 mt-0.5">
              {avatarSrc ? (
                <div className="h-10 w-10 overflow-hidden rounded-xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/80 shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarSrc}
                    alt={senderName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-xs">
                  {senderName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online / Active Indicator Dot */}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white dark:border-[#121215] bg-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
            </div>

            {/* Sender Name & Message Content */}
            <div className="flex min-w-0 flex-1 flex-col pt-0.5">
              <div className="flex items-center gap-2">
                <h4 className="truncate font-outfit text-[13.5px] font-bold tracking-tight text-foreground leading-snug">
                  {senderName}
                </h4>
                <span className="shrink-0 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Message
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 font-sans text-[11.5px] font-medium text-muted-foreground/90 leading-relaxed">
                {preview}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={(event) => {
                event.stopPropagation();
                toast.dismiss(toastId);
              }}
              className="shrink-0 -mr-1 -mt-0.5 rounded-lg p-1 text-muted-foreground/60 transition hover:bg-muted/30 hover:text-foreground active:scale-95 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
        {
          id: `msg-${message._id || Date.now()}-${Math.random().toString(36).slice(2)}`,
          duration: 6000,
          unstyled: true,
        },
      );
    });
    return () => {
      connection.disconnect();
      setSocket(null);
    };
  }, [refreshUnread]);

  const value = useMemo(
    () => ({
      socket,
      status,
      unread,
      setUnread,
      refreshUnread,
      onlineUserIds,
      isOnline,
    }),
    [socket, status, unread, refreshUnread, onlineUserIds, isOnline],
  );
  return (
    <MessagingContext.Provider value={value}>
      {children}
    </MessagingContext.Provider>
  );
}

export const useMessaging = () => {
  const value = useContext(MessagingContext);
  if (!value)
    throw new Error("useMessaging must be used inside MessagingProvider");
  return value;
};
