"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Eye, Globe2, Shield, UserRound } from "lucide-react";
import LogoLoader from "@/components/ui/LogoLoader";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SettingsHeader from "@/components/settings/SettingsHeader";
import SecurityInfoCard from "@/components/settings/SecurityInfoCard";
import { useProfileSettingsForm } from "@/components/settings/useProfileSettingsForm";
import { ProfileSettingsProvider } from "@/components/settings/ProfileSettingsContext";

const sections = [
  {
    slug: "profile",
    label: "Profile",
    description: "Identity, photo and bio",
    icon: UserRound,
  },
  {
    slug: "socials",
    label: "Social links",
    description: "Portfolio and online presence",
    icon: Globe2,
  },
  {
    slug: "notifications",
    label: "Notifications",
    description: "Updates and newsletters",
    icon: Bell,
  },
  {
    slug: "privacy",
    label: "Privacy",
    description: "Visibility and activity",
    icon: Eye,
  },
  {
    slug: "security",
    label: "Security",
    description: "Password and account access",
    icon: Shield,
  },
];

export default function ProfileSettingsLayout({ children }) {
  const pathname = usePathname();
  const settings = useProfileSettingsForm();

  if (settings.profileLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <LogoLoader className="h-14 w-14 text-blue-600" />
      </div>
    );

  return (
    <ProfileSettingsProvider value={settings}>
      <div className="flex min-h-screen flex-col bg-zinc-50 pb-28 text-foreground transition-colors duration-300 dark:bg-zinc-950 sm:pb-20">
        <Header />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pt-20 sm:px-6 sm:pt-24">
          <SettingsHeader username={settings.username} />
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start">
            <nav
              aria-label="Settings"
              className="-mx-1 flex flex-col gap-1 rounded-3xl border border-zinc-200/80 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 lg:sticky lg:top-24 lg:mx-0 lg:space-y-1 lg:max-h-[calc(100dvh-6.5rem)] lg:overflow-y-auto scrollbar-none"
            >
              {sections.map(({ slug, label, description, icon: Icon }) => {
                const href = `/${settings.username}/settings/${slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={slug}
                    href={href}
                    className={`flex w-full items-center gap-3 px-3 py-3 rounded-xl transition-colors ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15" : "bg-transparent text-zinc-700 hover:bg-blue-50/60 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-xs font-black">
                        {label}
                      </span>
                      <span
                        className={`hidden truncate text-[10px] font-medium lg:block ${active ? "text-blue-100" : "text-zinc-500 dark:text-zinc-500"}`}
                      >
                        {description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
            <section className="min-w-0">
              {children}
              <SecurityInfoCard />
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </ProfileSettingsProvider>
  );
}
