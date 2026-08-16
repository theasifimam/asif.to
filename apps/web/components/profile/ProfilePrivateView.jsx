"use client";

import React from "react";
import { User, ShieldOff, LogIn, UserPlus } from "lucide-react";

export default function ProfilePrivateView({
  cleanParam,
  isAuthenticated,
  onOpenAuth,
}) {
  return (
    <div className="p-10 sm:p-16 rounded-[2.5rem] bg-white dark:bg-zinc-900/90 shadow-md text-center flex flex-col items-center gap-4 my-8 border border-zinc-100 dark:border-zinc-800">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
        {isAuthenticated ? (
          <ShieldOff className="w-8 h-8" />
        ) : (
          <User className="w-8 h-8" />
        )}
      </div>
      <h1 className="text-2xl font-black text-foreground">
        {isAuthenticated
          ? "This profile is private"
          : "Sign In to View Your Profile"}
      </h1>
      <p className="text-xs sm:text-sm text-zinc-500 max-w-md leading-relaxed">
        {isAuthenticated
          ? `The profile for @${cleanParam} is not accessible or set to private.`
          : "Track your course progress, manage saved syntax cheatsheets, flashcard revision decks, and personalized learning preferences."}
      </p>

      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full sm:w-auto">
          <button
            onClick={() => onOpenAuth("signin")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => onOpenAuth("signup")}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground hover:bg-zinc-200 text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
