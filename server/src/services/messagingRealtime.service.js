let socketServer = null;
const activeConversationBySocket = new Map();
const onlineSocketsByUser = new Map(); // userId -> Set<socketId>
const userBySocket = new Map(); // socketId -> userId

export const setMessagingSocketServer = (io) => { socketServer = io; };
export const getMessagingSocketServer = () => socketServer;

export const userConnected = (userId, socketId) => {
  const uId = String(userId);
  const sId = String(socketId);
  userBySocket.set(sId, uId);
  if (!onlineSocketsByUser.has(uId)) {
    onlineSocketsByUser.set(uId, new Set());
  }
  const sockets = onlineSocketsByUser.get(uId);
  const wasOffline = sockets.size === 0;
  sockets.add(sId);
  return wasOffline;
};

export const userDisconnected = (socketId) => {
  const sId = String(socketId);
  const uId = userBySocket.get(sId);
  userBySocket.delete(sId);
  activeConversationBySocket.delete(sId);
  if (uId && onlineSocketsByUser.has(uId)) {
    const sockets = onlineSocketsByUser.get(uId);
    sockets.delete(sId);
    if (sockets.size === 0) {
      onlineSocketsByUser.delete(uId);
      return { userId: uId, isOffline: true };
    }
    return { userId: uId, isOffline: false };
  }
  return { userId: uId || null, isOffline: false };
};

export const getOnlineUserIds = () => Array.from(onlineSocketsByUser.keys());

export const isUserOnline = (userId) => {
  const uId = String(userId);
  return onlineSocketsByUser.has(uId) && onlineSocketsByUser.get(uId).size > 0;
};

export const setActiveConversation = (userId, conversationId, socketId) => {
  if (conversationId) activeConversationBySocket.set(String(socketId), { userId: String(userId), conversationId: String(conversationId) });
  else activeConversationBySocket.delete(String(socketId));
};

export const isViewingConversation = (userId, conversationId) =>
  [...activeConversationBySocket.values()].some((entry) => entry.userId === String(userId) && entry.conversationId === String(conversationId));

export const clearActiveConversation = (socketId) => activeConversationBySocket.delete(String(socketId));

