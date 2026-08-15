import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export const ROLE_CONFIG = {
  super_admin: {
    label: "Super admin",
    icon: ShieldCheck,
    color: "text-fuchsia-600 dark:text-fuchsia-400",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-500",
  },
  editor: {
    label: "Editor",
    icon: ShieldAlert,
    color: "text-blue-600 dark:text-blue-500",
  },
  author: {
    label: "Author",
    icon: Shield,
    color: "text-violet-600 dark:text-violet-500",
  },
  reader: {
    label: "Reader",
    icon: Shield,
    color: "text-zinc-500 dark:text-zinc-400",
  },
};

export const STATUS_CONFIG = {
  active: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-500",
  },
  suspended: { dot: "bg-red-500", text: "text-red-600 dark:text-red-500" },
  banned: { dot: "bg-red-700", text: "text-red-700 dark:text-red-400" },
  deactivated: { dot: "bg-zinc-500", text: "text-zinc-600 dark:text-zinc-400" },
  pending: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-500" },
};

export const initials = (name) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
