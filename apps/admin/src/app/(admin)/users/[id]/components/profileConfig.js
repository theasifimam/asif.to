import { Shield, FileEdit, FileText, User as UserIcon } from "lucide-react";

export const ROLE_CONFIG = {
  admin: {
    label: "Administrator",
    color: "text-rose-500",
    bg: "bg-rose-500/5",
    ring: "ring-rose-500/20",
    icon: Shield,
  },
  editor: {
    label: "Editor",
    color: "text-blue-500",
    bg: "bg-blue-500/5",
    ring: "ring-blue-500/20",
    icon: FileEdit,
  },
  author: {
    label: "Author",
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    ring: "ring-emerald-500/20",
    icon: FileText,
  },
  reader: {
    label: "Reader",
    color: "text-zinc-500",
    bg: "bg-zinc-500/5",
    ring: "ring-zinc-500/20",
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
