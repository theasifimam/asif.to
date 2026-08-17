import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FreePlayground from "@/components/interactive-code/FreePlayground";
import { Code2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Online Code Playground",
  description:
    "Write and run JavaScript, TypeScript, HTML, CSS, and React code in a secure browser coding playground.",
  alternates: { canonical: "/run" },
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

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-3 pb-20 pt-20 sm:px-6 sm:pt-28">
        <header className="mb-5 sm:mb-7">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
            <Code2 className="h-3.5 w-3.5" />
            Free coding playground
          </span>
          <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Write code. Run it. See the result.
          </h1>
          <p className="mt-2 max-w-3xl text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Practice loops, functions, components, methods, and algorithms in real time. Switch technologies directly in the editor header.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-500">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Isolated browser sandbox
            </span>
            <Link
              href="/practice"
              className="font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
              Browse coding challenges →
            </Link>
          </div>
        </header>
        <FreePlayground />
      </main>
      <Footer />
    </div>
  );
}
