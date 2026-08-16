"use client";
import Link from "next/link";
import { FileText, Info, Cookie, HelpCircle, ArrowRight } from "lucide-react";
import AdminFormShell from "@/components/forms/AdminFormShell";

const LEGAL_THEMES = {
  sky: {
    card: "bg-sky-50/75 dark:bg-[#0c1524] border-sky-200/70 dark:border-sky-900/40",
    borderHover: "hover:border-sky-300 dark:hover:border-sky-600/60",
    glow: "from-sky-400/20 via-sky-400/5 to-transparent",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-200/80 dark:border-sky-500/30",
    linkText: "text-sky-700 dark:text-sky-400",
  },
  indigo: {
    card: "bg-indigo-50/75 dark:bg-[#12132b] border-indigo-200/70 dark:border-indigo-900/40",
    borderHover: "hover:border-indigo-300 dark:hover:border-indigo-600/60",
    glow: "from-indigo-400/20 via-indigo-400/5 to-transparent",
    icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30",
    linkText: "text-indigo-700 dark:text-indigo-400",
  },
  emerald: {
    card: "bg-emerald-50/75 dark:bg-[#0a1a14] border-emerald-200/70 dark:border-emerald-900/40",
    borderHover: "hover:border-emerald-300 dark:hover:border-emerald-600/60",
    glow: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30",
    linkText: "text-emerald-700 dark:text-emerald-400",
  },
  amber: {
    card: "bg-amber-50/75 dark:bg-[#1c140a] border-amber-200/70 dark:border-amber-900/40",
    borderHover: "hover:border-amber-300 dark:hover:border-amber-600/60",
    glow: "from-amber-400/20 via-amber-400/5 to-transparent",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border border-amber-200/80 dark:border-amber-500/30",
    linkText: "text-amber-700 dark:text-amber-400",
  },
  purple: {
    card: "bg-purple-50/75 dark:bg-[#160d24] border-purple-200/70 dark:border-purple-900/40",
    borderHover: "hover:border-purple-300 dark:hover:border-purple-600/60",
    glow: "from-purple-400/20 via-purple-400/5 to-transparent",
    icon: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-200/80 dark:border-purple-500/30",
    linkText: "text-purple-700 dark:text-purple-400",
  },
};

const pages = [
  {
    slug: "about",
    title: "About",
    description: "Company, product, and mission page.",
    icon: Info,
    tone: "sky",
  },
  {
    slug: "terms-conditions",
    title: "Terms of Service",
    description: "Terms governing use of asif.to.",
    icon: FileText,
    tone: "indigo",
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How user data is collected and handled.",
    icon: FileText,
    tone: "emerald",
  },
  {
    slug: "cookie-usage",
    title: "Cookie Policy",
    description: "Cookie usage and preference information.",
    icon: Cookie,
    tone: "amber",
  },
  {
    slug: "faq",
    title: "Help & FAQ",
    description: "Answers to common reader questions.",
    icon: HelpCircle,
    tone: "purple",
  },
];

export default function LegalPagesPage() {
  return (
    <AdminFormShell
      eyebrow="Site / Legal & Help"
      title="Legal pages"
      description="Manage policy, company information, and support content from one place."
    >
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map(({ slug, title, description, icon: Icon, tone }) => {
          const theme = LEGAL_THEMES[tone] || LEGAL_THEMES.sky;
          return (
            <Link
              key={slug}
              href={`/legal/${slug}`}
              className={`group relative overflow-hidden rounded-[28px] sm:rounded-4xl p-6 sm:p-7 border shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between ${theme.card} ${theme.borderHover}`}
            >
              {/* Corner Ambient Glow */}
              <div
                className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-linear-to-br ${theme.glow} blur-xl transition-opacity duration-300 group-hover:opacity-100 opacity-60`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-2xs ${theme.icon}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
                <h2 className="text-lg font-black font-outfit text-zinc-950 dark:text-white transition-colors">
                  {title}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {description}
                </p>
              </div>
              <span
                className={`relative z-10 mt-5 inline-flex items-center text-xs font-bold ${theme.linkText}`}
              >
                Edit page &rarr;
              </span>
            </Link>
          );
        })}
      </section>
    </AdminFormShell>
  );
}
