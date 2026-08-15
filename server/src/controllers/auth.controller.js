import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getPermissionsForRole } from "../utils/permissions.js";

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
    if (["suspended", "banned", "deactivated"].includes(user.status))
      return res
        .status(403)
        .json({ success: false, message: "This account has been suspended." });
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
      "fullName username email avatar role status provider createdAt sessionsRevokedAt",
    );
    if (!user || ["suspended", "banned", "deactivated"].includes(user.status))
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
    return res.json({
      success: true,
      data: { token: signToken(String(user._id)), user },
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

  // Remove password before sending
  const { password: _, ...userData } = user.toObject ? user.toObject() : user;
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
    const { fullName, username, email, password, role, otp } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    if (!fullName || !username || !normalizedEmail || !password || !otp) {
      res.status(400).json({
        success: false,
        message: "fullName, username, email, password and OTP are required.",
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: username.toLowerCase().trim() },
      ],
    });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      res
        .status(409)
        .json({ success: false, message: `This ${field} is already in use.` });
      return;
    }

    const otpResult = verifyAndConsumeOtp(normalizedEmail, otp);
    if (!otpResult.success) {
      res.status(400).json({ success: false, message: otpResult.message });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      username: username.toLowerCase().trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "reader",
    });

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

    if (["suspended", "banned", "deactivated"].includes(user.status)) {
      res
        .status(403)
        .json({ success: false, message: "Your account has been suspended." });
      return;
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
    const { email, password } = req.body;

    if (!email || !password) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
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
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
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

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Current and new passwords are required.",
      });
      return;
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        success: false,
        message:
          "This account uses OAuth sign in and does not have a password yet.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res
        .status(401)
        .json({ success: false, message: "Current password is incorrect." });
      return;
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

    // Verify OTP using the helper function
    const otpResult = verifyAndConsumeOtp(email, otp);
    if (!otpResult.success) {
      res.status(400).json({ success: false, message: otpResult.message });
      return;
    }

    // Find the user and update the password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });

    // Optionally sign them in
    const token = signToken(String(user._id));
    await sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
