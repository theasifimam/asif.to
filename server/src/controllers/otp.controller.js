import crypto from "crypto";
import { sendOtpEmail } from "../services/email.service.js";
import User from "../models/User.js";
import { canRecreateDeletedAccount } from "../utils/accountLifecycle.js";

// ─── Simple in-memory OTP store: { email → { otp, expiresAt, attempts } } ──
// In production replace with Redis

const otpStore = new Map();

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Generate a 6-digit OTP */
const generateOtp = () => String(crypto.randomInt(100000, 999999));

// POST /api/v1/auth/otp/send
export const sendOtp = async (req, res) => {
  let normalizedEmail;
  try {
    const { email, fullName, purpose = "verification" } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    normalizedEmail = email.toLowerCase().trim();

    const allowedPurposes = [
      "verification",
      "signup",
      "signin",
      "forgot-password",
      "account-security",
    ];
    if (!allowedPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code purpose.",
      });
    }

    let targetUser = null;

    // For signup: ensure email is NOT already taken
    if (purpose === "signup") {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser?.status === "banned") {
        return res.status(403).json({
          success: false,
          message: "This account has been banned and cannot be recreated.",
        });
      }
      if (existingUser && !canRecreateDeletedAccount(existingUser)) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }
      targetUser = existingUser;
    }

    // For signin or forgot-password: ensure account exists
    if (purpose === "signin" || purpose === "forgot-password") {
      targetUser = await User.findOne({ email: normalizedEmail });
      if (!targetUser) {
        res
          .status(404)
          .json({
            success: false,
            message: "No account found with this email.",
          });
        return;
      }
      if (["suspended", "banned"].includes(targetUser.status)) {
        return res.status(403).json({
          success: false,
          message: "This account is unavailable.",
        });
      }
      if (
        targetUser.deletedAt &&
        targetUser.deletedBy &&
        String(targetUser.deletedBy) !== String(targetUser._id)
      ) {
        return res.status(403).json({
          success: false,
          message: "This account was deleted by an administrator.",
        });
      }
      if (
        targetUser.deletedAt &&
        Date.now() - new Date(targetUser.deletedAt).getTime() >
          30 * 86_400_000
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This account was permanently deleted and can no longer be recovered.",
        });
      }
    }

    // Rate-limit: block if already pending and not expired yet (< 1 min since last send)
    const existingOtp = otpStore.get(normalizedEmail);
    if (existingOtp && existingOtp.expiresAt - Date.now() > EXPIRY_MS - 60_000) {
      res
        .status(429)
        .json({
          success: false,
          message: "Please wait 1 minute before requesting another code.",
        });
      return;
    }

    const otp = generateOtp();
    otpStore.set(normalizedEmail, {
      otp,
      purpose,
      expiresAt: Date.now() + EXPIRY_MS,
      attempts: 0,
    });

    const name =
      fullName?.trim() ||
      targetUser?.fullName ||
      normalizedEmail.split("@")[0];

    // Do not tell the client that the code was sent until SMTP has accepted it.
    // This also lets the UI surface configuration and provider failures.
    await sendOtpEmail(normalizedEmail, name, otp, purpose);

    res
      .status(200)
      .json({
        success: true,
        message: `Verification code sent to ${normalizedEmail}.`,
      });
  } catch (error) {
    if (normalizedEmail) otpStore.delete(normalizedEmail);
    console.error("[OTP] sendOtp error:", error);
    res.status(500).json({
      success: false,
      message: error?.message?.includes("Email delivery is not configured")
        ? "Email delivery service is not configured on the server."
        : "Verification email could not be delivered. Please try again shortly.",
    });
  }
};

// POST /api/v1/auth/otp/verify
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res
        .status(400)
        .json({ success: false, message: "Email and OTP are required." });
      return;
    }

    const entry = otpStore.get(email.toLowerCase());

    if (!entry) {
      res
        .status(400)
        .json({
          success: false,
          message: "No verification code found. Please request a new one.",
        });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      res
        .status(400)
        .json({
          success: false,
          message: "Verification code has expired. Please request a new one.",
        });
      return;
    }

    entry.attempts++;
    if (entry.attempts > MAX_ATTEMPTS) {
      otpStore.delete(email.toLowerCase());
      res
        .status(400)
        .json({
          success: false,
          message: "Too many failed attempts. Please request a new code.",
        });
      return;
    }

    if (entry.otp !== otp.trim()) {
      res
        .status(400)
        .json({
          success: false,
          message: `Invalid code. ${MAX_ATTEMPTS - entry.attempts} attempts remaining.`,
        });
      return;
    }

    // Valid — remove from store
    otpStore.delete(email.toLowerCase());
    res
      .status(200)
      .json({ success: true, message: "Code verified successfully." });
  } catch (error) {
    console.error("[OTP] verifyOtp error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export const verifyAndConsumeOtp = (email, otp, expectedPurpose) => {
  if (!email || !otp)
    return { success: false, message: "Email and OTP are required." };

  const normalizedEmail = email.toLowerCase().trim();
  const entry = otpStore.get(normalizedEmail);
  if (!entry)
    return {
      success: false,
      message: "No verification code found. Please request a new one.",
    };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "Verification code has expired. Please request a new one.",
    };
  }

  if (expectedPurpose && entry.purpose !== expectedPurpose) {
    return {
      success: false,
      message: "This verification code was issued for a different action. Please request a new code.",
    };
  }

  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: "Too many failed attempts. Please request a new code.",
    };
  }

  if (entry.otp !== otp.trim()) {
    return {
      success: false,
      message: `Invalid code. ${MAX_ATTEMPTS - entry.attempts} attempts remaining.`,
    };
  }

  // Valid — remove from store
  otpStore.delete(normalizedEmail);
  return { success: true };
};
