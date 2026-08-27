"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, ShieldCheck, AlertCircle } from "lucide-react";
import {
  useSigninMutation,
  useSignupMutation,
  useSendOtpMutation,
  useCheckUsernameQuery,
} from "@/lib/api/authApi";
import { setCredentials } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";

import SignInTab from "./SignInTab";
import SignUpOptionsStep from "./SignUpOptionsStep";
import SignUpFormStep from "./SignUpFormStep";
import OtpVerificationStep from "./OtpVerificationStep";
import ForgotPasswordStep from "./ForgotPasswordStep";

export default function AuthCard({
  defaultTab = "signin",
  initialForgotPassword = false,
  callbackUrl = "/",
  onClose,
  isModal = false,
  updateUrl = true,
  initialError = null,
}) {
  const dispatch = useAppDispatch();

  // ─── View State ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isForgotPassword, setIsForgotPassword] = useState(
    initialForgotPassword,
  );
  const [oauthError, setOauthError] = useState(initialError);

  // Check URL query on mount for direct email signup link support (?mode=email)
  const [suStep, setSuStep] = useState(() => {
    if (typeof window !== "undefined") {
      const mode = new URLSearchParams(window.location.search).get("mode");
      if (mode === "email") return "form";
    }
    return "options";
  });

  useEffect(() => {
    setActiveTab(defaultTab);
    if (defaultTab === "signup") {
      if (typeof window !== "undefined") {
        const mode = new URLSearchParams(window.location.search).get("mode");
        setSuStep(mode === "email" ? "form" : "options");
      }
    }
  }, [defaultTab]);

  // Handle URL updates when switching tabs
  const handleTabChange = (val) => {
    setActiveTab(val);
    setIsForgotPassword(false);
    if (val === "signup") setSuStep("options");

    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const cb = params.get("callbackUrl");
      const targetPath = val === "signup" ? "/signup" : "/login";
      const nextQuery = cb ? `?callbackUrl=${encodeURIComponent(cb)}` : "";
      window.history.replaceState(null, "", `${targetPath}${nextQuery}`);
    }
  };

  const handleSelectEmailSignup = () => {
    setSuStep("form");
    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const cb = params.get("callbackUrl");
      const nextQuery = `?mode=email${cb ? `&callbackUrl=${encodeURIComponent(cb)}` : ""}`;
      window.history.replaceState(null, "", `/signup${nextQuery}`);
    }
  };

  const handleBackToOptions = () => {
    setSuStep("options");
    if (updateUrl && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const cb = params.get("callbackUrl");
      const nextQuery = cb ? `?callbackUrl=${encodeURIComponent(cb)}` : "";
      window.history.replaceState(null, "", `/signup${nextQuery}`);
    }
  };

  // ─── Sign-in state ──────────────────────────────────────────────────────
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);

  // ─── Sign-up state ──────────────────────────────────────────────────────
  const [suFullName, setSuFullName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);

  // Username debouncing
  const [debouncedUsername, setDebouncedUsername] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(suUsername);
    }, 500);
    return () => clearTimeout(handler);
  }, [suUsername]);

  const { data: usernameData, isFetching: isCheckingUsername } =
    useCheckUsernameQuery(debouncedUsername, {
      skip: debouncedUsername.length < 3,
    });
  const isUsernameAvailable = usernameData?.success
    ? usernameData.available
    : null;

  // ─── OTP state ──────────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ─── RTK mutations ──────────────────────────────────────────────────────
  const [signin, { isLoading: siLoading }] = useSigninMutation();
  const [signup, { isLoading: suLoading }] = useSignupMutation();
  const [sendOtp, { isLoading: otpSending }] = useSendOtpMutation();

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // ─── Commit auth response ───────────────────────────────────────────────
  const commitAuth = (data) => {
    dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
    toast.success(
      `Welcome to asif.to, ${data.data.user.fullName.split(" ")[0]}! 🎉`,
    );
    if (onClose) {
      onClose();
    } else if (typeof window !== "undefined") {
      window.location.assign(callbackUrl || "/");
    }
  };

  // ─── Sign-in handler ─────────────────────────────────────────────────────
  const handleSignin = async (e) => {
    e.preventDefault();
    if (!siEmail || !siPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    try {
      const res = await signin({
        email: siEmail,
        password: siPassword,
      }).unwrap();
      commitAuth(res);
    } catch (err) {
      const msg =
        err?.data?.message || "Authentication failed. Check your credentials.";
      toast.error(msg);
    }
  };

  // ─── Sign-up step 1: send OTP ────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (isUsernameAvailable === false) {
      toast.error("Please choose an available username.");
      return;
    }
    if (!suFullName || !suUsername || !suEmail || !suPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (suPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const toastId = toast.loading(
      "Sending verification code from noreply@asif.to...",
    );
    try {
      await sendOtp({
        email: suEmail.trim().toLowerCase(),
        fullName: suFullName.trim(),
        purpose: "signup",
      }).unwrap();
      toast.dismiss(toastId);
      toast.success(`Verification code sent to ${suEmail}`);
      setSuStep("otp");
      setResendCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.data?.message || "Failed to send verification code.");
    }
  };

  // ─── Sign-up step 2: verify OTP + signup ────────────────────────────────
  const handleVerifyAndSignup = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    const toastId = toast.loading(
      "Verifying code and creating your account...",
    );
    try {
      const res = await signup({
        fullName: suFullName.trim(),
        username: suUsername.trim(),
        email: suEmail.trim().toLowerCase(),
        password: suPassword,
        otp,
      }).unwrap();
      toast.dismiss(toastId);
      commitAuth(res);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.data?.message || "Verification failed.");
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    const toastId = toast.loading("Resending code from noreply@asif.to...");
    try {
      await sendOtp({
        email: suEmail.trim().toLowerCase(),
        fullName: suFullName.trim(),
        purpose: "signup",
      }).unwrap();
      toast.dismiss(toastId);
      toast.success("New verification code sent.");
      setResendCountdown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.data?.message || "Failed to resend code.");
    }
  };

  // ─── OTP input handling ─────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    if (newDigits.every((d) => d !== "") && newDigits.join("").length === 6) {
      setTimeout(handleVerifyAndSignup, 200);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyAndSignup();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
      setTimeout(handleVerifyAndSignup, 200);
    }
  };

  const isBusy = siLoading || suLoading || otpSending;

  return (
    <div className="relative w-full max-w-110 bg-white dark:bg-zinc-900 border border-white dark:border-zinc-800 rounded-4xl sm:rounded-4xl shadow-2xl shadow-zinc-950/20 dark:shadow-black/60 flex flex-col overflow-hidden max-h-[85vh] sm:max-h-[88vh]">
      {/* OAuth error banner */}
      {oauthError && (
        <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900 px-5 py-3">
          <AlertCircle size={15} className="shrink-0 text-red-500 mt-0.5" />
          <p className="flex-1 text-xs font-semibold text-red-700 dark:text-red-400 leading-snug">
            {oauthError}
          </p>
          <button
            type="button"
            onClick={() => setOauthError(null)}
            aria-label="Dismiss error"
            className="shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}
      {/* Header Bar - Fixed Branding & Title */}
      <div className="flex flex-col px-6 sm:px-8 pt-5 sm:pt-6 pb-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="asif.to"
              className="w-7 h-7 rounded-xl object-contain shrink-0"
            />
            <span className="font-outfit font-black text-lg tracking-tight text-foreground">
              asif<span className="text-blue-600 dark:text-blue-400">.to</span>
            </span>
          </Link>

          {(isModal || onClose) && (
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80 rounded-full transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isForgotPassword
              ? "Reset Password"
              : activeTab === "signup"
                ? "Create Account"
                : "Welcome Back"}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isForgotPassword
              ? "Enter your email to receive a reset code"
              : activeTab === "signup"
                ? "Create your account & start learning in seconds"
                : "Access your courses, cheatsheets & bookmarks"}
          </p>
        </div>
      </div>

      {/* Main Content Area - Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 scrollbar-none">
        <AnimatePresence mode="wait">
          {isForgotPassword ? (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <ForgotPasswordStep
                onBackToSignin={() => {
                  setIsForgotPassword(false);
                  setActiveTab("signin");
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth-tabs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Tabs.Root
                value={activeTab}
                onValueChange={handleTabChange}
                className="flex flex-col gap-4"
              >
                {/* SIGN IN TAB */}
                <Tabs.Content
                  value="signin"
                  className="flex flex-col gap-4 outline-none"
                >
                  <SignInTab
                    email={siEmail}
                    setEmail={setSiEmail}
                    password={siPassword}
                    setPassword={setSiPassword}
                    showPassword={siShowPw}
                    setShowPassword={setSiShowPw}
                    handleSignin={handleSignin}
                    isLoading={siLoading}
                    isBusy={isBusy}
                    onClose={onClose}
                    onForgotPassword={() => setIsForgotPassword(true)}
                    callbackUrl={callbackUrl}
                  />
                  <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-0.5">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("signup")}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </p>
                </Tabs.Content>

                {/* SIGN UP TAB */}
                <Tabs.Content
                  value="signup"
                  className="flex flex-col gap-2 outline-none"
                >
                  <AnimatePresence mode="wait">
                    {suStep === "options" && (
                      <motion.div
                        key="signup-options"
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.18 }}
                      >
                        <SignUpOptionsStep
                          onSelectEmailSignup={handleSelectEmailSignup}
                          callbackUrl={callbackUrl}
                        />
                      </motion.div>
                    )}

                    {suStep === "form" && (
                      <motion.div
                        key="signup-form"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.18 }}
                      >
                        <SignUpFormStep
                          fullName={suFullName}
                          setFullName={setSuFullName}
                          username={suUsername}
                          setUsername={setSuUsername}
                          email={suEmail}
                          setEmail={setSuEmail}
                          password={suPassword}
                          setPassword={setSuPassword}
                          showPassword={suShowPw}
                          setShowPassword={setSuShowPw}
                          isCheckingUsername={isCheckingUsername}
                          isUsernameAvailable={isUsernameAvailable}
                          handleSendOtp={handleSendOtp}
                          otpSending={otpSending}
                          isBusy={isBusy}
                          onBack={handleBackToOptions}
                        />
                      </motion.div>
                    )}

                    {suStep === "otp" && (
                      <motion.div
                        key="signup-otp"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.18 }}
                      >
                        <OtpVerificationStep
                          email={suEmail}
                          otpDigits={otpDigits}
                          otpRefs={otpRefs}
                          handleOtpChange={handleOtpChange}
                          handleOtpKeyDown={handleOtpKeyDown}
                          handleOtpPaste={handleOtpPaste}
                          handleVerifyAndSignup={handleVerifyAndSignup}
                          handleResendOtp={handleResendOtp}
                          resendCountdown={resendCountdown}
                          otpVerifying={suLoading}
                          suLoading={suLoading}
                          otpSending={otpSending}
                          isBusy={isBusy}
                          onBack={() => {
                            setSuStep("form");
                            setOtpDigits(["", "", "", "", "", ""]);
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400 pt-0.5">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleTabChange("signin")}
                      className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </p>
                </Tabs.Content>
              </Tabs.Root>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Security Notice & Legal links */}
        <div className="pt-3 flex flex-col gap-2">
          <p className="text-center text-[10px] text-zinc-400">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-bold text-zinc-600 dark:text-zinc-300 hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-bold text-zinc-600 dark:text-zinc-300 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
