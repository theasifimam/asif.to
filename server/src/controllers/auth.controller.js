
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { sendWelcomeEmail } from "../services/email.service.js";
import { verifyAndConsumeOtp } from "./otp.controller.js";
import dotenv from "dotenv";
dotenv.config();

const signToken = (id) => {
  const secret = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || "fallback_secret_key_12345";
  return jwt.sign({ id }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const sendTokenResponse = (
res,
statusCode,
user,
token) =>
{
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie("token", token, cookieOptions);

  // Remove password before sending
  const { password: _, ...userData } = user.toObject ? user.toObject() : user;

  res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? "Account created successfully" : "Login successful",
    data: {
      user: userData,
      token
    }
  });
};

// POST /api/v1/auth/signup
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password, role } = req.body;

    if (!fullName || !username || !email || !password) {
      res.status(400).json({ success: false, message: "fullName, username, email and password are required." });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      res.status(409).json({ success: false, message: `This ${field} is already in use.` });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      fullName,
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role || "reader"
    });

    const token = signToken(String(newUser._id));

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, fullName).catch((err) =>
    console.error("[AUTH] Welcome email failed:", err)
    );

    sendTokenResponse(res, 201, newUser, token);
  } catch (error) {
    console.error("[AUTH] Signup error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      res.status(409).json({ success: false, message: `This ${field} is already taken.` });
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
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({ success: false, message: "Your account has been suspended." });
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    sendTokenResponse(res, 200, user, token);
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
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    // Only allow admin, editor, author roles
    const allowedRoles = ["admin", "editor", "author"];
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ success: false, message: "Access denied. Admin privileges required." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    if (user.status === "suspended") {
      res.status(403).json({ success: false, message: "Your account has been suspended." });
      return;
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    sendTokenResponse(res, 200, user, token);
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
      data: { user }
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
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: "Signed out successfully." });
};

// PATCH /api/v1/auth/update-password
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new passwords are required." });
      return;
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Current password is incorrect." });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save({ validateBeforeSave: false });

    const token = signToken(String(user._id));
    sendTokenResponse(res, 200, user, token);
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
      res.status(400).json({ success: false, message: "Username is required." });
      return;
    }
    const user = await User.findOne({ username: username.toLowerCase().trim() });
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
      res.status(400).json({ success: false, message: "Email, OTP, and new password are required." });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
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
    sendTokenResponse(res, 200, user, token);
  } catch (error) {
    console.error("[AUTH] ResetPassword error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};