"use client";

import { User, AtSign, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { inputClass } from "./authConstants";

export default function SignUpFormStep({
  fullName,
  setFullName,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isCheckingUsername,
  isUsernameAvailable,
  handleSendOtp,
  otpSending,
  isBusy,
  onBack,
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to Sign Up Options
          </button>
        </div>
      )}

      <form onSubmit={handleSendOtp} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={`${inputClass} pl-10 text-xs`}
              />
              <User
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 shrink-0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/\s/g, "")
                  )
                }
                required
                className={`${inputClass} pl-10 text-xs ${
                  username.length >= 3 && isUsernameAvailable === false
                    ? "border-red-500 focus:border-red-500 ring-red-500/20"
                    : ""
                }`}
              />
              <AtSign
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 shrink-0"
              />
              {isCheckingUsername && username.length >= 3 && (
                <Loader2
                  size={14}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-500 animate-spin"
                />
              )}
            </div>
            {username.length >= 3 &&
              isUsernameAvailable === false &&
              !isCheckingUsername && (
                <span className="text-[10px] font-bold text-red-500 ml-1 mt-0.5 tracking-wide">
                  This username is taken
                </span>
              )}
            {username.length >= 3 &&
              isUsernameAvailable === true &&
              !isCheckingUsername && (
                <span className="text-[10px] font-bold text-emerald-500 ml-1 mt-0.5 tracking-wide">
                  Username available
                </span>
              )}
          </div>
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Password strength bar */}
          {password.length > 0 && (
            <div className="flex gap-1 mt-1 ml-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= level * 2
                      ? level <= 2
                        ? "bg-red-400"
                        : level === 3
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      : "bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-98 cursor-pointer"
        >
          {otpSending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Send Verification OTP <Mail size={14} />
            </>
          )}
        </button>
      </form>

      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center font-medium leading-relaxed">
        An OTP email will be sent from{" "}
        <strong className="text-foreground">noreply@asif.to</strong> to verify
        your email.
      </p>
    </div>
  );
}
