let socketServer = null;
const activeConversationBySocket = new Map();

export const setMessagingSocketServer = (io) => { socketServer = io; };
export const getMessagingSocketServer = () => socketServer;
export const setActiveConversation = (userId, conversationId, socketId) => {
  if (conversationId) activeConversationBySocket.set(String(socketId), { userId: String(userId), conversationId: String(conversationId) });
  else activeConversationBySocket.delete(String(socketId));
};
export const isViewingConversation = (userId, conversationId) =>
  [...activeConversationBySocket.values()].some((entry) => entry.userId === String(userId) && entry.conversationId === String(conversationId));
export const clearActiveConversation = (socketId) => activeConversationBySocket.delete(String(socketId));
