
import crypto from "crypto";
import { sendOtpEmail } from "../services/email.service.js";
import User from "../models/User.js";

// ─── Simple in-memory OTP store: { email → { otp, expiresAt, attempts } } ──
// In production replace with Redis





const otpStore = new Map();

const EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/** Generate a 6-digit OTP */
const generateOtp = () =>
String(crypto.randomInt(100000, 999999));

// POST /api/v1/auth/otp/send
export const sendOtp = async (req, res) => {
  try {
    const { email, fullName, purpose } = req.body;





    if (!email) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    // For signup: ensure email is NOT already taken
    if (purpose === "signup") {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({ success: false, message: "An account with this email already exists." });
        return;
      }
    }

    // For signin: ensure account exists
    if (purpose === "signin") {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (!existing) {
        res.status(404).json({ success: false, message: "No account found with this email." });
        return;
      }
    }

    // Rate-limit: block if already pending and not expired yet (< 1 min since last send)
    const existing = otpStore.get(email.toLowerCase());
    if (existing && existing.expiresAt - Date.now() > EXPIRY_MS - 60_000) {
      res.status(429).json({ success: false, message: "Please wait 1 minute before requesting another code." });
      return;
    }

    const otp = generateOtp();
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + EXPIRY_MS,
      attempts: 0
    });

    const name = fullName || email.split("@")[0];
    await sendOtpEmail(email, name, otp);

    res.status(200).json({ success: true, message: `Verification code sent to ${email}.` });
  } catch (error) {
    console.error("[OTP] sendOtp error:", error);
    res.status(500).json({ success: false, message: "Failed to send verification email." });
  }
};

// POST /api/v1/auth/otp/verify
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ success: false, message: "Email and OTP are required." });
      return;
    }

    const entry = otpStore.get(email.toLowerCase());

    if (!entry) {
      res.status(400).json({ success: false, message: "No verification code found. Please request a new one." });
      return;
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email.toLowerCase());
      res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
      return;
    }

    entry.attempts++;
    if (entry.attempts > MAX_ATTEMPTS) {
      otpStore.delete(email.toLowerCase());
      res.status(400).json({ success: false, message: "Too many failed attempts. Please request a new code." });
      return;
    }

    if (entry.otp !== otp.trim()) {
      res.status(400).json({ success: false, message: `Invalid code. ${MAX_ATTEMPTS - entry.attempts} attempts remaining.` });
      return;
    }

    // Valid — remove from store
    otpStore.delete(email.toLowerCase());
    res.status(200).json({ success: true, message: "Code verified successfully." });
  } catch (error) {
    console.error("[OTP] verifyOtp error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};