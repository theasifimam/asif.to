"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useSendOtpMutation,
  useResetPasswordMutation,
} from "@/lib/api/authApi";
import { inputClass } from "./authConstants";

export default function ForgotPasswordStep({ onBackToSignin }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("request"); // 'request' | 'reset' | 'done'

  const [sendOtp, { isLoading: isSending }] = useSendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useResetPasswordMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    const toastId = toast.loading("Sending password reset code...");
    try {
      await sendOtp({ email, purpose: "forgot-password" }).unwrap();
      toast.dismiss(toastId);
      toast.success(`Verification code sent to ${email}`);
      setStep("reset");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error?.data?.message || "Unable to send reset code.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    const toastId = toast.loading("Resetting your password...");
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      toast.dismiss(toastId);
      toast.success("Password reset successfully!");
      setStep("done");
    } catch (error) {
      toast.dismiss(toastId);
      toast.error(error?.data?.message || "Password reset failed.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBackToSignin}
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
        >
          <ChevronLeft size={14} /> Back to Sign In
        </button>
      </div>

      {/* Step 1: Request Reset Code */}
      {step === "request" && (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="support@asif.to"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} pl-11`}
              />
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 shrink-0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 cursor-pointer"
          >
            {isSending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <KeyRound size={16} /> Send Reset Code
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Verification Code & New Password */}
      {step === "reset" && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
              Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className={`${inputClass} pl-11 text-center font-mono text-base tracking-widest`}
              />
              <ShieldCheck
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 shrink-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className={`${inputClass} pl-11 pr-11`}
              />
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 shrink-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isResetting}
            className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 cursor-pointer"
          >
            {isResetting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>Reset Password</>
            )}
          </button>
        </form>
      )}

      {/* Step 3: Success Done */}
      {step === "done" && (
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3">
            <CheckCircle2
              size={22}
              className="text-emerald-500 shrink-0 mt-0.5"
            />
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Password Reset Complete
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Your password has been updated. You can now sign in with your
                new password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onBackToSignin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
}
