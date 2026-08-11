"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Key,
} from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "../../lib/api";

const inputClass =
  "w-full bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3.5 text-sm font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 dark:text-white transition-all";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("request");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiPost("/auth/otp/send", {
        email,
        purpose: "forgot-password",
      });
      if (!response.success) {
        toast.error(
          response.error || response.data?.message || "Unable to send code.",
        );
        return;
      }
      toast.success(`Verification code sent to ${email}.`);
      setStep("reset");
    } catch (error) {
      toast.error(error?.message || "Failed to send verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    if (!email || !otp || !newPassword) {
      toast.error("Please complete all fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiPost("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (!response.success) {
        toast.error(
          response.error ||
            response.data?.message ||
            "Unable to reset password.",
        );
        return;
      }
      toast.success(
        "Password reset successfully. Please sign in with your new password.",
      );
      setStep("done");
    } catch (error) {
      toast.error(error?.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg rounded-[2rem] border border-zinc-800 bg-zinc-900/95 shadow-2xl shadow-black/40 p-8 sm:p-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Reset admin password
            </h1>
            <p className="text-sm text-zinc-400">
              Enter your email to receive a reset code.
            </p>
          </div>
        </div>

        {step === "request" && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@asif.to"
                  required
                  className={`${inputClass} pl-11`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Sending code..." : "Send reset code"}
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
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
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
              <label className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.24em] text-zinc-400">
                <span>New password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-blue-400 hover:text-blue-300 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
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
              disabled={isLoading}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-[0.24em] text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Resetting password..." : "Reset password"}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-foreground">
              <p className="font-bold text-lg">Password reset successful</p>
              <p className="mt-2 text-sm text-zinc-400">
                You may now sign in with your updated password.
              </p>
            </div>
            <Link
              href="/signin"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white text-zinc-950 py-3.5 text-sm font-bold uppercase tracking-[0.24em] transition hover:bg-zinc-100"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        <div className="mt-8 border-t border-zinc-800 pt-6 flex items-center justify-between text-xs text-zinc-500">
          <Link
            href="/signin"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
          <span className="text-right">asif.to Admin</span>
        </div>
      </motion.div>
    </div>
  );
}
