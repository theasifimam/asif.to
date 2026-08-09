"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { ChevronRight, Mail, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Signed in successfully');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Invalid email or password';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden font-sans">
      {/* Background Decorative Ambient Glows matching apps/web */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Main Card Container styled like apps/web AuthModal & Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-500/5 dark:shadow-black/50 relative z-10"
      >
        {/* Header with asif.to Logo */}
        <div className="flex flex-col items-center text-center gap-3 mb-8">
          <span className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-blue-500/30">
            &lt;/&gt;
          </span>
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
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                placeholder="admin@asif.to"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 rounded-2xl pl-11 pr-5 py-3.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      </motion.div>
    </div>
  );
}