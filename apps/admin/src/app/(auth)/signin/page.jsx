"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronRight,
  User,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import LogoLoader from "@/components/ui/LogoLoader";

export default function SigninPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      toast.error("Please enter both email/username and password");
      return;
    }
    setIsLoading(true);
    try {
      await login({ emailOrUsername, email: emailOrUsername, password });
      toast.success("Signed in successfully");
    } catch (error) {
      const msg = error?.response?.data?.message || "Invalid credentials";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Form Header with Logo */}
      <div className="flex flex-col items-center text-center gap-3 mb-8">
        <img
          src="/logo.png"
          alt="asif.to"
          className="w-12 h-12 rounded-xl object-contain lg:hidden"
        />
        <div className="flex items-center gap-2">
          <h1 className="font-outfit font-black text-2xl tracking-tight text-zinc-900 dark:text-white">
            asif<span className="text-blue-600 dark:text-blue-400">.to</span>
          </h1>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Admin
          </span>
        </div>
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
          Sign in to manage courses, articles, flashcards & administrative settings
        </p>
      </div>

      {/* Signin Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email or Username Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
            Email or Username
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="admin@asif.to or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-12 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50 shadow-md shadow-blue-600/20"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <LogoLoader className="h-4 w-4" />
              Signing in...
            </span>
          ) : (
            <>
              Sign In to Admin Panel
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Bottom Trust Badge */}
      <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center gap-2 text-zinc-400 text-xs font-semibold">
        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Protected Administrative Access &bull; asif.to</span>
      </div>
    </>
  );
}
