"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowLeft, ShieldCheck, Key } from "lucide-react";
import { toast } from "sonner";
import { apiPost } from "@/lib/api";

const inputClass =
  "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all";

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
    <>
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-outfit tracking-tight text-zinc-900 dark:text-white">
            Reset admin password
          </h1>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Enter your email to receive a reset code.
          </p>
        </div>
      </div>

      {step === "request" && (
        <form onSubmit={handleSendOtp} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@asif.to"
                required
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Sending code..." : "Send reset code"}
          </button>
        </form>
      )}

      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Verification Code
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                maxLength={6}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                New password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Resetting password..." : "Reset password"}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-outfit">
              Password reset successful
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              You may now sign in with your updated password.
            </p>
          </div>
          <Link
            href="/signin"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer"
          >
            Back to Sign In
          </Link>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-400">
        <Link
          href="/signin"
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to login
        </Link>
        <span className="text-right">asif.to Admin</span>
      </div>
    </>
  );
}
