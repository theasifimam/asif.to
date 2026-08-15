"use client";

import { Mail, ArrowRight } from "lucide-react";
import OAuthButtons from "./OAuthButtons";

export default function SignUpOptionsStep({
  onSelectEmailSignup,
  callbackUrl = "/",
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
          Join asif.to
        </h2>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
          Create your account & start learning in seconds
        </p>
      </div>

      {/* Social OAuth Sign Up (Primary) */}
      <OAuthButtons callbackUrl={callbackUrl} />

      {/* Divider */}
      <div className="relative my-0.5 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800" />
        </div>
        <span className="relative bg-white dark:bg-zinc-900 px-3 text-[10px] font-black uppercase tracking-wider text-zinc-400">
          or
        </span>
      </div>

      {/* Button to proceed to Email Sign Up Form */}
      <button
        type="button"
        onClick={onSelectEmailSignup}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200/90 bg-white hover:bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-800/70 dark:hover:bg-zinc-800 px-4 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white shadow-xs transition-all duration-150 active:scale-98 cursor-pointer"
      >
        <Mail size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
        <span>Sign up with Email</span>
        <ArrowRight size={14} className="text-zinc-400 ml-auto" />
      </button>
    </div>
  );
}
