import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import InteractiveCode from "@/components/interactive-code";
import { TECHNOLOGIES } from "@/lib/playground/config";
import { getProblem, PRACTICE_PROBLEMS } from "@/lib/playground/problems";
import { ArrowLeft, BookOpen, Lightbulb } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import { getSeoSetting } from "@/lib/publicContent";
import { mergePageMetadata } from "@/lib/pageMetadata";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;
export function generateStaticParams() {
  return PRACTICE_PROBLEMS.map(({ technology, slug }) => ({
    technology,
    slug,
  }));
}
export async function generateMetadata({ params }) {
  const { technology, slug } = await params;
  const problem = getProblem(technology, slug);
  if (!problem) return {};
  const path = `/practice/${technology}/${slug}`;
  return mergePageMetadata(
    {
      title: `${problem.title} in ${TECHNOLOGIES[technology].name}`,
      description: problem.description,
      keywords: problem.topics,
    },
    await getSeoSetting(path),
    path,
  );
}

export default async function ProblemPage({ params }) {
  const { technology, slug } = await params;
  const problem = getProblem(technology, slug);
  if (!problem) notFound();
  const tech = TECHNOLOGIES[technology];
  return (
    <div className="min-h-screen bg-zinc-50 text-foreground dark:bg-zinc-950">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LearningResource",
          name: problem.title,
          description: problem.description,
          url: absoluteUrl("", `/practice/${technology}/${slug}`),
          educationalLevel: problem.difficulty,
          learningResourceType: "Coding exercise",
          teaches: problem.topics,
          inLanguage: tech.name,
        }}
      />
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pt-28">
        <Link
          href={`/practice/${technology}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {tech.name} problems
        </Link>
        <article className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
          <div>
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400">
                  {tech.name}
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-black dark:bg-zinc-800">
                  {problem.difficulty}
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight">
                {problem.title}
              </h1>
              <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-300">
                {problem.description}
              </p>
              <h2 className="mt-7 text-sm font-black uppercase tracking-wide">
                Topics
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {problem.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-semibold dark:bg-zinc-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              {problem.hints?.length > 0 && (
                <details className="mt-7 rounded-2xl bg-amber-500/10 p-4">
                  <summary className="flex cursor-pointer items-center gap-2 text-sm font-black text-amber-700 dark:text-amber-400">
                    <Lightbulb className="h-4 w-4" />
                    Hints
                  </summary>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                    {problem.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <section className="mt-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-black uppercase tracking-wide">
                Example
              </h2>
              {problem.examples.map((example) => (
                <dl key={example.input} className="mt-3 grid gap-2 text-sm">
                  <div>
                    <dt className="font-bold text-zinc-500">Input</dt>
                    <dd className="mt-1 font-mono text-xs">{example.input}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-zinc-500">Expected</dt>
                    <dd className="mt-1 font-mono text-xs">{example.output}</dd>
                  </div>
                </dl>
              ))}
            </section>
            <aside className="mt-4 rounded-3xl border border-blue-500/20 bg-blue-500/5 p-5">
              <p className="flex items-center gap-2 text-sm font-black">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Need help?
              </p>
              <Link
                href={`/courses/${technology}`}
                className="mt-2 inline-block text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
              >
                Read the {tech.name} tutorials →
              </Link>
            </aside>
          </div>
          <section aria-label="Interactive code editor">
            <InteractiveCode
              language={technology}
              files={problem.starterFiles}
              title={problem.title}
              playgroundId={problem.slug}
              testCases={problem.testCases || []}
            />
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
