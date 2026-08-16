"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { X } from "lucide-react";
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
  try { return new URL(process.env.NEXT_PUBLIC_API_URL).origin; }
  catch { return undefined; }
};

export function MessagingProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [unread, setUnread] = useState({ totalUnread: 0, conversations: {} });
  const currentUserId = String(user?._id || user?.id || "");
  const refreshUnread = useCallback(async () => {
    const result = await messagingApi.unread();
    if (result.success) setUnread(result.data.data);
  }, []);

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
    connection.on("connect", () => { setSocket(connection); setStatus("connected"); refreshUnread(); });
    connection.on("disconnect", () => setStatus("reconnecting"));
    connection.io.on("reconnect_attempt", () => setStatus("reconnecting"));
    connection.on("connect_error", () => setStatus("reconnecting"));
    connection.on("unread_updated", setUnread);
    connection.on("notification_updated", () => window.dispatchEvent(new Event("notifications:refresh")));
    connection.on("new_message", (message) => {
      const sender = message?.senderId;
      const senderId = String(sender?._id || sender || "");
      const conversationId = String(message?.conversationId || "");
      
      // Check if user is currently on the chat / messages screen
      const isChatScreen =
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/messages");

      // Show toast notification only when user is outside of the chat screen and message is not from self
      if (!message?._id || senderId === currentUserId || isChatScreen) return;

      const senderName = sender?.fullName || sender?.username || "Team member";
      const avatarSrc = imageUrl(sender?.avatar);
      const preview = (message.content || (message.attachments?.length ? "Sent an attachment" : "New message"))
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
              window.location.assign(`/messages?conversation=${conversationId}`);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toast.dismiss(toastId);
                window.location.assign(`/messages?conversation=${conversationId}`);
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
        { id: `message-${message._id}`, duration: 6000 },
      );
    });
    return () => { connection.disconnect(); setSocket(null); };
  }, [refreshUnread, currentUserId]);

  const value = useMemo(() => ({ socket, status, unread, setUnread, refreshUnread }), [socket, status, unread, refreshUnread]);
  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
}

export const useMessaging = () => {
  const value = useContext(MessagingContext);
  if (!value) throw new Error("useMessaging must be used inside MessagingProvider");
  return value;
};
