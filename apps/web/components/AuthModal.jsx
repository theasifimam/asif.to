"use client";

import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Mail,
  Lock,
  User,
  AtSign,
  Loader2,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  Eye,
  EyeOff } from
"lucide-react";
import { toast } from "sonner";
import {
  useSigninMutation,
  useSignupMutation,
  useSendOtpMutation,
  useVerifyOtpMutation } from
"@/lib/api/authApi";
import { setCredentials } from "@/lib/store/authSlice";
import { useAppDispatch } from "@/lib/store/hooks";









const inputClass =
"w-full bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-600 dark:text-white transition-all";

export default function AuthModal({
  isOpen,
  onOpenChange,
  defaultTab = "signin"
}) {
  const dispatch = useAppDispatch();

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

  // ─── OTP state (shared for signup & signin-otp modes) ─────────────────
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [resendCountdown, setResendCountdown] = useState(0);

  // ─── RTK mutations ────────────────────────────────────────────────────
  const [signin, { isLoading: siLoading }] = useSigninMutation();
  const [signup, { isLoading: suLoading }] = useSignupMutation();
  const [sendOtp, { isLoading: otpSending }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: otpVerifying }] = useVerifyOtpMutation();

  // ─── Countdown timer for OTP resend ─────────────────────────────────
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // ─── Reset all state on close ─────────────────────────────────────────
  const resetAll = () => {
    setSiEmail("");setSiPassword("");setSiShowPw(false);
    setSuFullName("");setSuUsername("");setSuEmail("");
    setSuPassword("");setSuShowPw(false);setSuStep("form");
    setOtpDigits(["", "", "", "", "", ""]);
    setResendCountdown(0);
  };

  const handleOpenChange = (open) => {
    if (!open) resetAll();
    onOpenChange(open);
  };

  // ─── Commit auth response ─────────────────────────────────────────────
  const commitAuth = (data) => {
    dispatch(setCredentials({ user: data.data.user, token: data.data.token }));
    toast.success(`Welcome, ${data.data.user.fullName.split(" ")[0]}!`);
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
      const res = await signin({ email: siEmail, password: siPassword }).unwrap();
      commitAuth(res);
    } catch (err) {
      const msg = err?.data?.message || "Authentication failed. Check your credentials.";
      toast.error(msg);
    }
  };

  // ─── Sign-up step 1: send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!suFullName || !suUsername || !suEmail || !suPassword) {
      toast.error("All fields are required.");
      return;
    }
    if (suPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const toastId = toast.loading("Sending verification code...");
    try {
      await sendOtp({ email: suEmail, fullName: suFullName, purpose: "signup" }).unwrap();
      toast.dismiss(toastId);
      toast.success(`Code sent to ${suEmail}`);
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
    const toastId = toast.loading("Verifying code...");
    try {
      // Step 1: verify OTP
      await verifyOtp({ email: suEmail, otp }).unwrap();
      toast.dismiss(toastId);

      // Step 2: create account
      const toastId2 = toast.loading("Creating your account...");
      const res = await signup({
        fullName: suFullName,
        username: suUsername,
        email: suEmail,
        password: suPassword
      }).unwrap();
      toast.dismiss(toastId2);
      commitAuth(res);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err?.data?.message || "Verification failed.");
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    const toastId = toast.loading("Resending code...");
    try {
      await sendOtp({ email: suEmail, fullName: suFullName, purpose: "signup" }).unwrap();
      toast.dismiss(toastId);
      toast.success("New code sent.");
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(""));
      otpRefs.current[5]?.focus();
      setTimeout(handleVerifyAndSignup, 200);
    }
  };

  const isBusy = siLoading || suLoading || otpSending || otpVerifying;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
            <AnimatePresence>
                {isOpen &&
        <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md z-[200]" />
            
                        </Dialog.Overlay>

                        <Dialog.Content asChild>
                            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] bg-white dark:bg-[#0a0a0a] border border-zinc-100 dark:border-zinc-900 rounded-[2.5rem] shadow-2xl shadow-black/10 z-[201] overflow-hidden">
              
                                {/* ── Header ── */}
                                <div className="flex items-center justify-between px-8 pt-8 pb-0">
                                    <span className="font-outfit font-black text-xl tracking-tighter text-zinc-900 dark:text-white uppercase italic">
                                        MAZLIS.
                                    </span>
                                    <Dialog.Close asChild>
                                        <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500 dark:text-zinc-400">
                                            <X size={18} />
                                        </button>
                                    </Dialog.Close>
                                </div>

                                {/* ── Content ── */}
                                <div className="p-8 pt-6">
                                    <Tabs.Root defaultValue={defaultTab} className="flex flex-col gap-6">
                                        {/* Tab switcher */}
                                        <Tabs.List className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
                                            {["signin", "signup"].map((tab) =>
                    <Tabs.Trigger
                      key={tab}
                      value={tab}
                      onClick={() => {if (tab === "signup") setSuStep("form");}}
                      className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-500 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white data-[state=active]:rounded-xl data-[state=active]:shadow-sm transition-all">
                      
                                                    {tab === "signin" ? "Sign In" : "Sign Up"}
                                                </Tabs.Trigger>
                    )}
                                        </Tabs.List>

                                        {/* ══════════ SIGN IN TAB ══════════ */}
                                        <Tabs.Content value="signin" className="flex flex-col gap-6 outline-none">
                                            <div>
                                                <h2 className="text-2xl font-black font-outfit tracking-tighter text-zinc-900 dark:text-white">
                                                    Welcome back.
                                                </h2>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mt-1">
                                                    Access your editorial dossier
                                                </p>
                                            </div>

                                            <form onSubmit={handleSignin} className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                                        Email Address
                                                    </label>
                                                    <div className="relative">
                                                        <input
                            type="email"
                            placeholder="you@mazlis.com"
                            value={siEmail}
                            onChange={(e) => setSiEmail(e.target.value)}
                            required
                            className={`${inputClass} pl-11`} />
                          
                                                        <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                                        Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                            type={siShowPw ? "text" : "password"}
                            placeholder="••••••••"
                            value={siPassword}
                            onChange={(e) => setSiPassword(e.target.value)}
                            required
                            className={`${inputClass} pl-11 pr-11`} />
                          
                                                        <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                        <button
                            type="button"
                            onClick={() => setSiShowPw(!siShowPw)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors">
                            
                                                            {siShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <button
                        type="submit"
                        disabled={isBusy}
                        className="mt-2 w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]">
                        
                                                    {siLoading ?
                        <Loader2 size={16} className="animate-spin" /> :

                        <>Authenticate <ArrowRight size={14} /></>
                        }
                                                </button>
                                            </form>

                                            <p className="text-center text-[9px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">
                                                Secure end-to-end encryption
                                            </p>
                                        </Tabs.Content>

                                        {/* ══════════ SIGN UP TAB ══════════ */}
                                        <Tabs.Content value="signup" className="flex flex-col gap-6 outline-none">
                                            <AnimatePresence mode="wait">

                                                {/* ── Step 1: Registration form ── */}
                                                {suStep === "form" &&
                      <motion.div
                        key="signup-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-6">
                        
                                                        <div>
                                                            <h2 className="text-2xl font-black font-outfit tracking-tighter text-zinc-900 dark:text-white">
                                                                Join the protocol.
                                                            </h2>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mt-1">
                                                                Independent journalism needs you
                                                            </p>
                                                        </div>

                                                        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                                                                    <div className="relative">
                                                                        <input
                                  type="text"
                                  placeholder="John Doe"
                                  value={suFullName}
                                  onChange={(e) => setSuFullName(e.target.value)}
                                  required
                                  className={`${inputClass} pl-10 text-xs`} />
                                
                                                                        <User size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col gap-1.5">
                                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Username</label>
                                                                    <div className="relative">
                                                                        <input
                                  type="text"
                                  placeholder="johndoe"
                                  value={suUsername}
                                  onChange={(e) => setSuUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
                                  required
                                  className={`${inputClass} pl-10 text-xs`} />
                                
                                                                        <AtSign size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-1.5">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                                                                <div className="relative">
                                                                    <input
                                type="email"
                                placeholder="you@example.com"
                                value={suEmail}
                                onChange={(e) => setSuEmail(e.target.value)}
                                required
                                className={`${inputClass} pl-11`} />
                              
                                                                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col gap-1.5">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                                                                <div className="relative">
                                                                    <input
                                type={suShowPw ? "text" : "password"}
                                placeholder="Min 8 characters"
                                value={suPassword}
                                onChange={(e) => setSuPassword(e.target.value)}
                                required
                                className={`${inputClass} pl-11 pr-11`} />
                              
                                                                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600" />
                                                                    <button
                                type="button"
                                onClick={() => setSuShowPw(!suShowPw)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-400 transition-colors">
                                
                                                                        {suShowPw ? <EyeOff size={15} /> : <Eye size={15} />}
                                                                    </button>
                                                                </div>
                                                                {/* Password strength indicator */}
                                                                {suPassword.length > 0 &&
                            <div className="flex gap-1 mt-1 ml-1">
                                                                        {[1, 2, 3, 4].map((level) =>
                              <div
                                key={level}
                                className={`h-0.5 flex-1 rounded-full transition-colors ${suPassword.length >= level * 2 ?
                                level <= 2 ?
                                "bg-red-400" :
                                level === 3 ?
                                "bg-amber-400" :
                                "bg-emerald-500" :
                                "bg-zinc-200 dark:bg-zinc-800"}`
                                } />

                              )}
                                                                    </div>
                            }
                                                            </div>

                                                            <button
                            type="submit"
                            disabled={isBusy}
                            className="mt-2 w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
                            
                                                                {otpSending ?
                            <Loader2 size={16} className="animate-spin" /> :

                            <>Verify Email <Mail size={14} /></>
                            }
                                                            </button>
                                                        </form>

                                                        <p className="text-[9px] text-zinc-400 dark:text-zinc-600 text-center uppercase tracking-widest leading-relaxed">
                                                            By registering, you agree to our{" "}
                                                            <span className="text-zinc-900 dark:text-white font-black cursor-pointer">Protocol Terms</span>{" "}
                                                            and{" "}
                                                            <span className="text-zinc-900 dark:text-white font-black cursor-pointer">Privacy Policy</span>.
                                                        </p>
                                                    </motion.div>
                      }

                                                {/* ── Step 2: OTP Verification ── */}
                                                {suStep === "otp" &&
                      <motion.div
                        key="signup-otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col gap-6">
                        
                                                        <div className="flex items-start gap-3">
                                                            <button
                            onClick={() => {setSuStep("form");setOtpDigits(["", "", "", "", "", ""]);}}
                            className="mt-1 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-500 dark:text-zinc-400 transition-colors">
                            
                                                                <ChevronLeft size={18} />
                                                            </button>
                                                            <div>
                                                                <h2 className="text-2xl font-black font-outfit tracking-tighter text-zinc-900 dark:text-white">
                                                                    Verify identity.
                                                                </h2>
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mt-1">
                                                                    Code sent to{" "}
                                                                    <span className="text-zinc-900 dark:text-white">{suEmail}</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* OTP 6-box input */}
                                                        <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                                            {otpDigits.map((digit, i) =>
                          <input
                            key={i}
                            ref={(el) => {otpRefs.current[i] = el;}}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className={`w-12 h-14 text-center text-xl font-black rounded-2xl border transition-all outline-none
                                                                        ${digit ?
                            "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm" :
                            "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-white"}
                                                                        focus:border-zinc-600 dark:focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5 dark:focus:ring-white/5`
                            } />

                          )}
                                                        </div>

                                                        <button
                          onClick={handleVerifyAndSignup}
                          disabled={isBusy || otpDigits.some((d) => !d)}
                          className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.98]">
                          
                                                            {otpVerifying || suLoading ?
                          <Loader2 size={16} className="animate-spin" /> :

                          <><ShieldCheck size={14} /> Confirm & Create Account</>
                          }
                                                        </button>

                                                        <div className="flex items-center justify-center gap-3">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                                                                Didn&apos;t receive it?
                                                            </span>
                                                            <button
                            onClick={handleResendOtp}
                            disabled={resendCountdown > 0 || otpSending}
                            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:cursor-not-allowed transition-colors hover:opacity-70">
                            
                                                                <RefreshCw size={11} className={otpSending ? "animate-spin" : ""} />
                                                                {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend Code"}
                                                            </button>
                                                        </div>
                                                    </motion.div>
                      }
                                            </AnimatePresence>
                                        </Tabs.Content>
                                    </Tabs.Root>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
        }
            </AnimatePresence>
        </Dialog.Root>);

}