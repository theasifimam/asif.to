import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FreePlayground from "@/components/interactive-code/FreePlayground";
import { Code2, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Online Code Playground",
  description:
    "Write and run JavaScript, TypeScript, HTML, CSS, and React code in a secure browser coding playground.",
  alternates: { canonical: "/run" },
};

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-7xl px-3 pb-24 pt-24 sm:px-6 sm:pt-28">
        <header className="mb-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
            <Code2 className="h-4 w-4" />
            Free coding playground
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Write code. Run it. See the result.
          </h1>
          <p className="mt-3 max-w-3xl leading-relaxed text-zinc-600 dark:text-zinc-400">
            Use this open workspace for your own loops, conditions, functions,
            methods, components, and experiments. Select a technology below and
            replace the starter code with anything you want to practice.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Your code runs in an isolated browser sandbox and is not sent to the
            asif.to backend.
          </p>
          <Link
            href="/practice"
            className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
          >
            Prefer guided problems? Browse coding challenges →
          </Link>
        </header>
        <FreePlayground />
      </main>
      <Footer />
    </div>
  );
}
