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
    <nav className="flex gap-1 overflow-x-auto shrink-0 rounded-2xl p-1">
      {visibleItems.map(([label, href]) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
              active
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950"
                : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
