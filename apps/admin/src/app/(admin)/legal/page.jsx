"use client";
import Link from "next/link";
import { FileText, Info, Cookie, HelpCircle, ArrowRight } from "lucide-react";
import AdminFormShell from "@/components/AdminFormShell";

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
            className="group rounded-4xl border border-zinc-200/60 bg-white p-6 transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg dark:border-zinc-800/60 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Icon className="h-6 w-6" />
              </span>
              <ArrowRight className="h-5 w-5 text-zinc-300 group-hover:text-blue-500" />
            </div>
            <h2 className="mt-6 text-xl font-black text-zinc-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {description}
            </p>
            <span className="mt-5 block text-xs font-bold uppercase tracking-wider text-blue-600">
              Edit page
            </span>
          </Link>
        ))}
      </section>
    </AdminFormShell>
  );
}
