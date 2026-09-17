import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { PrivacyPolicy } from "@/components/legal/LegalPolicies";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

async function getPrivacyPage() {
  const apiUrl = (
    process.env.AUTH_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1"
  ).replace(/\/$/, "");

  try {
    const res = await fetch(`${apiUrl}/pages/privacy-policy`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const page = await getPrivacyPage();
  return {
    title: page?.seoTitle || page?.title || "Privacy Policy",
    description:
      page?.seoDescription ||
      page?.summary ||
      "How asif.to collects, uses, shares, retains, and protects personal data.",
    alternates: { canonical: page?.canonicalUrl || "/privacy" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function PrivacyPage() {
  const page = await getPrivacyPage();
  const lastUpdated = page?.lastUpdated || page?.updatedAt;
  const formattedDate = lastUpdated
    ? new Date(lastUpdated).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "August 15, 2026";

  return (
    <LegalDocument
      title={page?.title || "Privacy Policy"}
      icon={ShieldCheck}
      lastUpdated={`Effective and Last Updated: ${formattedDate}`}
    >
      {page?.content ? (
        <div
          className="legal-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <PrivacyPolicy />
      )}
    </LegalDocument>
  );
}

function LegalDocument({ title, icon: Icon, lastUpdated, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-foreground dark:bg-zinc-950 transition-colors duration-300">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 sm:px-6 pt-20 sm:pt-28 pb-16 space-y-6">
        <nav className="mb-4 flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">Legal</span>
        </nav>
        <article className="space-y-6 py-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400">
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              asif.to Legal &amp; Policy
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground font-outfit">
            {title}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {lastUpdated || "Effective and Last Updated: August 15, 2026"}
          </p>
          <div className="border-t border-zinc-200/70 pt-6 dark:border-zinc-800">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
