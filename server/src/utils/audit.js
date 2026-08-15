import AuditLog from "../models/AuditLog.js";

export const writeAudit = async (req, action, targetUser, metadata = {}) => {
  try {
    await AuditLog.create({
      actor: req.user._id,
      action,
      targetUser,
      metadata,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (error) {
    console.error("[AUDIT] Unable to record event:", error.message);
  }
};
