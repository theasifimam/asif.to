"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  X,
  ChevronRight,
  LogOut,
  Sparkles,
  FileCode,
  Layers,
  HelpCircle,
  Home,
} from "lucide-react";
import { ThemeToggle } from "../../ui/ThemeToggle";
import { getImageUrl } from "@/lib/config";

const SIDEBAR_ITEMS = [
  {
    label: "Home / Courses",
    href: "/",
    icon: Home,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    label: "Syntax Cheatsheets",
    href: "/cheatsheets",
    icon: FileCode,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Revision Deck",
    href: "/revision",
    icon: Layers,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    label: "Practice Quiz",
    href: "/quiz",
    icon: HelpCircle,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
];

// Profile is shown separately below, nav items don't include it

export default function Sidebar({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  isInitialized,
  onLogoutClick,
  onSignInClick,
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-200">
          {/* Backdrop with smooth blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Floating Modern Sidebar Content */}
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className="absolute left-3 top-3 bottom-3 w-[calc(100%-1.5rem)] sm:w-87.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-[2.5rem] flex flex-col shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden"
          >
            {/* Header inside Sidebar */}
            <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="asif.to"
                  className="w-9 h-9 rounded-xl object-contain shadow-sm"
                />
                <div className="flex flex-col">
                  <Link
                    href="/"
                    onClick={onClose}
                    className="font-outfit font-black text-lg tracking-tight text-foreground"
                  >
                    asif
                    <span className="text-blue-600 dark:text-blue-400">
                      .to
                    </span>
                  </Link>
                  <span className="text-[10px] font-medium text-zinc-400">
                    Learn & Revise Coding
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={onClose}
                  className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-all active:scale-90"
                >
                  <X size={18} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Navigation Options List */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 px-2 block mb-3">
                  Learning Sections
                </span>
                <nav className="flex flex-col gap-2">
                  {SIDEBAR_ITEMS.map((item, idx) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.04 * idx }}
                        key={item.href}
                      >
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`group flex items-center justify-between p-3 rounded-2xl transition-all active:scale-[0.98] ${
                            isActive
                              ? "bg-blue-600 text-white font-bold shadow-xs"
                              : "bg-zinc-50/80 hover:bg-zinc-100 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800/60"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                                isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                              }`}
                            >
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-xs font-bold font-outfit tracking-tight">
                              {item.label}
                            </span>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 ${
                              isActive ? "text-white" : "text-zinc-400"
                            }`}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Quick Learning Tip */}
              <div className="p-3.5 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>Interactive Learning</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed font-medium">
                  Practice flashcards & bookmark code snippets to level up your full-stack development skills.
                </p>
              </div>
            </div>

            {/* Bottom Actions & User Profile Card */}
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800/80">
              {!isInitialized ? (
                <div className="w-full h-11 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              ) : !isAuthenticated ? (
                <button
                  onClick={onSignInClick}
                  className="w-full py-3 rounded-full bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 active:scale-95 transition-all cursor-pointer"
                >
                  Sign In / Create Account
                </button>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60">
                  <Link
                    href={user?.username ? `/${user.username}` : "/"}
                    onClick={onClose}
                    className="flex items-center gap-2.5 overflow-hidden min-w-0"
                  >
                    <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                      {user?.avatar &&
                      !user.avatar.includes("ui-avatars.com") ? (
                        <Image
                          src={getImageUrl(user.avatar)}
                          alt={user?.fullName || "User"}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="w-full h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-black flex items-center justify-center text-xs uppercase">
                          {user?.fullName?.[0]?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col truncate min-w-0 leading-tight">
                      <span className="text-xs font-bold text-zinc-950 dark:text-white truncate font-outfit">
                        {user?.fullName}
                      </span>
                      <span className="text-[10px] text-zinc-400 truncate">
                        {user?.email}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={onLogoutClick}
                    className="h-8 w-8 rounded-full border border-zinc-200/80 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-400 hover:text-rose-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
