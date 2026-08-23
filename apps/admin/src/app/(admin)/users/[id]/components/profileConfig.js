import { ShieldCheck, ShieldAlert, Shield, FileEdit, FileText, User as UserIcon } from "lucide-react";

export const ROLE_CONFIG = {
  super_admin: {
    label: "Super Admin",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
    ring: "ring-fuchsia-500/30",
    icon: ShieldCheck,
  },
  admin: {
    label: "Admin",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
    ring: "ring-rose-500/30",
    icon: ShieldCheck,
  },
  editor: {
    label: "Editor",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    ring: "ring-blue-500/30",
    icon: FileEdit,
  },
  author: {
    label: "Author",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10 dark:bg-violet-500/20",
    ring: "ring-violet-500/30",
    icon: FileText,
  },
  reader: {
    label: "Reader",
    color: "text-zinc-600 dark:text-zinc-400",
    bg: "bg-zinc-500/10 dark:bg-zinc-500/20",
    ring: "ring-zinc-500/30",
    icon: UserIcon,
  },
};

export const STATUS_CONFIG = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    bg: "bg-emerald-500/5",
  },
  suspended: {
    label: "Suspended",
    dot: "bg-rose-500",
    text: "text-rose-500",
    bg: "bg-rose-500/5",
  },
  pending: {
    label: "Pending",
    dot: "bg-amber-500",
    text: "text-amber-500",
    bg: "bg-amber-500/5",
  },
};

export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
