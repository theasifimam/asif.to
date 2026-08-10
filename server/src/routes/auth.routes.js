import { Router } from "express";
import {
  signup,
  signin,
  adminSignin,
  getMe,
  signout,
  updatePassword,
  checkUsername } from
"../controllers/auth.controller.js";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/admin/signin", adminSignin);
router.post("/signout", signout);
router.get("/check-username", checkUsername);

// OTP routes
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// Protected routes
router.get("/me", protect, getMe);
router.patch("/update-password", protect, updatePassword);

export default router;