import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import Article from "../models/Article.js";
import AuditLog from "../models/AuditLog.js";
import UserNote from "../models/UserNote.js";
import UserInvitation from "../models/UserInvitation.js";
import { roleRank } from "../utils/permissions.js";
import { writeAudit } from "../utils/audit.js";
import { sendUserInvitationEmail } from "../services/email.service.js";

const pageOptions = (query, defaultLimit = 20) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit),
  );
  return { page, limit, skip: (page - 1) * limit };
};

const ensureManageable = (actor, target, { roleChange = false } = {}) => {
  if (!target) return { status: 404, message: "User not found." };
  if (String(actor._id) === String(target._id)) {
    if (roleChange && actor.role === "super_admin") return null;
    return {
      status: 400,
      message: "You cannot perform this action on your own account.",
    };
  }
  if (roleRank[target.role] >= roleRank[actor.role]) {
    return {
      status: 403,
      message: "You cannot modify an account at or above your access level.",
    };
  }
  if (roleChange && actor.role !== "super_admin") {
    return {
      status: 403,
      message: "Only a super admin can change account roles.",
    };
  }
  return null;
};

export const getUserOverview = async (_req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
    const activeSince = new Date(now.getTime() - 30 * 86400000);
    const [summary, growth, recent, pendingInvitations] = await Promise.all([
      User.aggregate([
        { $match: { deletedAt: null } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
            readers: { $sum: { $cond: [{ $eq: ["$role", "reader"] }, 1, 0] } },
            authors: { $sum: { $cond: [{ $eq: ["$role", "author"] }, 1, 0] } },
            admins: {
              $sum: {
                $cond: [{ $in: ["$role", ["admin", "super_admin"]] }, 1, 0],
              },
            },
            suspended: {
              $sum: {
                $cond: [{ $in: ["$status", ["suspended", "banned"]] }, 1, 0],
              },
            },
            newUsers: {
              $sum: { $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0] },
            },
            recentlyActive: {
              $sum: { $cond: [{ $gte: ["$lastActiveAt", activeSince] }, 1, 0] },
            },
          },
        },
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(now.getTime() - 90 * 86400000) },
            deletedAt: null,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            users: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.find({ deletedAt: null })
        .select(
          "fullName username email avatar role status provider createdAt lastLogin lastActiveAt",
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      UserInvitation.countDocuments({
        status: "pending",
        expiresAt: { $gt: now },
      }),
    ]);
    res.json({
      success: true,
      data: {
        summary: { ...(summary[0] || {}), pendingInvitations },
        growth,
        recent,
      },
    });
  } catch (error) {
    console.error("[USERS] Overview error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Unable to load user overview." });
  }
};

export const getManagedUser = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid user ID." });
    const [user, content, recentArticles, notes, audit] = await Promise.all([
      User.findById(req.params.id)
        .select("-password -oauthAccounts.providerAccountId")
        .lean(),
      Article.aggregate([
        { $match: { author: new mongoose.Types.ObjectId(req.params.id) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            views: { $sum: "$readCount" },
            lastPublished: { $max: "$updatedAt" },
          },
        },
      ]),
      Article.find({ author: req.params.id })
        .select("title slug status readCount updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      UserNote.find({ user: req.params.id })
        .populate("author", "fullName username avatar")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      AuditLog.find({ targetUser: req.params.id })
        .populate("actor", "fullName username avatar")
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
    ]);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    res.json({
      success: true,
      data: { user, content, recentArticles, notes, audit },
    });
  } catch (error) {
    console.error("[USERS] Detail error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Unable to load user details." });
  }
};

export const moderateUser = async (req, res) => {
  try {
    const { status, reason, expiresAt } = req.body;
    const allowed = ["active", "suspended", "banned", "deactivated"];
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ success: false, message: "Invalid account status." });
    if (status !== "active" && !String(reason || "").trim())
      return res
        .status(400)
        .json({ success: false, message: "A reason is required." });
    const target = await User.findById(req.params.id);
    const denied = ensureManageable(req.user, target);
    if (denied)
      return res
        .status(denied.status)
        .json({ success: false, message: denied.message });
    const previous = target.status;
    target.status = status;
    target.statusReason =
      status === "active" ? undefined : String(reason).trim();
    target.statusChangedAt = new Date();
    target.statusChangedBy = req.user._id;
    target.suspensionExpiresAt =
      status === "suspended" && expiresAt ? new Date(expiresAt) : undefined;
    target.sessionsRevokedAt = new Date();
    await target.save({ validateBeforeSave: false });
    await writeAudit(req, `user.${status}`, target._id, {
      previousStatus: previous,
      reason: target.statusReason,
      expiresAt: target.suspensionExpiresAt,
    });
    res.json({
      success: true,
      message: `Account marked ${status}.`,
      data: { user: target },
    });
  } catch (error) {
    console.error("[USERS] Moderation error:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Unable to update account status." });
  }
};

export const changeManagedRole = async (req, res) => {
  try {
    const allowed = ["reader", "author", "editor", "admin", "super_admin"];
    if (!allowed.includes(req.body.role))
      return res.status(400).json({ success: false, message: "Invalid role." });
    const target = await User.findById(req.params.id);
    const denied = ensureManageable(req.user, target, { roleChange: true });
    if (denied)
      return res
        .status(denied.status)
        .json({ success: false, message: denied.message });
    if (target.role === "super_admin" && req.body.role !== "super_admin") {
      const remainingSuperAdmins = await User.countDocuments({
        _id: { $ne: target._id },
        role: "super_admin",
        status: "active",
        deletedAt: null,
      });
      if (remainingSuperAdmins === 0) {
        return res.status(409).json({
          success: false,
          message:
            "Promote another active super admin before removing your own super-admin access.",
        });
      }
    }
    const previous = target.role;
    target.role = req.body.role;
    target.sessionsRevokedAt = new Date();
    await target.save({ validateBeforeSave: false });
    await writeAudit(req, "user.role_changed", target._id, {
      previousRole: previous,
      role: target.role,
    });
    res.json({
      success: true,
      message: `Role changed to ${target.role}.`,
      data: { user: target },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to change user role." });
  }
};

export const revokeUserSessions = async (req, res) => {
  const target = await User.findById(req.params.id);
  const denied = ensureManageable(req.user, target);
  if (denied)
    return res
      .status(denied.status)
      .json({ success: false, message: denied.message });
  target.sessionsRevokedAt = new Date();
  await target.save({ validateBeforeSave: false });
  await writeAudit(req, "user.sessions_revoked", target._id);
  res.json({ success: true, message: "All user sessions have been revoked." });
};

export const softDeleteUser = async (req, res) => {
  const reason = String(req.body.reason || "").trim();
  if (!reason)
    return res
      .status(400)
      .json({ success: false, message: "A deactivation reason is required." });
  const target = await User.findById(req.params.id);
  const denied = ensureManageable(req.user, target);
  if (denied)
    return res
      .status(denied.status)
      .json({ success: false, message: denied.message });
  target.status = "deactivated";
  target.deletedAt = new Date();
  target.deletedBy = req.user._id;
  target.sessionsRevokedAt = new Date();
  await target.save({ validateBeforeSave: false });
  await writeAudit(req, "user.soft_deleted", target._id, { reason });
  res.json({
    success: true,
    message: "Account deactivated. Published content was preserved.",
  });
};

export const addUserNote = async (req, res) => {
  const body = String(req.body.body || "").trim();
  if (!body)
    return res
      .status(400)
      .json({ success: false, message: "Note text is required." });
  const note = await UserNote.create({
    user: req.params.id,
    author: req.user._id,
    body,
  });
  await note.populate("author", "fullName username avatar");
  await writeAudit(req, "user.note_created", req.params.id);
  res.status(201).json({ success: true, data: { note } });
};

export const listAuditLogs = async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filter = req.query.action ? { action: req.query.action } : {};
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("actor targetUser", "fullName username email avatar role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

const invitationToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  return {
    token,
    hash: crypto.createHash("sha256").update(token).digest("hex"),
  };
};

export const listInvitations = async (req, res) => {
  const { page, limit, skip } = pageOptions(req.query);
  const filter = req.query.status ? { status: req.query.status } : {};
  const [invitations, total] = await Promise.all([
    UserInvitation.find(filter)
      .populate("invitedBy", "fullName username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    UserInvitation.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: {
      invitations: invitations.map((invite) => ({
        ...invite,
        effectiveStatus:
          invite.status === "pending" && invite.expiresAt < new Date()
            ? "expired"
            : invite.status,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

export const createInvitation = async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const role = req.body.role;
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    !["author", "editor", "admin"].includes(role)
  )
    return res.status(400).json({
      success: false,
      message: "A valid email and invitational role are required.",
    });
  if (role === "admin" && req.user.role !== "super_admin")
    return res.status(403).json({
      success: false,
      message: "Only a super admin can invite admins.",
    });
  if (await User.exists({ email }))
    return res.status(409).json({
      success: false,
      message: "A user with this email already exists.",
    });
  await UserInvitation.updateMany(
    { email, status: "pending" },
    { $set: { status: "cancelled", cancelledAt: new Date() } },
  );
  const { token, hash } = invitationToken();
  const invitation = await UserInvitation.create({
    email,
    role,
    tokenHash: hash,
    invitedBy: req.user._id,
    expiresAt: new Date(Date.now() + 7 * 86400000),
  });
  const inviteUrl = `${(process.env.WEB_URL || "https://asif.to").replace(/\/$/, "")}/login?invite=${token}`;
  let delivered = true;
  try {
    await sendUserInvitationEmail(email, role, inviteUrl);
  } catch (error) {
    delivered = false;
    console.error("[INVITATIONS] Email delivery failed:", error.message);
  }
  await writeAudit(req, "invitation.sent", undefined, {
    invitationId: invitation._id,
    email,
    role,
  });
  res.status(201).json({
    success: true,
    message: delivered
      ? "Invitation sent."
      : "Invitation created; email delivery is unavailable, so copy the secure link.",
    data: {
      invitation: { ...invitation.toObject(), tokenHash: undefined },
      inviteUrl,
      delivered,
    },
  });
};

export const cancelInvitation = async (req, res) => {
  const invitation = await UserInvitation.findOneAndUpdate(
    { _id: req.params.id, status: "pending" },
    { status: "cancelled", cancelledAt: new Date() },
    { new: true },
  );
  if (!invitation)
    return res
      .status(404)
      .json({ success: false, message: "Pending invitation not found." });
  await writeAudit(req, "invitation.cancelled", undefined, {
    invitationId: invitation._id,
    email: invitation.email,
  });
  res.json({ success: true, message: "Invitation cancelled." });
};

export const acceptInvitation = async (req, res) => {
  const expected = process.env.AUTH_INTERNAL_SECRET;
  const received = req.get("x-auth-internal-secret") || "";
  if (
    !expected ||
    received.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected))
  ) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized invitation request." });
  }
  const token = String(req.body.token || "");
  if (!/^[a-f0-9]{64}$/.test(token))
    return res
      .status(400)
      .json({ success: false, message: "Invalid invitation." });
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const invitation = await UserInvitation.findOne({
    tokenHash,
    status: "pending",
    expiresAt: { $gt: new Date() },
  }).select("+tokenHash");
  if (!invitation)
    return res.status(410).json({
      success: false,
      message: "This invitation is invalid or has expired.",
    });
  const user = await User.findById(req.body.userId);
  if (!user || user.email !== invitation.email)
    return res.status(403).json({
      success: false,
      message: "Sign in using the email address that was invited.",
    });
  user.role = invitation.role;
  user.status = "active";
  await user.save({ validateBeforeSave: false });
  invitation.status = "accepted";
  invitation.acceptedAt = new Date();
  await invitation.save();
  await AuditLog.create({
    actor: invitation.invitedBy,
    action: "invitation.accepted",
    targetUser: user._id,
    metadata: { invitationId: invitation._id, role: invitation.role },
  });
  res.json({
    success: true,
    data: { username: user.username, role: user.role },
  });
};

export const exportUsersCsv = async (_req, res) => {
  const users = await User.find({ deletedAt: null })
    .select(
      "fullName username email role status provider isVerified createdAt lastActiveAt",
    )
    .sort({ createdAt: -1 })
    .lean();
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = [
    [
      "Name",
      "Username",
      "Email",
      "Role",
      "Status",
      "Provider",
      "Verified",
      "Joined",
      "Last active",
    ],
    ...users.map((user) => [
      user.fullName,
      user.username,
      user.email,
      user.role,
      user.status,
      user.provider,
      user.isVerified,
      user.createdAt?.toISOString(),
      user.lastActiveAt?.toISOString(),
    ]),
  ];
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=asif-users.csv");
  res.send(rows.map((row) => row.map(escape).join(",")).join("\n"));
};
