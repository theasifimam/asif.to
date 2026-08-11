"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  useSendOtpMutation,
  useResetPasswordMutation,
} from "@/lib/api/authApi";

const inputClass =
  "w-full bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 dark:text-white transition-all";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("request");

  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    try {
      await sendOtp({ email, purpose: "forgot-password" }).unwrap();
      toast.success(`Verification code sent to ${email}`);
      setStep("reset");
    } catch (error) {
      toast.error(error?.data?.message || "Unable to send reset code.");
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!email || !otp || !newPassword) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success(
        "Password reset successfully. Please sign in with your new password.",
      );
      setStep("done");
    } catch (error) {
      toast.error(error?.data?.message || "Password reset failed.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/40 p-8 sm:p-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
              Forgot Password
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
              Reset your web account password
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Use your registered email to request a reset code and update your
              password.
            </p>
          </div>
          <Link href="/" className="text-blue-400 text-sm hover:text-blue-300">
            Home
          </Link>
        </div>

        {step === "request" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@asif.to"
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSending ? "Sending code..." : "Send reset code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                Verification Code
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                <span>New password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isResetting}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isResetting ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 size={24} />
                <p className="font-bold text-white">Password reset complete</p>
              </div>
              <p className="mt-3 text-sm text-zinc-400">
                You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-zinc-950 transition hover:bg-zinc-100"
            >
              Return to home
            </Link>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-500">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
