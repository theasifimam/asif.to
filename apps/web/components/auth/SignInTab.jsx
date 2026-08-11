"use client";

import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { inputClass } from "./authConstants";

export default function SignInTab({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleSignin,
  isLoading,
  isBusy,
  onClose,
  onForgotPassword,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Welcome Back
        </h2>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
          Access your web development courses, cheatsheets & notes
        </p>
      </div>

      <form onSubmit={handleSignin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-foreground uppercase tracking-wider ml-1">
            Email or Username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="username or email@asif.to"
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
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-extrabold text-foreground uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isBusy}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-98"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Sign In to Account <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
