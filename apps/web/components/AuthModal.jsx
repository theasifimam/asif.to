"use client";

import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  useSigninMutation,
  useSignupMutation,
  useSendOtpMutation,
  useCheckUsernameQuery,
} from "@/lib/api/authApi";
import { setCredentials } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";

import AuthHeader from "./auth/AuthHeader";
import SignInTab from "./auth/SignInTab";
import SignUpFormStep from "./auth/SignUpFormStep";
import OtpVerificationStep from "./auth/OtpVerificationStep";
import ForgotPasswordStep from "./auth/ForgotPasswordStep";

export default function AuthModal({
  isOpen,
  onOpenChange,
  defaultTab = "signin",
}) {
  const dispatch = useAppDispatch();

  // ─── Modal View State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const resetTimer = setTimeout(() => {
      setActiveTab(defaultTab);
      setIsForgotPassword(false);
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [isOpen, defaultTab]);

  // ─── Sign-in state ────────────────────────────────────────────────────
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siShowPw, setSiShowPw] = useState(false);

  // ─── Sign-up state ────────────────────────────────────────────────────
  const [suFullName, setSuFullName] = useState("");
  const [suUsername, setSuUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suShowPw, setSuShowPw] = useState(false);
  const [suStep, setSuStep] = useState("form");

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

  // ─── OTP state ────────────────────────────────────────────────────────
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ─── RTK mutations ────────────────────────────────────────────────────
  const [signin, { isLoading: siLoading }] = useSigninMutation();
  const [signup, { isLoading: suLoading }] = useSignupMutation();
  const [sendOtp, { isLoading: otpSending }] = useSendOtpMutation();

  // ─── Countdown timer for OTP resend ─────────────────────────────────
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // ─── Reset all state on close ─────────────────────────────────────────
  const resetAll = () => {
    setSiEmail("");
    setSiPassword("");
    setSiShowPw(false);
    setSuFullName("");
    setSuUsername("");
    setSuEmail("");
    setSuPassword("");
    setSuShowPw(false);
    setSuStep("form");
    setOtpDigits(["", "", "", "", "", ""]);
    setResendCountdown(0);
    setIsForgotPassword(false);
  };

  const handleOpenChange = (open) => {
    if (!open) resetAll();
    onOpenChange(open);
  };

  // ─── Commit auth response ─────────────────────────────────────────────
  const commitAuth = (data) => {
    dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
    toast.success(
      `Welcome to asif.to, ${data.data.user.fullName.split(" ")[0]}! 🎉`,
    );
    handleOpenChange(false);
  };

  // ─── Sign-in handler ───────────────────────────────────────────────────
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

  // ─── Sign-up step 1: send OTP ──────────────────────────────────────────
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

  // ─── Sign-up step 2: verify OTP + signup ──────────────────────────────
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

  // ─── Resend OTP ────────────────────────────────────────────────────────
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

  // ─── OTP input handling ───────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
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
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-200"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                transition={{ type: "spring", damping: 28, stiffness: 320 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] sm:w-full max-w-[440px] max-h-[85vh] sm:max-h-[90vh] bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl sm:rounded-[2.5rem] shadow-2xl z-201 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <AuthHeader />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 pt-4">
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
                          onValueChange={(val) => {
                            setActiveTab(val);
                            setIsForgotPassword(false);
                          }}
                          className="flex flex-col gap-6"
                        >
                          {/* Tab switcher */}
                          <Tabs.List className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-full">
                            {["signin", "signup"].map((tab) => (
                              <Tabs.Trigger
                                key={tab}
                                value={tab}
                                onClick={() => {
                                  if (tab === "signup") setSuStep("form");
                                }}
                                className="flex-1 py-2.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:rounded-full data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/25 transition-all"
                              >
                                {tab === "signin"
                                  ? "Sign In"
                                  : "Create Account"}
                              </Tabs.Trigger>
                            ))}
                          </Tabs.List>

                          {/* SIGN IN TAB */}
                          <Tabs.Content
                            value="signin"
                            className="flex flex-col gap-6 outline-none"
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
                              onClose={() => handleOpenChange(false)}
                              onForgotPassword={() => setIsForgotPassword(true)}
                            />
                          </Tabs.Content>

                          {/* SIGN UP TAB */}
                          <Tabs.Content
                            value="signup"
                            className="flex flex-col gap-6 outline-none"
                          >
                            <AnimatePresence mode="wait">
                              {suStep === "form" && (
                                <motion.div
                                  key="signup-form"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
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
                                  />
                                </motion.div>
                              )}

                              {suStep === "otp" && (
                                <motion.div
                                  key="signup-otp"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                >
                                  <OtpVerificationStep
                                    email={suEmail}
                                    otpDigits={otpDigits}
                                    otpRefs={otpRefs}
                                    handleOtpChange={handleOtpChange}
                                    handleOtpKeyDown={handleOtpKeyDown}
                                    handleOtpPaste={handleOtpPaste}
                                    handleVerifyAndSignup={
                                      handleVerifyAndSignup
                                    }
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
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
