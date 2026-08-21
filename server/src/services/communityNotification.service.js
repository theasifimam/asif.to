import Notification from "../models/Notification.js";

export async function createCommunityNotification({ recipient, actor, type, title, message, url, dedupeKey, severity = "info" }) {
  if (!recipient || String(recipient) === String(actor)) return null;
  try {
    return await Notification.create({ recipientId: recipient, actorId: actor, type, title, message, url, severity, dedupeKey });
  } catch (error) {
    if (error.code === 11000) return null;
    console.error("[COMMUNITY] Notification error:", error.message);
    return null;
  }
}
