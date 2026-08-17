import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { TermsOfService } from "@/components/legal/LegalPolicies";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description: "The terms governing access to and use of asif.to.",
  alternates: { canonical: "/terms" },
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

export default function TermsPage() {
  return <LegalDocument title="Terms of Service" icon={FileText}><TermsOfService/></LegalDocument>;
}

function LegalDocument({ title, icon: Icon, children }) { return <div className="flex min-h-screen flex-col bg-zinc-50 text-foreground dark:bg-zinc-950"><Header/><main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 pb-16 pt-20 sm:px-6 sm:pt-28"><article className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900 sm:rounded-[2.5rem] sm:p-10"><div className="flex items-center gap-2.5"><div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-600 dark:text-blue-400"><Icon className="h-5 w-5"/></div><span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">asif.to Legal &amp; Policy</span></div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{title}</h1><p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Effective and Last Updated: August 15, 2026</p><div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">{children}</div></article></main><Footer/></div>; }
