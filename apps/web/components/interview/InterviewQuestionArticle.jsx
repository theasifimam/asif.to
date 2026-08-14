import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  MessageSquareText,
  Tag,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import InterviewAnswer from "./InterviewAnswer";
import {
  getPublicInterviewQuestion,
  getPublicInterviewQuestions,
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
  const title =
    data.question.seoTitle ||
    `${data.question.question} | ${data.course.title} Interview Answer`;
  const description =
    data.question.seoDescription ||
    String(data.question.answer)
      .replace(/[#*]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 158);
  const canonical = absoluteUrl(
    data.question.canonicalUrl,
    `/${data.course.slug}/interview-questions/${data.question.slug}`,
  );
  return {
    title,
    description,
    keywords: [
      ...(data.question.keywords?.length
        ? data.question.keywords
        : data.question.tags || []),
      `${data.course.title} interview questions`,
    ],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "asif.to",
      ...(data.question.ogImage ? { images: [data.question.ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(data.question.ogImage ? { images: [data.question.ogImage] } : {}),
    },
  };
}

export default async function InterviewQuestionArticle({
  courseSlug,
  questionSlug,
}) {
  const [data, list] = await Promise.all([
    getPublicInterviewQuestion(courseSlug, questionSlug),
    getPublicInterviewQuestions(courseSlug, 1),
  ]);
  if (!data) notFound();
  const { course, question } = data;
  const index = list?.questionIndex || [];
  const position = index.findIndex((item) => item._id === question._id);
  const previous = position > 0 ? index[position - 1] : null;
  const next =
    position >= 0 && position < index.length - 1 ? index[position + 1] : null;
  const href = (item) => `/${course.slug}/interview-questions/${item.slug}`;
  const canonical = absoluteUrl("", href(question));
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: question.question,
        description: String(question.answer).replace(/[#*]/g, "").slice(0, 200),
        url: canonical,
        mainEntityOfPage: canonical,
        author: { "@type": "Organization", name: "asif.to", url: getSiteUrl() },
        isPartOf: {
          "@type": "CollectionPage",
          name: `${course.title} Interview Questions`,
          url: absoluteUrl("", `/${course.slug}/interview-questions`),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: question.question,
            acceptedAnswer: { "@type": "Answer", text: question.answer },
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
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24">
        <Link
          href={`/${course.slug}/interview-questions`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> All {course.title} questions
        </Link>
        <article className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-4xl">
          <header className="border-b border-zinc-100 p-5 dark:border-zinc-800 sm:p-9">
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
            <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
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
          <div className="p-5 sm:p-9">
            <div className="mb-5 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-orange-600">
              <MessageSquareText className="h-5 w-5" /> Detailed interview
              answer
            </div>
            <InterviewAnswer content={question.answer} />
            {question.codeExample && (
              <section className="mt-8">
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <Code2 className="h-5 w-5 text-blue-500" /> Code example
                </h2>
                <pre className="mt-3 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm leading-6 text-zinc-100">
                  <code>{question.codeExample}</code>
                </pre>
              </section>
            )}
          </div>
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
      </main>
      <Footer />
    </div>
  );
}
