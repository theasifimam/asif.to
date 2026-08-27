import User from "../models/User.js";
import bcrypt from "bcrypt";
import { verifyAndConsumeOtp } from "./otp.controller.js";

import Article from "../models/Article.js";
import Course from "../models/Course.js";
import Chapter from "../models/Chapter.js";
import QuizQuestion from "../models/Question.js";
import { writeAudit } from "../utils/audit.js";
import mongoose from "mongoose";
import { roleRank } from "../utils/permissions.js";
import { logActivity } from "../services/activity.service.js";
import {
  sendAccountDeactivatedEmail,
  sendAccountDeletedEmail,
} from "../services/email.service.js";

// ─── Admin: List all users ──────────────────────────────────────────────────
// GET /api/v1/users?page=1&limit=10&search=&role=&status=
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const {
      search,
      role,
      status,
      provider,
      verified,
      sort = "newest",
    } = req.query;

    const filter = { deletedAt: null };

    if (search) {
      const escaped = String(search)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { fullName: { $regex: `^${escaped}`, $options: "i" } },
        { username: { $regex: `^${escaped}`, $options: "i" } },
        { email: { $regex: `^${escaped}`, $options: "i" } },
      ];
      if (mongoose.isValidObjectId(search)) filter.$or.push({ _id: search });
    }
    if (role && role !== "all") filter.role = role;
    if (status) filter.status = status;
    if (provider) filter.provider = provider;
    if (verified === "true" || verified === "false") {
      filter.isVerified = verified === "true";
    }

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      recently_active: { lastActiveAt: -1, lastLogin: -1 },
      least_active: { lastActiveAt: 1, lastLogin: 1 },
    };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[USERS] GetUsers error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Public: Get author profile ───────────────────────────────────────────
// GET /api/v1/users/public/:username
export const getPublicProfile = async (req, res) => {
  try {
    const rawUsername = String(req.params.username || "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, "");
    const user = await User.findOne({
      username: rawUsername,
      deletedAt: null,
      status: "active",
      "settings.profileVisibility": { $ne: "private" },
    })
      .select(
        "fullName username avatar bio location socials expertise certificates quizAttempts settings createdAt",
      )
      .populate("certificates.courseId", "title slug thumbnail")
      .populate("quizAttempts.courseId", "title slug thumbnail")
      .lean();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    user.quizAttempts =
      user.settings?.showLearningActivity === false
        ? []
        : (user.quizAttempts || []).filter(
            (attempt) => attempt.visibility === "public",
          );
    if (user.settings?.showAchievements === false) user.certificates = [];
    delete user.settings;
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetPublicProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Get single user ─────────────────────────────────────────────────
// GET /api/v1/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "fullName username email avatar bio location expertise socials role status provider isVerified createdAt updatedAt lastLogin lastActiveAt",
    );
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetUserById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Create a new user (provision access) ────────────────────────────
// POST /api/v1/users
export const createUser = async (req, res) => {
  try {
    const { fullName, username, email, password, role, status } = req.body;

    if (!fullName || !username || !email || !password) {
      res.status(400).json({
        success: false,
        message: "fullName, username, email and password are required.",
      });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      res.status(409).json({
        success: false,
        message: `A user with that ${field} already exists.`,
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "reader",
      status: status || "active",
    });

    const { password: _, ...userData } = user.toObject();
    await logActivity({ actor: req.user, action: "user.created", entityType: "user", entityId: user._id, entityTitle: user.fullName, description: "created a user account for", severity: "important", targetUserId: user._id, after: { role: user.role, status: user.status }, url: `/users/${user._id}` });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: { user: userData },
    });
  } catch (error) {
    console.error("[USERS] CreateUser error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(409).json({
        success: false,
        message: `A user with that ${field} already exists.`,
      });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Update user ─────────────────────────────────────────────────────
// PATCH /api/v1/users/:id
export const updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select("role username");
    if (!target) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    const isSelf = String(req.user?._id) === String(target._id);
    if (!isSelf && roleRank[target.role] >= roleRank[req.user?.role]) {
      return res.status(403).json({
        success: false,
        message: "You cannot update an account at or above your access level.",
      });
    }

    // Protect sensitive fields from direct update via this route
    const {
      password,
      role,
      status,
      isVerified,
      deletedAt,
      deletedBy,
      sessionsRevokedAt,
      oauthAccounts,
      providerAccountId,
      socials,
      expertise,
      settings,
      ...safeFields
    } = req.body;

    const updateData = { ...safeFields };

    if (
      updateData.username &&
      target.username &&
      target.username.toLowerCase() === updateData.username.toLowerCase()
    ) {
      delete updateData.username;
    }

    // Handle avatar upload if exists
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    // Handle JSON parsing for multipart form fields if necessary
    if (socials)
      updateData.socials =
        typeof socials === "string" ? JSON.parse(socials) : socials;
    if (expertise)
      updateData.expertise =
        typeof expertise === "string" ? JSON.parse(expertise) : expertise;
    if (settings)
      updateData.settings =
        typeof settings === "string" ? JSON.parse(settings) : settings;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    await writeAudit(req, "user.profile_updated", user._id, {
      fields: Object.keys(updateData),
    });

    res
      .status(200)
      .json({ success: true, message: "User updated.", data: { user } });
  } catch (error) {
    console.error("[USERS] UpdateUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Update user's role ──────────────────────────────────────────────
// PATCH /api/v1/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["reader", "author", "editor", "admin"];

    if (!role || !allowedRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: `Role must be one of: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: 'after' },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Role updated to '${role}'.`,
      data: { user },
    });
  } catch (error) {
    console.error("[USERS] UpdateUserRole error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Suspend / unsuspend user ───────────────────────────────────────
// PATCH /api/v1/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["active", "suspended", "pending"];

    if (!status || !allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(", ")}`,
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Status updated to '${status}'.`,
      data: { user },
    });
  } catch (error) {
    console.error("[USERS] UpdateUserStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Reset a user's password ────────────────────────────────────────
// PATCH /api/v1/users/:id/reset-password
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
      return;
    }

    const existingUser = await User.findById(req.params.id);
    if (existingUser && existingUser.provider !== "credentials") {
      return res.status(400).json({
        success: false,
        message:
          "OAuth accounts must manage credentials through their provider.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword, sessionsRevokedAt: new Date() },
      { returnDocument: 'after' },
    ).select("-password");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    await writeAudit(req, "user.password_reset", user._id);
    res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("[USERS] ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Admin: Delete user ─────────────────────────────────────────────────────
// DELETE /api/v1/users/:id
export const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (String(req.user?._id) === req.params.id) {
      res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
      return;
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "User permanently deleted." });
  } catch (error) {
    console.error("[USERS] DeleteUser error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get own profile (web/mobile users) ───────────────────────────────
// GET /api/v1/users/me/profile
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("completedCourses", "title slug thumbnail")
      .populate("certificates.courseId", "title slug thumbnail")
      .populate("quizAttempts.courseId", "title slug thumbnail")
      .populate({
        path: "bookmarks",
        populate: { path: "author topic" },
      });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    console.error("[USERS] GetMyProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateAttemptVisibility = async (req, res) => {
  try {
    const visibility = req.body.visibility === "public" ? "public" : "private";
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, "quizAttempts._id": req.params.attemptId },
      { $set: { "quizAttempts.$.visibility": visibility } },
      { returnDocument: 'after' },
    ).select("quizAttempts");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Quiz attempt not found." });
    res.json({
      success: true,
      data: user.quizAttempts.id(req.params.attemptId),
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to update score privacy." });
  }
};

export const getCertificate = async (req, res) => {
  try {
    const user = await User.findOne({
      "certificates.verificationId": req.params.verificationId,
    })
      .select("fullName username certificates")
      .populate("certificates.courseId", "title slug");
    const certificate = user?.certificates?.find(
      (item) => item.verificationId === req.params.verificationId,
    );
    if (!certificate)
      return res
        .status(404)
        .json({ success: false, message: "Certificate not found." });
    res.json({
      success: true,
      data: {
        certificate,
        student: { fullName: user.fullName, username: user.username },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to verify certificate." });
  }
};

// ─── Self: Update own profile ───────────────────────────────────────────────
// PATCH /api/v1/users/me/update
export const updateMyProfile = async (req, res) => {
  try {
    const { fullName, bio, location, avatar, socials, settings, mNumber } =
      req.body;

    const parsedSettings = settings
      ? typeof settings === "string"
        ? JSON.parse(settings)
        : settings
      : null;
    const safeSettings = parsedSettings
      ? {
          newsletter: parsedSettings.newsletter !== false,
          notifications: parsedSettings.notifications !== false,
          profileVisibility:
            parsedSettings.profileVisibility === "private"
              ? "private"
              : "public",
          showLearningActivity: parsedSettings.showLearningActivity !== false,
          showAchievements: parsedSettings.showAchievements !== false,
        }
      : null;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(fullName && { fullName }),
          ...(bio !== undefined && { bio }),
          ...(location !== undefined && { location }),
          ...(req.file && { avatar: `/uploads/avatars/${req.file.filename}` }),
          ...(socials && {
            socials:
              typeof socials === "string" ? JSON.parse(socials) : socials,
          }),
          ...(safeSettings &&
            Object.fromEntries(
              Object.entries(safeSettings).map(([key, value]) => [
                `settings.${key}`,
                value,
              ]),
            )),
          ...(mNumber !== undefined && { mNumber }),
        },
      },
      { returnDocument: 'after', runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("[USERS] UpdateMyProfile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deactivateMyAccount = async (req, res) => {
  try {
    const confirmation = String(req.body.confirmation || "").trim();
    if (confirmation !== req.user.username) {
      return res.status(400).json({
        success: false,
        message: "Enter your username exactly to deactivate your account.",
      });
    }

    // 1. Enforce OTP verification
    const otp = String(req.body.otp || "").trim();
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "A 6-digit email verification code is required to deactivate your account.",
      });
    }
    const otpResult = verifyAndConsumeOtp(req.user.email, otp);
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message || "Invalid or expired verification code.",
      });
    }

    // 2. Enforce Password verification if account has a password
    const fullUser = await User.findById(req.user._id).select("+password");
    if (fullUser?.password) {
      const password = String(req.body.password || "").trim();
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Your current account password is required.",
        });
      }
      const isMatch = await bcrypt.compare(password, fullUser.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect account password.",
        });
      }
    }

    if (req.user.role === "super_admin") {
      const remaining = await User.countDocuments({
        _id: { $ne: req.user._id },
        role: "super_admin",
        status: "active",
        deletedAt: null,
      });
      if (remaining === 0) {
        return res.status(409).json({
          success: false,
          message:
            "Promote another super admin before deactivating this account.",
        });
      }
    }
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          status: "deactivated",
          statusReason: "Deactivated by account owner",
          statusChangedAt: new Date(),
          statusChangedBy: req.user._id,
          sessionsRevokedAt: new Date(),
        },
      },
    );
    await writeAudit(req, "user.self_deactivated", req.user._id);
    // Fire farewell email — non-blocking so it doesn't delay the response
    sendAccountDeactivatedEmail(req.user.email, req.user.fullName).catch(
      (err) => console.error("[EMAIL] Deactivation email failed:", err.message),
    );
    res.clearCookie("token");
    return res.json({
      success: true,
      message:
        "Your account has been deactivated. Sign in any time to reactivate it instantly.",
    });
  } catch (error) {
    console.error("[USERS] Self-deactivation error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Unable to deactivate your account." });
  }
};

export const deleteMyAccount = async (req, res) => {
  try {
    const expected = `DELETE @${req.user.username}`;
    if (String(req.body.confirmation || "").trim() !== expected) {
      return res.status(400).json({
        success: false,
        message: `Enter ${expected} exactly to confirm deletion.`,
      });
    }

    // 1. Enforce OTP verification
    const otp = String(req.body.otp || "").trim();
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "A 6-digit email verification code is required to delete your account.",
      });
    }
    const otpResult = verifyAndConsumeOtp(req.user.email, otp);
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message || "Invalid or expired verification code.",
      });
    }

    // 2. Enforce Password verification if account has a password
    const fullUser = await User.findById(req.user._id).select("+password");
    if (fullUser?.password) {
      const password = String(req.body.password || "").trim();
      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Your current account password is required.",
        });
      }
      const isMatch = await bcrypt.compare(password, fullUser.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect account password.",
        });
      }
    }

    if (req.user.role === "super_admin") {
      const remaining = await User.countDocuments({
        _id: { $ne: req.user._id },
        role: "super_admin",
        status: "active",
        deletedAt: null,
      });
      if (remaining === 0) {
        return res.status(409).json({
          success: false,
          message: "Promote another super admin before deleting this account.",
        });
      }
    }
    const now = new Date();
    await User.updateOne(
      { _id: req.user._id },
      {
        $set: {
          status: "deactivated",
          statusReason: "Deletion requested by account owner",
          statusChangedAt: now,
          statusChangedBy: req.user._id,
          deletedAt: now,
          deletedBy: req.user._id,
          sessionsRevokedAt: now,
        },
      },
    );
    await writeAudit(req, "user.self_deleted", req.user._id);
    // Fire farewell email — non-blocking so it doesn't delay the response
    sendAccountDeletedEmail(req.user.email, req.user.fullName).catch(
      (err) => console.error("[EMAIL] Deletion email failed:", err.message),
    );
    res.clearCookie("token");
    return res.json({
      success: true,
      message:
        "Your account has been removed. You have 30 days to sign back in and restore it. Published content remains preserved.",
    });
  } catch (error) {
    console.error("[USERS] Self-deletion error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Unable to delete your account." });
  }
};

// ─── Self: Toggle bookmark ────────────────────────────────────────────────
// POST /api/v1/users/me/bookmarks/toggle/:articleId
export const toggleBookmark = async (req, res) => {
  try {
    const { articleId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const article = await Article.findById(articleId);
    if (!article) {
      res.status(404).json({ success: false, message: "Article not found." });
      return;
    }

    const isBookmarked = user.bookmarks.some(
      (id) => id.toString() === articleId,
    );

    if (isBookmarked) {
      // Remove from bookmarks
      user.bookmarks = user.bookmarks.filter(
        (id) => id.toString() !== articleId,
      );
      await user.save();
      res.status(200).json({
        success: true,
        message: "Article removed from bookmarks.",
        data: { isBookmarked: false },
      });
    } else {
      // Add to bookmarks
      user.bookmarks.push(articleId);
      await user.save();
      res.status(200).json({
        success: true,
        message: "Article added to bookmarks.",
        data: { isBookmarked: true },
      });
    }
  } catch (error) {
    console.error("[USERS] ToggleBookmark error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get own bookmarks ─────────────────────────────────────────────────
// GET /api/v1/users/me/bookmarks
export const getMyBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: { path: "author topic" },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: { bookmarks: user.bookmarks },
    });
  } catch (error) {
    console.error("[USERS] GetMyBookmarks error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Toggle saved item (course/chapter/cheatsheet/quiz_question) ──────
// POST /api/v1/users/me/saves/toggle
// body: { itemId, itemType }
export const toggleSavedItem = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;
    const VALID_TYPES = [
      "course",
      "chapter",
      "cheatsheet",
      "quiz_question",
      "interview_question",
    ];

    if (!itemId || !itemType || !VALID_TYPES.includes(itemType)) {
      res.status(400).json({
        success: false,
        message: "itemId and valid itemType are required.",
      });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const existingIndex = user.savedItems.findIndex(
      (s) =>
        s.itemId.toString() === itemId.toString() && s.itemType === itemType,
    );

    let isSaved;
    if (existingIndex >= 0) {
      user.savedItems.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.savedItems.push({ itemId, itemType });
      isSaved = true;
    }

    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json({ success: true, data: { isSaved, itemId, itemType } });
  } catch (error) {
    console.error("[USERS] ToggleSavedItem error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── Self: Get all saved items, populated by type ───────────────────────────
// GET /api/v1/users/me/saves
export const getMySavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const savedItems = user.savedItems || [];

    // Group by type for targeted DB queries
    const byType = {
      course: [],
      chapter: [],
      cheatsheet: [],
      quiz_question: [],
      interview_question: [],
    };
    savedItems.forEach((s) => {
      if (byType[s.itemType]) byType[s.itemType].push(s.itemId);
    });

    const [courses, chapters, cheatsheets, quizQuestions, interviewQuestions] =
      await Promise.all([
        byType.course.length
          ? Course.find({ _id: { $in: byType.course } })
              .select("title slug techId thumbnail")
              .lean()
          : [],
        byType.chapter.length
          ? Chapter.find({ _id: { $in: byType.chapter } })
              .select("title slug summary course")
              .populate("course", "title slug")
              .lean()
          : [],
        byType.cheatsheet.length
          ? Article.find({
              _id: { $in: byType.cheatsheet },
              type: "cheatsheet",
            })
              .select("title slug techId")
              .lean()
          : [],
        byType.quiz_question.length
          ? QuizQuestion.find({
              _id: { $in: byType.quiz_question },
              type: "quiz",
            })
              .select("question options correctIndex")
              .lean()
          : [],
        byType.interview_question.length
          ? QuizQuestion.find({
              _id: { $in: byType.interview_question },
              type: "interview",
            })
              .select("question slug course difficulty")
              .populate("course", "title slug")
              .lean()
          : [],
      ]);

    // Merge back with savedAt timestamps
    const populatedItems = savedItems
      .map((s) => {
        let item = null;
        if (s.itemType === "course")
          item = courses.find((c) => c._id.toString() === s.itemId.toString());
        else if (s.itemType === "chapter")
          item = chapters.find((c) => c._id.toString() === s.itemId.toString());
        else if (s.itemType === "cheatsheet")
          item = cheatsheets.find(
            (c) => c._id.toString() === s.itemId.toString(),
          );
        else if (s.itemType === "quiz_question")
          item = quizQuestions.find(
            (q) => q._id.toString() === s.itemId.toString(),
          );
        else if (s.itemType === "interview_question")
          item = interviewQuestions.find(
            (q) => q._id.toString() === s.itemId.toString(),
          );
        return { itemType: s.itemType, savedAt: s.savedAt, ...item };
      })
      .filter((s) => s._id); // filter out items that may have been deleted

    res
      .status(200)
      .json({ success: true, data: { savedItems: populatedItems } });
  } catch (error) {
    console.error("[USERS] GetMySavedItems error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
