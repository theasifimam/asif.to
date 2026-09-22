"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";

const items = [
  ["All users", "/users", "users.view"],
  ["Invitations", "/users/invitations", "invitations.manage"],
  ["Roles & permissions", "/users/roles", "roles.manage"],
  ["Activity", "/users/activity", "users.edit"],
];

export function UserManagementNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const visibleItems = items.filter((item) => hasPermission(user, item[2]));
  return (
    <nav className="inline-flex max-w-full items-center gap-1 p-1 overflow-x-auto scrollbar-none">
      {visibleItems.map(([label, href]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
              active
                ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
