import { Router } from "express";
import {
  signup,
  signin,
  adminSignin,
  getMe,
  signout,
  updatePassword,
  checkUsername,
  resetPassword,
  upsertOAuthUser,
  issueOAuthSession,
} from "../controllers/auth.controller.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { acceptInvitation } from "../controllers/userManagement.controller.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/admin/signin", adminSignin);
router.post("/signout", signout);
router.get("/check-username", checkUsername);
router.post("/reset-password", resetPassword);
router.post("/oauth/upsert", upsertOAuthUser);
router.post("/oauth/session", issueOAuthSession);
router.post("/invitations/accept", acceptInvitation);

// OTP routes
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/update-password", protect, updatePassword);

export default router;
