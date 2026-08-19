"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Bookmark,
  ChevronDown,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";

export default function AuthUserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 rounded-full bg-zinc-100 p-1 pr-2 text-xs font-bold transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        <img
          src={user.image || "/logo.png"}
          alt=""
          className="h-8 w-8 rounded-full object-cover"
        />
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="border-b border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="truncate text-[11px] text-zinc-500">{user.email}</p>
          </div>
          <MenuLink href={`/${user.username}`} icon={UserRound}>
            My Profile
          </MenuLink>
          <MenuLink href={`/${user.username}/settings`} icon={Settings}>
            Profile Settings
          </MenuLink>
          <MenuLink href="/bookmarks" icon={Bookmark}>
            Bookmarks
          </MenuLink>
          <button
            role="menuitem"
            onClick={async () => {
              await fetch("/api/auth/backend-session", {
                method: "DELETE",
              }).catch(() => {});
              await signOut({ redirectTo: "/" });
            }}
            className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
function MenuLink({ href, icon: Icon, children }) {
  return (
    <Link
      role="menuitem"
      href={href}
      className="mt-1 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800"
    >
      <Icon className="h-4 w-4 text-zinc-400" />
      {children}
    </Link>
  );
}
