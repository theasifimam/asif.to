import Link from "next/link";
import { ArrowRight, HelpCircle, Sparkles, BookOpen } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicInterviewCategories } from "@/lib/publicContent";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata() {
  const title = "Interview Questions & Answers Hub | asif.to";
  const description =
    "Explore curated technical interview questions and answers organized by category. Practice Next.js, React, JavaScript, and more with code examples and follow-up prompts.";
  const canonical = absoluteUrl("", "/interview-questions");

  return {
    title,
    description,
    keywords: [
      "interview questions",
      "coding interview preparation",
      "next.js interview questions",
      "react interview questions",
      "javascript interview questions",
      "asif.to",
    ],
    alternates: { canonical },
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
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InterviewQuestionsIndexPage() {
  const categories = (await getPublicInterviewCategories()) || [];

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-7 flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">Interview Questions</span>
        </nav>
        <header className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-4xl sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            Interview Preparation Directory
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Interview Questions by Technology
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Select a category to view full answers, code examples, expected outputs, and likely follow-up questions.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="mt-10 rounded-4xl border border-zinc-200 bg-white p-12 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <HelpCircle className="mx-auto mb-3 h-10 w-10 text-zinc-400" />
            No interview categories published yet.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={
                  category.course?.slug
                    ? `/${category.course.slug}/interview-questions/${category.slug}`
                    : `/interview-questions/${category.slug}`
                }
                className="group flex flex-col justify-between rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs transition-all hover:border-orange-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                      {category.questionCount} Questions
                    </span>
                    {category.course && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        <BookOpen className="h-3 w-3" /> Course Linked
                      </span>
                    )}
                  </div>
                  <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                    {category.name} Interview Questions
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {category.description || `Comprehensive interview questions and answers for ${category.name}.`}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                    Explore guide
                  </span>
                  <ArrowRight className="h-4 w-4 text-orange-500 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
