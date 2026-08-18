import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  List,
  Sparkles,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  getPublicInterviewCategory,
  getRelatedContent,
} from "@/lib/publicContent";
import { absoluteUrl, getSiteUrl, jsonLd } from "@/lib/seo";
import InterviewAnswer from "./InterviewAnswer";
import InterviewQuestionList from "./InterviewQuestionList";
import MobileQuestionIndex from "./MobileQuestionIndex";
import RelatedContentSidebar from "@/components/related/RelatedContentSidebar";
import RelatedContentBottom from "@/components/related/RelatedContentBottom";

export async function buildCategoryInterviewGuideMetadata(
  courseSlugOrCategorySlug,
  categorySlugOrPage,
  requestedPage = 1,
) {
  let courseSlug = null;
  let categorySlug = courseSlugOrCategorySlug;
  let page = requestedPage;

  if (
    categorySlugOrPage &&
    typeof categorySlugOrPage === "string" &&
    isNaN(Number(categorySlugOrPage))
  ) {
    courseSlug = courseSlugOrCategorySlug;
    categorySlug = categorySlugOrPage;
  } else if (categorySlugOrPage) {
    page = Number(categorySlugOrPage) || 1;
  }

  const data = await getPublicInterviewCategory(courseSlug, categorySlug, page);
  if (!data?.category) {
    return {
      title: "Interview Questions Not Found",
      robots: { index: false, follow: false },
    };
  }

  const { category, pagination } = data;
  const targetCourseSlug = category.course?.slug || courseSlug;
  const pageNum = Math.max(Number(page) || 1, 1);
  const categoryName = category.name;
  const courseTitle = category.course?.title
    ? ` - ${category.course.title}`
    : "";
  const title = `${category.seoTitle || `${categoryName} Interview Questions and Answers${courseTitle}`}${pageNum > 1 ? ` - Page ${pageNum}` : ""}`;
  const description =
    category.seoDescription ||
    category.description ||
    `Prepare for ${categoryName} interviews with ${pagination?.total || "detailed"} questions, clear answers, code examples, and follow-up prompts.`;
  const path = targetCourseSlug
    ? `/${encodeURIComponent(targetCourseSlug)}/interview-questions/${encodeURIComponent(category.slug || categorySlug)}${pageNum > 1 ? `?page=${pageNum}` : ""}`
    : `/interview-questions/${encodeURIComponent(category.slug || categorySlug)}${pageNum > 1 ? `?page=${pageNum}` : ""}`;
  const canonical = absoluteUrl(category.canonicalUrl || "", path);

  return {
    title,
    description,
    keywords: category.keywords?.length
      ? category.keywords
      : [
          `${categoryName} interview questions`,
          `${categoryName} interview answers`,
          `${categoryName} interview preparation`,
          `frontend interview`,
          `asif.to interview guide`,
        ],
    alternates: { canonical },
    robots: {
      index: !category.noindex,
      follow: !category.nofollow,
      googleBot: {
        index: !category.noindex,
        follow: !category.nofollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: category.ogTitle || title,
      description: category.ogDescription || description,
      url: canonical,
      type: "article",
      siteName: "asif.to",
      ...(category.ogImage ? { images: [category.ogImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: category.twitterTitle || title,
      description: category.twitterDescription || description,
      ...(category.twitterImage || category.ogImage
        ? { images: [category.twitterImage || category.ogImage] }
        : {}),
    },
  };
}

export default async function CategoryInterviewGuide({
  courseSlug: passedCourseSlug,
  categorySlug,
  requestedPage = 1,
}) {
  const page = Math.max(Number(requestedPage) || 1, 1);
  const data = await getPublicInterviewCategory(
    passedCourseSlug,
    categorySlug,
    page,
  );
  const category = data?.category;
  const questions = data?.questions || [];
  const questionIndex = data?.questionIndex || [];
  const pagination = data?.pagination || {
    page: 1,
    pages: 1,
    total: 0,
    limit: 15,
  };

  const course = category?.course;
  const courseSlug = course?.slug || passedCourseSlug;
  const canonicalSlug = category?.slug || categorySlug;
  const basePath = courseSlug
    ? `/${encodeURIComponent(courseSlug)}/interview-questions/${encodeURIComponent(canonicalSlug)}`
    : `/interview-questions/${encodeURIComponent(canonicalSlug)}`;
  const firstNumber = (pagination.page - 1) * pagination.limit + 1;

  const relatedData = await getRelatedContent({
    type: "category",
    categorySlug: canonicalSlug,
    courseSlug: courseSlug,
  });

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

  const categoryTitle =
    category?.seoTitle ||
    `${category?.name || categorySlug} Interview Questions and Answers`;

  const structuredData = category
    ? {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "FAQPage",
            "@id": `${absoluteUrl("", basePath)}#questions`,
            name: categoryTitle,
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
              ...(course
                ? [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: course.title,
                      item: absoluteUrl(
                        "",
                        `/courses/${encodeURIComponent(course.slug)}`,
                      ),
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: "Interview Questions",
                      item: absoluteUrl(
                        "",
                        `/${encodeURIComponent(course.slug)}/interview-questions`,
                      ),
                    },
                    {
                      "@type": "ListItem",
                      position: 4,
                      name: category.name,
                      item: absoluteUrl("", basePath),
                    },
                  ]
                : [
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: "Interview Questions",
                      item: absoluteUrl("", "/interview-questions"),
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: category.name,
                      item: absoluteUrl("", basePath),
                    },
                  ]),
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
      <main className="mx-auto min-w-0 w-full max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href={
              courseSlug
                ? `/${encodeURIComponent(courseSlug)}/interview-questions`
                : "/interview-questions"
            }
            className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />{" "}
            {course
              ? `All ${course.title} Questions`
              : "All Interview Categories"}
          </Link>
          {course && (
            <Link
              href={`/courses/${encodeURIComponent(course.slug)}`}
              className="inline-flex items-center gap-1.5 font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
            >
              <BookOpen className="h-4 w-4 text-blue-500" /> Course Syllabus
            </Link>
          )}
        </div>

        {/* Purpose-Built Hero Section */}
        <header className="mt-5 min-w-0 max-w-full overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-4xl sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 dark:text-orange-400">
            Interview Preparation Guide
          </p>
          <h1 className="mt-3 max-w-4xl wrap-break-word text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {categoryTitle}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base sm:leading-7">
            {category?.description ||
              `Master ${category?.name || "technical"} interviews with comprehensive questions, clear explanations, code examples, and follow-up discussion points.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs sm:text-sm">
            <span className="rounded-full bg-zinc-100 px-3.5 py-1.5 font-semibold dark:bg-zinc-800">
              {pagination.total} questions
            </span>
            <span className="rounded-full bg-orange-50 px-3.5 py-1.5 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              Easy to advanced
            </span>
            <span className="rounded-full bg-blue-50 px-3.5 py-1.5 font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Collapsible answers & code
            </span>
          </div>
        </header>

        {/* Custom Rich Text Intro Section (if provided) */}
        {category?.content && (
          <section className="mt-6 py-6 text-justify sm:py-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              <Sparkles className="h-4 w-4" /> Topic Overview & Study Roadmap
            </div>
            <div className="prose prose-zinc mt-4 max-w-none dark:prose-invert text-sm sm:text-base">
              <InterviewAnswer content={category.content} />
            </div>
          </section>
        )}

        {!category || questions.length === 0 ? (
          <div className="mt-8 rounded-4xl border border-zinc-200 bg-white p-12 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <HelpCircle className="mx-auto mb-3 h-10 w-10 text-zinc-400" />
            Interview questions for this category are coming soon.
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
            <div className="mt-6 grid w-full min-w-0 max-w-full items-start gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section
                className="w-full min-w-0 max-w-full space-y-6"
                aria-label="Interview questions and answers"
              >
                <InterviewQuestionList
                  questions={questions}
                  firstNumber={firstNumber}
                  basePath={basePath}
                  indexedQuestionsMap={Object.fromEntries(indexedQuestions)}
                />
                <Pagination pagination={pagination} basePath={basePath} />
                <RelatedContentBottom relatedData={relatedData} />
              </section>
              <div className="hidden lg:sticky lg:top-24 lg:block lg:space-y-6">
                <nav
                  aria-label="Questions on this page"
                  className="rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-center gap-2 border-b border-zinc-100 px-2 pb-3 text-xs font-black uppercase tracking-wider text-foreground dark:border-zinc-800">
                    <List className="h-4 w-4 text-orange-500" /> Questions on
                    this page
                  </div>
                  <ol className="mt-2 max-h-[30vh] space-y-1 overflow-y-auto pr-1">
                    {questions.map((item, index) => {
                      const number = firstNumber + index;
                      return (
                        <li key={item._id}>
                          <a
                            href={`#question-${number}`}
                            className="flex gap-2.5 rounded-xl px-2 py-2 text-xs leading-5 text-zinc-600 transition-colors hover:bg-orange-50 hover:text-orange-800 dark:text-zinc-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-200"
                          >
                            <span className="font-black text-orange-500">
                              {number}
                            </span>
                            <span className="line-clamp-1">
                              {item.question}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
                <RelatedContentSidebar relatedData={relatedData} />
              </div>
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
