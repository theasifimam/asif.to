"use client";

import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import OAuthButtons from "./OAuthButtons";
import { inputClass } from "./authConstants";
import { Button } from "@/components/ui/button";

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
  callbackUrl = "/",
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {/* Primary Email & Password Form */}
      <form onSubmit={handleSignin} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs pl-3 text-foreground bold tracking-wider">
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
            <label className="text-xs pl-3 text-foreground bold tracking-wider">
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

        <Button
          type="submit"
          loading={isLoading}
          disabled={isBusy}
          className="mt-1 w-full uppercase tracking-widest text-xs h-11"
        >
          <span>Sign In to Account</span>
          <ArrowRight size={14} />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-0.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800" />
        </div>
        <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
          or continue with
        </span>
      </div>

      {/* Social OAuth Sign In Underneath */}
      <OAuthButtons callbackUrl={callbackUrl} />
    </div>
  );
}
