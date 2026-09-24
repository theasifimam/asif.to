"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Globe2, SearchCheck, Link as LinkIcon, Code2 } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin";

export default function SiteSettingsLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/site-settings", exact: true, label: "asif.to", icon: Globe2 },
    { href: "/site-settings/admin-brand", exact: false, label: "admin.asif.to", icon: Globe2 },
    { href: "/site-settings/seo", exact: false, label: "SEO Settings", icon: SearchCheck },
    { href: "/site-settings/interlinking", exact: false, label: "Interlinking", icon: LinkIcon },
    { href: "/site-settings/playground", exact: false, label: "Code Playground", icon: Code2 },
  ];

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="System Configuration"
        title="Site Settings"
        description="Manage your site's identity, search appearance, internal linking, and code playground."
      />

      <div className="w-full">
        <nav className="inline-flex max-w-full items-center gap-1.5 p-1 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 overflow-x-auto scrollbar-none mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-0">
          {children}
        </div>
      </div>
    </AdminPage>
  );
}
