import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Tag,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SaveButton from "@/components/articles/SaveButton";
import ArticleAnswerSection from "./ArticleAnswerSection";
import RelatedContentSidebar from "@/components/related/RelatedContentSidebar";
import RelatedContentBottom from "@/components/related/RelatedContentBottom";
import {
  getPublicInterviewQuestion,
  getPublicInterviewQuestions,
  getRelatedContent,
} from "@/lib/publicContent";
import { absoluteUrl, getSiteUrl, jsonLd } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function buildInterviewQuestionMetadata(courseSlug, questionSlug) {
  const data = await getPublicInterviewQuestion(courseSlug, questionSlug);
  if (!data)
    return {
      title: "Interview Question Not Found",
      robots: { index: false, follow: false },
    };

  const { question, course } = data;
  const title = question.seoTitle || `${question.question} | ${course?.title || "Technical"} Interview Question`;
  const description =
    question.seoDescription ||
    question.answer?.slice(0, 160) ||
    "Interview question answer, code example and explanation.";
  const canonical = absoluteUrl(
    question.canonicalUrl,
    `/${encodeURIComponent(course.slug)}/interview-questions/${encodeURIComponent(question.slug)}`,
  );

  return {
    title,
    description,
    keywords: question.keywords || question.tags || [],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "asif.to",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function InterviewQuestionArticle({
  courseSlug,
  questionSlug,
}) {
  const data = await getPublicInterviewQuestion(courseSlug, questionSlug);
  if (!data) notFound();

  const { question, course, previous, next } = data;
  const canonical = absoluteUrl(
    question.canonicalUrl,
    `/${encodeURIComponent(course.slug)}/interview-questions/${encodeURIComponent(question.slug)}`,
  );
  const href = (target) =>
    target
      ? `/${encodeURIComponent(course.slug)}/interview-questions/${encodeURIComponent(target.slug)}`
      : "";

  const relatedData = await getRelatedContent({
    type: "question",
    slug: question.slug,
    courseSlug: course.slug,
    techId: course.techId,
  });

  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Question",
        "@id": `${canonical}#question`,
        name: question.question,
        text: question.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: [question.answer, question.codeExample]
            .filter(Boolean)
            .join("\n\n"),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getSiteUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: course.title,
            item: absoluteUrl("", `/courses/${encodeURIComponent(course.slug)}`),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Interview Questions",
            item: absoluteUrl("", `/${encodeURIComponent(course.slug)}/interview-questions`),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: question.question,
            item: canonical,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(structured) }}
      />
      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <Link
          href={`/${encodeURIComponent(course.slug)}/interview-questions`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All {course.title} questions
        </Link>

        <div className="mt-5 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main Question Column */}
          <div className="min-w-0 max-w-full">
            <article className="overflow-hidden">
              <header className="border-b border-zinc-200 py-5 dark:border-zinc-800 sm:py-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                    {course.title} · {question.difficulty} · {question.questionType}
                  </p>
                  <SaveButton
                    itemId={question._id}
                    itemType="interview_question"
                    label="Save question"
                  />
                </div>
                <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                  {question.question}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(question.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500 dark:bg-zinc-800"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </header>
              <ArticleAnswerSection
                answer={question.answer}
                codeExample={question.codeExample}
              />
            </article>

            <nav className="mt-6 grid gap-3 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={href(previous)}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="block text-xs text-zinc-400">
                    Previous question
                  </span>
                  <span className="mt-1 line-clamp-2">{previous.question}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  href={href(next)}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 text-right text-sm font-semibold dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="block text-xs text-zinc-400">Next question</span>
                  <span className="mt-1 flex items-center justify-end gap-2">
                    <span className="line-clamp-2">{next.question}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </span>
                </Link>
              )}
            </nav>

            <RelatedContentBottom relatedData={relatedData} />
          </div>

          {/* Desktop Sticky Sidebar */}
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <RelatedContentSidebar relatedData={relatedData} currentType="question" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
