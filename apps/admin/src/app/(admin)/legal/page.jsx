"use client";
import Link from "next/link";
import { FileText, Info, Cookie, HelpCircle, ArrowRight } from "lucide-react";
import AdminFormShell from "@/components/forms/AdminFormShell";

const pages = [
  {
    slug: "about",
    title: "About",
    description: "Company, product, and mission page.",
    icon: Info,
  },
  {
    slug: "terms-conditions",
    title: "Terms of Service",
    description: "Terms governing use of asif.to.",
    icon: FileText,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    description: "How user data is collected and handled.",
    icon: FileText,
  },
  {
    slug: "cookie-usage",
    title: "Cookie Policy",
    description: "Cookie usage and preference information.",
    icon: Cookie,
  },
  {
    slug: "faq",
    title: "Help & FAQ",
    description: "Answers to common reader questions.",
    icon: HelpCircle,
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
        {pages.map(({ slug, title, description, icon: Icon }) => (
          <Link
            key={slug}
            href={`/legal/${slug}`}
            className="admin-surface group rounded-[28px] sm:rounded-4xl p-6 sm:p-7 transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <h2 className="text-lg font-black font-outfit text-zinc-950 dark:text-white group-hover:text-blue-600 transition-colors">
                {title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
            <span className="mt-5 inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
              Edit page &rarr;
            </span>
          </Link>
        ))}
      </section>
    </AdminFormShell>
  );
}
