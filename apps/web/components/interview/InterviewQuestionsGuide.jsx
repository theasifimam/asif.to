import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Code2,
  List,
  MessageSquareText,
  Tag,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicInterviewQuestions } from "@/lib/publicContent";
import { absoluteUrl, getSiteUrl, jsonLd } from "@/lib/seo";
import InterviewAnswer from "./InterviewAnswer";
import SaveButton from "@/components/articles/SaveButton";
import MobileQuestionIndex from "./MobileQuestionIndex";

const difficultyStyles = {
  easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  medium: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  hard: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
};

export async function buildInterviewGuideMetadata(
  courseSlug,
  requestedPage = 1,
) {
  const data = await getPublicInterviewQuestions(courseSlug, requestedPage);
  if (!data?.course)
    return {
      title: "Interview Questions Not Found",
      robots: { index: false, follow: false },
    };
  const page = Math.max(Number(requestedPage) || 1, 1);
  const courseName = data.course.title;
  const title = `${data.course.interviewSeoTitle || `${courseName} Interview Questions and Answers`}${page > 1 ? ` - Page ${page}` : ""}`;
  const description =
    data.course.interviewSeoDescription ||
    `Prepare for ${courseName} interviews with ${data.pagination?.total || "detailed"} questions, clear answers, code examples, and follow-up prompts.`;
  const path = `/${encodeURIComponent(data.course.slug || courseSlug)}/interview-questions${page > 1 ? `?page=${page}` : ""}`;
  const canonical = absoluteUrl(
    page === 1 ? data.course.interviewCanonicalUrl : "",
    path,
  );
  return {
    title,
    description,
    keywords: data.course.interviewKeywords?.length
      ? data.course.interviewKeywords
      : [
          `${courseName} interview questions`,
          `${courseName} interview answers`,
          `${courseName} interview preparation`,
        ],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      siteName: "asif.to",
      ...(data.course.interviewOgImage
        ? { images: [data.course.interviewOgImage] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(data.course.interviewOgImage
        ? { images: [data.course.interviewOgImage] }
        : {}),
    },
  };
}

export default async function InterviewQuestionsGuide({
  courseSlug,
  requestedPage = 1,
}) {
  const page = Math.max(Number(requestedPage) || 1, 1);
  const data = await getPublicInterviewQuestions(courseSlug, page);
  const course = data?.course;
  const questions = data?.questions || [];
  const questionIndex = data?.questionIndex || [];
  const pagination = data?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
    limit: 15,
  };
  const canonicalSlug = course?.slug || courseSlug;
  const basePath = `/${encodeURIComponent(canonicalSlug)}/interview-questions`;
  const firstNumber = (pagination.page - 1) * pagination.limit + 1;
  const indexedQuestions = new Map(
    questionIndex.map((item, index) => [
      item.question.trim().toLowerCase(),
      {
        ...item,
        number: index + 1,
        page: Math.floor(index / pagination.limit) + 1,
      },
    ]),
  );
  const followUpHref = (followUp) => {
    const target = indexedQuestions.get(followUp.trim().toLowerCase());
    if (!target) return null;
    const pageQuery = target.page > 1 ? `?page=${target.page}` : "";
    return `${basePath}${pageQuery}#question-${target.number}`;
  };
  const structuredData = course
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "FAQPage",
            "@id": `${absoluteUrl("", basePath)}#questions`,
            name: `${course.title} Interview Questions and Answers`,
            mainEntity: questions.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: [item.answer, item.codeExample]
                  .filter(Boolean)
                  .join("\n\n"),
              },
            })),
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
                item: absoluteUrl(
                  "",
                  `/courses/${encodeURIComponent(canonicalSlug)}`,
                ),
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Interview Questions",
                item: absoluteUrl("", basePath),
              },
            ],
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
      )}
      <main className="mx-auto min-w-0 w-full max-w-7xl px-0 pb-20 pt-24 sm:px-6 lg:px-8">
        <Link
          href={`/courses/${encodeURIComponent(canonicalSlug)}`}
          className="mx-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400 sm:mx-0"
        >
          <ArrowLeft className="h-4 w-4" /> Back to {course?.title || "course"}
        </Link>
        <header className="mx-3 mt-5 min-w-0 max-w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:mx-0 sm:rounded-4xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
            Interview preparation guide
          </p>
          <h1 className="mt-3 max-w-4xl break-words text-3xl font-black tracking-tight sm:text-5xl">
            {course?.title || courseSlug} interview questions and answers
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            Read every answer without extra clicks. Work through the questions
            in order, review code examples, and use the follow-up prompts to
            practise explaining each concept aloud.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-zinc-100 px-4 py-2 font-semibold dark:bg-zinc-800">
              {pagination.total} questions
            </span>
            <span className="rounded-full bg-orange-50 px-4 py-2 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              Easy to advanced
            </span>
            <span className="rounded-full bg-blue-50 px-4 py-2 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Answers always visible
            </span>
          </div>
        </header>

        {!course || questions.length === 0 ? (
          <div className="mx-3 mt-8 rounded-4xl border border-zinc-200 bg-white p-12 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 sm:mx-0">
            Interview questions for this course are coming soon.
          </div>
        ) : (
          <>
            <MobileQuestionIndex
              questions={questions.map(({ _id, question }) => ({
                _id,
                question,
              }))}
              firstNumber={firstNumber}
            />
            <div className="mt-5 grid w-full min-w-0 max-w-full items-start gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_300px]">
              <section
                className="w-full min-w-0 max-w-full space-y-0 sm:space-y-5"
                aria-label="Interview questions and answers"
              >
                {questions.map((item, index) => {
                  const number = firstNumber + index;
                  return (
                    <article
                      id={`question-${number}`}
                      key={item._id}
                      className="w-full min-w-0 max-w-full scroll-mt-36 overflow-hidden border-b border-zinc-200 bg-transparent px-4 py-8 dark:border-zinc-800 sm:scroll-mt-24 sm:rounded-4xl sm:border sm:bg-white sm:p-8 sm:shadow-sm sm:dark:bg-zinc-900"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-sm font-black text-white sm:h-10 sm:w-10 sm:rounded-2xl">
                          {number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${difficultyStyles[item.difficulty] || difficultyStyles.medium}`}
                            >
                              {item.difficulty}
                            </span>
                            <span className="text-xs font-semibold capitalize text-zinc-400">
                              {item.questionType}
                            </span>
                          </div>
                          <h2 className="mt-3 text-lg font-black leading-snug tracking-tight sm:text-2xl">
                            <Link
                              href={`${basePath}/${item.slug}`}
                              className="hover:text-orange-600"
                            >
                              {item.question}
                            </Link>
                          </h2>
                          <div className="mt-3">
                            <SaveButton
                              itemId={item._id}
                              itemType="interview_question"
                              label="Save"
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 min-w-0 max-w-full border-l-4 border-orange-400 pl-3 sm:ml-14 sm:pl-6">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-orange-700 dark:text-orange-300 sm:text-sm">
                          <MessageSquareText className="h-4 w-4 shrink-0" />{" "}
                          Interview-ready answer
                        </div>
                        <div className="mt-3 min-w-0 max-w-full">
                          <InterviewAnswer content={item.answer} />
                        </div>
                        {item.codeExample && (
                          <div className="mt-5 min-w-0 max-w-full">
                            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                              <Code2 className="h-4 w-4" /> Code example
                            </p>
                            <pre className="max-w-full whitespace-pre-wrap break-all rounded-2xl bg-zinc-950 p-3 text-xs leading-5 text-zinc-100 sm:overflow-x-auto sm:whitespace-pre sm:break-normal sm:p-4 sm:text-sm sm:leading-6">
                              <code>{item.codeExample}</code>
                            </pre>
                            {item.expectedOutput && (
                              <pre className="mt-2 max-w-full whitespace-pre-wrap break-all rounded-2xl bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 sm:overflow-x-auto sm:whitespace-pre sm:break-normal sm:p-4 sm:text-sm">
                                <code>{item.expectedOutput}</code>
                              </pre>
                            )}
                          </div>
                        )}
                        {(item.followUps || []).length > 0 && (
                          <div className="mt-5 rounded-2xl bg-blue-50 p-4 dark:bg-blue-500/10">
                            <p className="text-xs font-black uppercase tracking-wide text-blue-700 dark:text-blue-300">
                              Likely follow-up questions
                            </p>
                            <ul className="mt-2 space-y-2 text-sm leading-6">
                              {item.followUps.map((followUp) => {
                                const href = followUpHref(followUp);
                                return (
                                  <li key={followUp}>
                                    {href ? (
                                      <Link
                                        href={href}
                                        className="group flex items-start gap-2 font-semibold text-blue-700 hover:underline dark:text-blue-300"
                                      >
                                        <span aria-hidden="true">→</span>
                                        <span>{followUp}</span>
                                      </Link>
                                    ) : (
                                      <span className="text-zinc-700 dark:text-zinc-300">
                                        {followUp}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                        {(item.tags || []).length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 dark:bg-zinc-800"
                              >
                                <Tag className="h-3 w-3" /> {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
                <Pagination pagination={pagination} basePath={basePath} />
              </section>
              <aside className="hidden lg:sticky lg:top-24 lg:block">
                <nav
                  aria-label="Questions on this page"
                  className="rounded-4xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-100 px-2 pb-3 text-sm font-black dark:border-zinc-800">
                    <List className="h-4 w-4 text-orange-500" /> Questions on
                    this page
                  </div>
                  <ol className="mt-2 max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-1">
                    {questions.map((item, index) => {
                      const number = firstNumber + index;
                      return (
                        <li key={item._id}>
                          <a
                            href={`#question-${number}`}
                            className="flex gap-3 rounded-xl px-2 py-2.5 text-sm leading-5 text-zinc-600 transition-colors hover:bg-orange-50 hover:text-orange-800 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-200"
                          >
                            <span className="font-black text-orange-500">
                              {number}
                            </span>
                            <span className="line-clamp-2">
                              {item.question}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </aside>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Pagination({ pagination, basePath }) {
  const pages = Math.max(pagination.pages || 1, 1);
  if (pages <= 1) return null;
  const href = (page) => (page === 1 ? basePath : `${basePath}?page=${page}`);
  return (
    <nav
      className="grid w-full min-w-0 grid-cols-[1fr_auto_1fr] items-center gap-1 rounded-3xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900 sm:p-4"
      aria-label="Interview question pages"
    >
      <Link
        href={href(Math.max(pagination.page - 1, 1))}
        aria-disabled={pagination.page <= 1}
        className={`inline-flex min-w-0 items-center justify-self-start gap-1 rounded-full px-2 py-2 text-xs font-bold sm:gap-2 sm:px-4 sm:text-sm ${pagination.page <= 1 ? "pointer-events-none text-zinc-300" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        <span className="sm:hidden">Prev</span>
        <span className="hidden sm:inline">Previous</span>
      </Link>
      <span className="whitespace-nowrap text-[11px] font-semibold text-zinc-500 sm:text-sm">
        Page {pagination.page} of {pages}
      </span>
      <Link
        href={href(Math.min(pagination.page + 1, pages))}
        aria-disabled={pagination.page >= pages}
        className={`inline-flex min-w-0 items-center justify-self-end gap-1 rounded-full px-2 py-2 text-xs font-bold sm:gap-2 sm:px-4 sm:text-sm ${pagination.page >= pages ? "pointer-events-none text-zinc-300" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
      >
        Next <ChevronRight className="h-4 w-4 shrink-0" />
      </Link>
    </nav>
  );
}
