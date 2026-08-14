import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TECHNOLOGIES } from "@/lib/playground/config";
import { getProblems } from "@/lib/playground/problems";
import { ArrowRight, Code2 } from "lucide-react";
import ContinuePractice from "@/components/practice/ContinuePractice";
import JsonLd from "@/components/JsonLd";
import { getSeoSetting } from "@/lib/publicContent";
import { mergePageMetadata } from "@/lib/pageMetadata";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;
const fallback = {
  title: "Coding Practice",
  description:
    "Practice JavaScript, HTML, CSS, React, and browser-supported Next.js with secure interactive coding playgrounds.",
};
export async function generateMetadata() {
  return mergePageMetadata(
    fallback,
    await getSeoSetting("/practice"),
    "/practice",
  );
}

export default function PracticePage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: fallback.title,
          description: fallback.description,
          url: absoluteUrl("", "/practice"),
        }}
      />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
        <header className="mb-10 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
            <Code2 className="h-4 w-4" />
            Interactive practice
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
            Learn by changing the code.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Choose a technology, solve focused problems, and run your work in an
            isolated browser sandbox. Problem explanations remain fast,
            crawlable server-rendered content.
          </p>
        </header>
        <ContinuePractice />
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(TECHNOLOGIES).map(([slug, tech]) => (
            <Link
              href={`/practice/${slug}`}
              key={slug}
              className="group rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between">
                <Code2 className="h-7 w-7 text-blue-500" />
                <ArrowRight className="h-5 w-5 text-zinc-400 transition group-hover:translate-x-1" />
              </div>
              <h2 className="mt-6 text-xl font-black">{tech.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {tech.description}
              </p>
              <p className="mt-5 text-xs font-bold text-blue-600 dark:text-blue-400">
                {getProblems(slug).length} practice problems
              </p>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
