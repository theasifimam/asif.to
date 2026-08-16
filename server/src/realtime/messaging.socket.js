import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { getPermissionsForRole } from "../utils/permissions.js";
import { canAccessConversation, canUseMessaging } from "../services/messagingAccess.service.js";
import { accessibleConversationFilter, markConversationRead, sendMessage } from "../services/messaging.service.js";
import {
  clearActiveConversation,
  getOnlineUserIds,
  setActiveConversation,
  setMessagingSocketServer,
  userConnected,
  userDisconnected,
} from "../services/messagingRealtime.service.js";

const cookieToken = (header = "") => header.split(";").map((part) => part.trim().split("=")).find(([key]) => key === "token")?.[1];

export function initializeMessagingSocket(httpServer, origins) {
  const io = new Server(httpServer, { cors: { origin: origins, credentials: true }, maxHttpBufferSize: 16_384 });
  setMessagingSocketServer(io);
  io.use(async (socket, next) => {
    try {
      const bearer = socket.handshake.headers.authorization?.startsWith("Bearer ") ? socket.handshake.headers.authorization.slice(7) : null;
      const token = socket.handshake.auth?.token || bearer || cookieToken(socket.handshake.headers.cookie);
      if (!token || !process.env.JWT_SECRET) return next(new Error("Authentication required."));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user || ["suspended", "banned", "deactivated"].includes(user.status)) return next(new Error("Account is not available."));
      if (user.sessionsRevokedAt && decoded.iat * 1000 <= user.sessionsRevokedAt.getTime()) return next(new Error("Session has been revoked."));
      user.effectivePermissions = await getPermissionsForRole(user.role);
      if (!canUseMessaging(user)) return next(new Error("Messaging access denied."));
      socket.user = user;
      next();
    } catch (_error) { next(new Error("Authentication failed.")); }
  });

  io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = String(user._id);
    socket.join(`user:${userId}`);

    const isFirstConnection = userConnected(userId, socket.id);
    if (isFirstConnection) {
      io.emit("presence:update", { userId, status: "online" });
    }

    // Send the current list of online user IDs to the connected client
    socket.emit("presence:list", getOnlineUserIds());

    const allowed = await Conversation.find(accessibleConversationFilter(user)).select("_id").lean();
    allowed.forEach((conversation) => socket.join(`conversation:${conversation._id}`));

    socket.on("presence:get", (acknowledge = () => {}) => {
      acknowledge({ success: true, onlineUsers: getOnlineUserIds() });
    });

    socket.on("conversation:join", async ({ conversationId } = {}, acknowledge = () => {}) => {
      try {
        const conversation = await Conversation.findById(conversationId).lean();
        if (!canAccessConversation(user, conversation)) return acknowledge({ success: false, message: "Conversation access denied." });
        socket.join(`conversation:${conversation._id}`);
        setActiveConversation(user._id, conversation._id, socket.id);
        const unread = await markConversationRead(user, conversation._id);
        acknowledge({ success: true, unread });
      } catch (_error) { acknowledge({ success: false, message: "Unable to open conversation." }); }
    });

    socket.on("conversation:leave", ({ conversationId } = {}) => {
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId: String(conversationId),
          userId,
        });
      }
      clearActiveConversation(socket.id);
    });

    socket.on("typing:start", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:start", {
        conversationId: String(conversationId),
        user: {
          _id: userId,
          fullName: user.fullName,
          username: user.username,
          avatar: user.avatar,
        },
      });
    });

    socket.on("typing:stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing:stop", {
        conversationId: String(conversationId),
        userId,
      });
    });

    socket.on("message:send", async ({ conversationId, content, clientId, replyToMessageId, attachmentIds } = {}, acknowledge = () => {}) => {
      try {
        const result = await sendMessage(user, conversationId, content, clientId, { replyToMessageId, attachmentIds });
        socket.to(`conversation:${conversationId}`).emit("typing:stop", {
          conversationId: String(conversationId),
          userId,
        });
        acknowledge({ success: true, ...result });
      } catch (error) { acknowledge({ success: false, message: error.status ? error.message : "Message could not be sent." }); }
    });

    socket.on("disconnect", () => {
      const { isOffline } = userDisconnected(socket.id);
      if (isOffline) {
        io.emit("presence:update", { userId, status: "offline" });
      }
    });
  });
  return io;
}

