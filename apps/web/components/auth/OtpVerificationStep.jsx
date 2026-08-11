"use client";

import { ChevronLeft, Loader2, ShieldCheck, RefreshCw } from "lucide-react";

export default function OtpVerificationStep({
  email,
  otpDigits,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  handleVerifyAndSignup,
  handleResendOtp,
  resendCountdown,
  otpVerifying,
  suLoading,
  otpSending,
  isBusy,
  onBack,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="mt-1 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 dark:text-zinc-400 transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Enter OTP Code
          </h2>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            We sent a 6-digit code from{" "}
            <strong className="text-blue-600 dark:text-blue-400">
              noreply@asif.to
            </strong>{" "}
            to <span className="text-foreground font-bold">{email}</span>
          </p>
        </div>
      </div>

      {/* OTP 6-box input */}
      <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              otpRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border transition-all outline-none ${
              digit
                ? "border-blue-600 dark:border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 text-foreground"
            } focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20`}
          />
        ))}
      </div>

      <button
        onClick={handleVerifyAndSignup}
        disabled={isBusy || otpDigits.some((d) => !d)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98"
      >
        {otpVerifying || suLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <>
            <ShieldCheck size={16} /> Verify OTP & Create Account
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-3 pt-1">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          Didn&apos;t receive code?
        </span>
        <button
          onClick={handleResendOtp}
          disabled={resendCountdown > 0 || otpSending}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:text-zinc-400 dark:disabled:text-zinc-600 disabled:no-underline disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw size={12} className={otpSending ? "animate-spin" : ""} />
          {resendCountdown > 0
            ? `Resend in ${resendCountdown}s`
            : "Resend Code"}
        </button>
      </div>
    </div>
  );
}
