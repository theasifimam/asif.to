"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, Plug } from "lucide-react";

const TABS = [
  { href: "/social-posts", label: "Posts", icon: Image },
  { href: "/social-integrations", label: "Integrations", icon: Plug },
];

export default function SocialMediaTabs() {
  const pathname = usePathname();
  return (
    <div className="inline-flex max-w-full items-center gap-1 p-1 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          tab.href === "/social-posts"
            ? pathname?.startsWith("/social-posts")
            : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${active ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400" : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"}`}
          >
            <Icon size={14} /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
