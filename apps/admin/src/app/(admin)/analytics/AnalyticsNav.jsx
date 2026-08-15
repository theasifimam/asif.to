"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Overview", "/analytics"],
  ["Platform", "/analytics/platform"],
  ["Search", "/analytics/search"],
  ["Audience", "/analytics/audience"],
  ["Content", "/analytics/content"],
  ["Insights", "/analytics/insights"],
];

export default function AnalyticsNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex gap-1 overflow-x-auto scrollbar-none"
      aria-label="Analytics sections"
    >
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
            pathname === href
              ? "bg-blue-600 text-white shadow-xs"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
