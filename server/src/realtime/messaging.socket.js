import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import { getPermissionsForRole } from "../utils/permissions.js";
import { canAccessConversation, canUseMessaging } from "../services/messagingAccess.service.js";
import { accessibleConversationFilter, markConversationRead, sendMessage } from "../services/messaging.service.js";
import { clearActiveConversation, setActiveConversation, setMessagingSocketServer } from "../services/messagingRealtime.service.js";

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
    socket.join(`user:${user._id}`);
    const allowed = await Conversation.find(accessibleConversationFilter(user)).select("_id").lean();
    allowed.forEach((conversation) => socket.join(`conversation:${conversation._id}`));

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
      if (conversationId) socket.leave(`conversation:${conversationId}`);
      clearActiveConversation(socket.id);
    });

    socket.on("message:send", async ({ conversationId, content, clientId, replyToMessageId, attachmentIds } = {}, acknowledge = () => {}) => {
      try {
        const result = await sendMessage(user, conversationId, content, clientId, { replyToMessageId, attachmentIds });
        acknowledge({ success: true, ...result });
      } catch (error) { acknowledge({ success: false, message: error.status ? error.message : "Message could not be sent." }); }
    });

    socket.on("disconnect", () => clearActiveConversation(socket.id));
  });
  return io;
}
