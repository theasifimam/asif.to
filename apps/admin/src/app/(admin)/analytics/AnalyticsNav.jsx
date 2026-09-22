"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ASIF_SIMPLE_ANALYTICS_V1
const links = [
  ["Overview", "/analytics"],
  ["Search Console", "/analytics/search"],
  ["Platform", "/analytics/platform"],
];

export default function AnalyticsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="inline-flex max-w-full items-center gap-1 p-1 overflow-x-auto scrollbar-none"
      aria-label="Analytics sections"
    >
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
            pathname === href
              ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
