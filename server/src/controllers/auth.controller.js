import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getPermissionsForRole } from "../utils/permissions.js";
import { canRecreateDeletedAccount } from "../utils/accountLifecycle.js";

import { sendWelcomeEmail } from "../services/email.service.js";
import { verifyAndConsumeOtp } from "./otp.controller.js";
import dotenv from "dotenv";
dotenv.config();

const signToken = (id) => {
  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_ACCESS_SECRET ||
    "fallback_secret_key_12345";
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const safeEqual = (left = "", right = "") => {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

async function availableUsername(name, email) {
  const base =
    String(name || email?.split("@")[0] || "learner")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "learner";
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt
      ? `${base.slice(0, 20)}-${crypto.randomBytes(3).toString("hex")}`
      : base;
    if (candidate.length >= 3 && !(await User.exists({ username: candidate })))
      return candidate;
  }
  return `learner-${crypto.randomUUID().slice(0, 12)}`;
}

// Server-to-server callback used by Auth.js after a provider has validated the
// OAuth response. It never accepts provider access tokens and never returns a
// password, internal secret, or OAuth credential.
export const upsertOAuthUser = async (req, res) => {
  try {
    const expected = process.env.AUTH_INTERNAL_SECRET;
    if (!expected || !safeEqual(req.get("x-auth-internal-secret"), expected)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized authentication callback.",
      });
    }
    const { provider, providerAccountId, name, email, image, emailVerified } =
      req.body || {};
    if (
      !["google", "github"].includes(provider) ||
      !providerAccountId ||
      !email
    ) {
      return res.status(400).json({
        success: false,
        message: "The provider did not return a usable email address.",
      });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({
      oauthAccounts: {
        $elemMatch: { provider, providerAccountId: String(providerAccountId) },
      },
    });
    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
      if (user && !emailVerified)
        return res.status(409).json({
          success: false,
          message:
            "This email already belongs to an account and the provider did not verify it.",
        });
      if (user) {
        user.oauthAccounts ||= [];
        if (
          !user.oauthAccounts.some(
            (account) =>
              account.provider === provider &&
              account.providerAccountId === String(providerAccountId),
          )
        ) {
          user.oauthAccounts.push({
            provider,
            providerAccountId: String(providerAccountId),
          });
        }
      } else {
        user = new User({
          fullName: String(name || normalizedEmail.split("@")[0])
            .trim()
            .slice(0, 120),
          username: await availableUsername(name, normalizedEmail),
          email: normalizedEmail,
          avatar: image || undefined,
          provider,
          providerAccountId: String(providerAccountId),
          oauthAccounts: [
            { provider, providerAccountId: String(providerAccountId) },
          ],
          isVerified: Boolean(emailVerified),
          status: "active",
          role: "reader",
        });
      }
    }
    // Admin-imposed blocks are always hard-blocked
    if (["suspended", "banned"].includes(user.status))
      return res
        .status(403)
        .json({ success: false, message: "This account has been suspended." });

    // Soft-deleted: allow restore within 30-day grace window
    if (user.deletedAt) {
      if (canRecreateDeletedAccount(user)) {
        if (!emailVerified) {
          return res.status(403).json({
            success: false,
            message:
              "The provider must verify this email before the account can be recreated.",
          });
        }
        user.role = "reader";
        user.status = "active";
        user.statusReason = undefined;
        user.statusChangedAt = new Date();
        user.statusChangedBy = undefined;
        user.deletedAt = null;
        user.deletedBy = null;
        user.sessionsRevokedAt = undefined;
        user.suspensionExpiresAt = undefined;
        user.provider = provider;
        user.providerAccountId = String(providerAccountId);
        user.oauthAccounts = [
          { provider, providerAccountId: String(providerAccountId) },
        ];
        user.isVerified = true;
      } else if (user.deletedBy && String(user.deletedBy) !== String(user._id)) {
        return res.status(403).json({
          success: false,
          message: "This account cannot be recreated.",
        });
      } else {
        const daysSince =
          (Date.now() - new Date(user.deletedAt).getTime()) / 86_400_000;
        if (daysSince > 30)
          return res.status(403).json({
            success: false,
            message:
              "This account was permanently deleted and can no longer be recovered.",
          });
        // Within grace period — restore
        user.deletedAt = null;
        user.deletedBy = null;
        user.status = "active";
        user.statusReason = "Restored by owner within 30-day grace period (OAuth)";
        user.statusChangedAt = new Date();
      }
    } else if (user.status === "deactivated") {
      // Deactivated: let the user back in — this is a self-service reactivation
      user.status = "active";
      user.statusReason = "Reactivated by owner via OAuth login";
      user.statusChangedAt = new Date();
    }
    if (!user.avatar && image) user.avatar = image;
    if (!user.fullName && name) user.fullName = String(name).slice(0, 120);
    user.provider ||= provider;
    user.providerAccountId ||= String(providerAccountId);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    return res.json({
      success: true,
      data: {
        user: {
          id: String(user._id),
          name: user.fullName,
          email: user.email,
          image: user.avatar,
          username: user.username,
          provider,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error(
      "[AUTH] OAuth account persistence failed:",
      error?.code || error?.message,
    );
    return res.status(error?.code === 11000 ? 409 : 500).json({
      success: false,
      message:
        error?.code === 11000
          ? "This OAuth account is already linked."
          : "Unable to complete sign in.",
    });
  }
};

export const issueOAuthSession = async (req, res) => {
  try {
    const expected = process.env.AUTH_INTERNAL_SECRET;
    if (!expected || !safeEqual(req.get("x-auth-internal-secret"), expected)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized authentication session request.",
      });
    }
    const user = await User.findById(req.body?.userId).select(
      "+password fullName username email avatar role status provider createdAt sessionsRevokedAt",
    );
    // By the time this runs, upsertOAuthUser has already reactivated the account if applicable.
    // Only hard-block admin-imposed statuses.
    if (!user || ["suspended", "banned"].includes(user.status))
      return res
        .status(403)
        .json({ success: false, message: "This account is unavailable." });
    // Permanently deleted (grace period expired)
    if (
      user.status === "deactivated" ||
      (user.deletedAt &&
        (Date.now() - new Date(user.deletedAt).getTime()) / 86_400_000 > 30)
    )
      return res
        .status(403)
        .json({ success: false, message: "This account is unavailable." });
    if (
      user.sessionsRevokedAt &&
      Number(req.body?.authenticatedAt || 0) <= user.sessionsRevokedAt.getTime()
    ) {
      return res.status(401).json({
        success: false,
        message: "This session has been revoked. Please sign in again.",
      });
    }
    const rawUser = user.toObject();
    const { password: _, ...userData } = rawUser;
    userData.hasPassword = Boolean(rawUser.password);
    return res.json({
      success: true,
      data: { token: signToken(String(user._id)), user: userData },
    });
  } catch (error) {
    console.error("[AUTH] OAuth session issue failed:", error?.message);
    return res.status(500).json({
      success: false,
      message: "Unable to create the application session.",
    });
  }
};

const sendTokenResponse = async (res, statusCode, user, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  // Expose only whether a local credential exists. OAuth users can add a
  // password later without changing or unlinking their OAuth provider.
  const rawUser = user.toObject ? user.toObject() : user;
  const { password: _, ...userData } = rawUser;
  userData.hasPassword = Boolean(user.password || rawUser.password);
  userData.permissions = await getPermissionsForRole(userData.role);

  res.status(statusCode).json({
    success: true,
    message:
      statusCode === 201 ? "Account created successfully" : "Login successful",
    data: {
      user: userData,
      token,
    },
  });
};

// POST /api/v1/auth/signup
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedUsername = username?.toLowerCase().trim();

    if (!fullName || !username || !normalizedEmail || !password || !otp) {
      res.status(400).json({
        success: false,
        message: "fullName, username, email, password and OTP are required.",
      });
      return;
    }

    const [emailOwner, usernameOwner] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: normalizedUsername }),
    ]);
    const recreatingAccount = canRecreateDeletedAccount(emailOwner);

    if (emailOwner?.status === "banned") {
      return res.status(403).json({
        success: false,
        message: "This account has been banned and cannot be recreated.",
      });
    }
    if (emailOwner && !recreatingAccount) {
      return res.status(409).json({
        success: false,
        message: "This email is already in use.",
      });
    }
    if (
      usernameOwner &&
      String(usernameOwner._id) !== String(emailOwner?._id)
    ) {
      return res.status(409).json({
        success: false,
        message: "This username is already in use.",
      });
    }

    const otpResult = verifyAndConsumeOtp(normalizedEmail, otp, "signup");
    if (!otpResult.success) {
      res.status(400).json({ success: false, message: otpResult.message });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    let newUser;
    if (recreatingAccount) {
      newUser = emailOwner;
      newUser.fullName = fullName;
      newUser.username = normalizedUsername;
      newUser.password = hashedPassword;
      newUser.role = "reader";
      newUser.status = "active";
      newUser.statusReason = undefined;
      newUser.statusChangedAt = new Date();
      newUser.statusChangedBy = undefined;
      newUser.deletedAt = null;
      newUser.deletedBy = null;
      newUser.sessionsRevokedAt = undefined;
      newUser.suspensionExpiresAt = undefined;
      newUser.provider = "credentials";
      newUser.providerAccountId = null;
      newUser.oauthAccounts = [];
      newUser.isVerified = true;
      newUser.lastLogin = new Date();
      await newUser.save();
    } else {
      newUser = await User.create({
        fullName,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        role: "reader",
        isVerified: true,
      });
    }

    const token = signToken(String(newUser._id));

    // Send welcome email (non-blocking)
    sendWelcomeEmail(normalizedEmail, fullName).catch((err) =>
      console.error("[AUTH] Welcome email failed:", err),
    );

    await sendTokenResponse(res, 201, newUser, token);
  } catch (error) {
    console.error("[AUTH] Signup error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res
        .status(409)
        .json({ success: false, message: `This ${field} is already taken.` });
      return;
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      res.status(400).json({ success: false, message: messages.join(", ") });
      return;
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/v1/auth/signin
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email/Username and password are required.",
      });
      return;
    }

    const login = email.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const isMatch = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    // Admin-imposed blocks are always hard-blocked
    if (["suspended", "banned"].includes(user.status)) {
      res
        .status(403)
        .json({ success: false, message: "Your account has been suspended." });
      return;
    }

    // Soft-deleted: allow restore within 30-day grace window
    if (user.deletedAt) {
      if (user.deletedBy && String(user.deletedBy) !== String(user._id)) {
        res.status(403).json({
          success: false,
          message: "This account was deleted by an administrator.",
        });
        return;
      }
      const daysSince =
        (Date.now() - new Date(user.deletedAt).getTime()) / 86_400_000;
      if (daysSince > 30) {
        res.status(403).json({
          success: false,
          message:
            "This account was permanently deleted and can no longer be recovered.",
        });
        return;
      }
      // Within grace period — restore silently
      user.deletedAt = null;
      user.deletedBy = null;
      user.status = "active";
      user.statusReason = "Restored by owner within 30-day grace period";
      user.statusChangedAt = new Date();
    } else if (user.status === "deactivated") {
      // Deactivated: reactivate on sign-in
      user.status = "active";
      user.statusReason = "Reactivated by owner via credentials login";
      user.statusChangedAt = new Date();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    await sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] Signin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/v1/auth/admin/signin  (admins/editors/authors only)
export const adminSignin = async (req, res) => {
  try {
    const { email, emailOrUsername, password } = req.body;
    const loginInput = (emailOrUsername || email || "").toLowerCase().trim();

    if (!loginInput || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email/Username and password are required." });
      return;
    }

    const user = await User.findOne({
      $or: [{ email: loginInput }, { username: loginInput }],
    }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    // Only allow admin, editor, author roles
    const allowedRoles = ["super_admin", "admin", "editor", "author"];
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
      return;
    }

    const isMatch = user.password
      ? await bcrypt.compare(password, user.password)
      : false;
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    if (["suspended", "banned", "deactivated"].includes(user.status)) {
      res
        .status(403)
        .json({ success: false, message: `Your account is ${user.status}.` });
      return;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    await sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] Admin signin error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    const rawUser = user.toObject();
    const { password: _, ...userData } = rawUser;
    userData.hasPassword = Boolean(rawUser.password);
    res.status(200).json({
      success: true,
      data: {
        user: {
          ...userData,
          permissions: req.user.effectivePermissions || [],
        },
      },
    });
  } catch (error) {
    console.error("[AUTH] GetMe error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/v1/auth/signout
export const signout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Signed out successfully." });
};

// PATCH /api/v1/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: "A new password is required.",
      });
      return;
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Your current password is required.",
        });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }
    } else {
      const otpResult = verifyAndConsumeOtp(
        user.email,
        req.body.otp,
        "forgot-password",
      );
      if (!otpResult.success) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
        });
      }
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    await sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] UpdatePassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/auth/check-username
export const checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      res
        .status(400)
        .json({ success: false, message: "Username is required." });
      return;
    }
    const user = await User.findOne({
      username: username.toLowerCase().trim(),
    });
    res.status(200).json({ success: true, available: !user });
  } catch (error) {
    console.error("[AUTH] CheckUsername error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/v1/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required.",
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    if (["suspended", "banned"].includes(user.status)) {
      return res.status(403).json({
        success: false,
        message: "This account is unavailable.",
      });
    }
    if (
      user.deletedAt &&
      user.deletedBy &&
      String(user.deletedBy) !== String(user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "This account was deleted by an administrator.",
      });
    }

    // Verify OTP using the helper function
    const otpResult = verifyAndConsumeOtp(email, otp, "forgot-password");
    if (!otpResult.success) {
      res.status(400).json({ success: false, message: otpResult.message });
      return;
    }

    if (user.deletedAt) {
      const daysSince =
        (Date.now() - new Date(user.deletedAt).getTime()) / 86_400_000;
      if (daysSince > 30) {
        return res.status(403).json({
          success: false,
          message:
            "This account was permanently deleted and can no longer be recovered.",
        });
      }
      user.deletedAt = null;
      user.deletedBy = null;
      user.status = "active";
      user.statusReason = "Restored by owner during password reset";
      user.statusChangedAt = new Date();
    } else if (user.status === "deactivated") {
      user.status = "active";
      user.statusReason = "Reactivated by owner during password reset";
      user.statusChangedAt = new Date();
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Optionally sign them in
    const token = signToken(String(user._id));
    await sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
