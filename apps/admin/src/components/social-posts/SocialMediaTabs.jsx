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
    <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {TABS.map((tab) => {
        const active = tab.href === "/social-posts" ? pathname?.startsWith("/social-posts") : pathname?.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-white" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"}`}>
            <Icon size={14} /> {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
