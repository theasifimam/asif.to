"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { X, ShieldCheck } from "lucide-react";
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
  callbackUrl = "/",
  onClose,
  isModal = false,
  updateUrl = true,
}) {
  const dispatch = useAppDispatch();

  // ─── View State ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

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
    <div className="relative w-full max-w-115 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-4xl shadow-2xl shadow-zinc-950/15 dark:shadow-black/40 flex flex-col overflow-hidden max-h-[88vh] sm:max-h-[92vh]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-2 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="asif.to"
            className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0"
          />
          <span className="font-outfit font-black text-xl tracking-tight text-foreground">
            asif<span className="text-blue-600 dark:text-blue-400">.to</span>
          </span>
        </Link>

        {isModal && onClose && (
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Content Area */}
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
                className="flex flex-col gap-5"
              >
                {/* Modern Pill Tab Switcher */}
                <Tabs.List className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                  {["signin", "signup"].map((tab) => (
                    <Tabs.Trigger
                      key={tab}
                      value={tab}
                      className="flex-1 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:rounded-full data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 transition-all cursor-pointer"
                    >
                      {tab === "signin" ? "Sign In" : "Create Account"}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* SIGN IN TAB */}
                <Tabs.Content
                  value="signin"
                  className="flex flex-col gap-5 outline-none"
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
                </Tabs.Content>

                {/* SIGN UP TAB */}
                <Tabs.Content
                  value="signup"
                  className="flex flex-col gap-5 outline-none"
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
                </Tabs.Content>
              </Tabs.Root>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Security Notice & Legal links */}
        <div className="mt-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col gap-2">
          <div className="flex items-start gap-2 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 p-2.5 text-[11px] leading-4 text-zinc-500">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <p>
              Your data is encrypted and secure. asif.to never shares your
              personal information.
            </p>
          </div>

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
