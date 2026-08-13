import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProblemFilters from "@/components/practice/ProblemFilters";
import { TECHNOLOGIES } from "@/lib/playground/config";
import { getProblems, isTechnology } from "@/lib/playground/problems";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() { return Object.keys(TECHNOLOGIES).map((technology) => ({ technology })); }
export async function generateMetadata({ params }) { const { technology } = await params; if (!isTechnology(technology)) return {}; const tech = TECHNOLOGIES[technology]; const titles = { javascript: "JavaScript Practice Problems", react: "React Coding Practice", html: "HTML Coding Practice", css: "CSS Coding Practice", web: "HTML CSS JavaScript Practice", nextjs: "Next.js Coding Practice" }; return { title: titles[technology], description: `${tech.description} Filter coding challenges by topic and difficulty.`, alternates: { canonical: `/practice/${technology}` } }; }

export default async function TechnologyPracticePage({ params }) {
  const { technology } = await params;
  if (!isTechnology(technology)) notFound();
  const tech = TECHNOLOGIES[technology];
  const problems = getProblems(technology);
  return <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950"><Header /><main className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28"><Link href="/practice" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400"><ArrowLeft className="h-4 w-4" />All technologies</Link><header className="mb-8 mt-6"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{tech.name} Practice Problems</h1><p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">{tech.description} Select a problem, edit the starter files, and inspect the output safely in your browser.</p></header><ProblemFilters problems={problems} technology={technology} topics={tech.topics} /></main><Footer /></div>;
}
