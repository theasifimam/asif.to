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
          <div className="flex flex-col gap-6">
            <nav
              aria-label="Settings"
              className="-mx-1 flex items-center gap-1 p-1.5 overflow-x-auto scrollbar-none sm:mx-0"
            >
              {sections.map(({ slug, label, icon: Icon }) => {
                const href = `/${settings.username}/settings/${slug}`;
                const active = pathname === href;
                return (
                  <Link
                    key={slug}
                    href={href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap ${
                      active
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                        : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-bold">{label}</span>
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
