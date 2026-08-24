import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock,
  Hash,
  Layers3,
  Tag,
} from "lucide-react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import TopicMarkdown from "@/components/articles/TopicMarkdown";
import AuthorIdentityCard from "@/components/authors/AuthorIdentityCard";
import { getPublicTopic } from "@/lib/publicContent";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import { getImageUrl } from "@/lib/config";

const siteUrl = getSiteUrl();

function pathForTopic(courseSlug, topic) {
  const segments = [courseSlug];
  if (
    topic?.type === "interview" &&
    topic.category?.slug &&
    topic.category.slug !== topic.slug
  ) {
    segments.push(topic.category.slug);
  }
  segments.push(topic.slug);
  return `/${segments.map(encodeURIComponent).join("/")}`;
}

function questionAnchor(question, index) {
  const id = String(question?._id || "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
  return `question-${id || index + 1}`;
}

function estimateReadingTime(topic, questions) {
  const text = [
    topic.title,
    topic.excerpt,
    topic.content,
    ...questions.flatMap((question) => [question.question, question.answer]),
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/<[^>]*>|[`#*_>[\]()!-]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function structuredData(courseSlug, topic, questions) {
  const canonical =
    topic.canonicalUrl || `${siteUrl}${pathForTopic(courseSlug, topic)}`;
  const graph = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: topic.course.title,
          item: `${siteUrl}/courses/${encodeURIComponent(courseSlug)}`,
        },
        ...(topic.category?.name
          ? [
              {
                "@type": "ListItem",
                position: 3,
                name: topic.category.name,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: topic.category?.name ? 4 : 3,
          name: topic.title,
          item: canonical,
        },
      ],
    },
  ];

  if (topic.type === "interview" && questions.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: questions.map((question) => ({
        "@type": "Question",
        name: question.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: question.answer,
        },
      })),
    });
  } else {
    graph.push({
      "@type": ["Article", "LearningResource"],
      "@id": `${canonical}#topic`,
      name: topic.title,
      headline: topic.seoTitle || topic.title,
      description: topic.seoDescription || topic.excerpt,
      url: canonical,
      datePublished: topic.publishedAt || undefined,
      dateModified: topic.updatedAt || undefined,
      learningResourceType: "Tutorial",
      isPartOf: {
        "@type": "Course",
        name: topic.course.title,
        url: `${siteUrl}/courses/${encodeURIComponent(courseSlug)}`,
      },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export async function buildTopicMetadata(courseSlug, topicPath) {
  const topic = await getPublicTopic(courseSlug, topicPath);

  if (!topic) {
    return {
      title: "Topic Not Found | asif.to",
      robots: { index: false, follow: false },
    };
  }

  const title = topic.seoTitle || topic.title;
  const description = topic.seoDescription || topic.excerpt;
  const canonical =
    topic.canonicalUrl || `${siteUrl}${pathForTopic(courseSlug, topic)}`;
  const nestedImageParams = new URLSearchParams({ course: courseSlug });
  topicPath.forEach((segment) => nestedImageParams.append("path", segment));
  const image = absoluteUrl(
    "",
    topicPath.length > 1
      ? `/topic-opengraph-image?${nestedImageParams.toString()}`
      : `${pathForTopic(courseSlug, topic)}/opengraph-image`,
  );

  return {
    title,
    description,
    keywords: topic.keywords || [],
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
      type: "article",
      publishedTime: topic.publishedAt || undefined,
      modifiedTime: topic.updatedAt || undefined,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${topic.title} | ${topic.course?.title || "asif.to"}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function TopicLink({ topic, courseSlug, direction }) {
  if (!topic) return <div className="hidden sm:block" />;

  const isPrevious = direction === "previous";
  const Icon = isPrevious ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={pathForTopic(courseSlug, topic)}
      className={`group flex min-w-0 items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-blue-700 ${
        isPrevious ? "justify-start" : "justify-end text-right"
      }`}
    >
      {isPrevious && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase text-zinc-400">
          {isPrevious ? "Previous topic" : "Next topic"}
        </span>
        <span className="mt-1 block truncate text-sm font-bold text-zinc-900 group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
          {topic.title}
        </span>
      </span>
      {!isPrevious && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:bg-blue-950/50 dark:group-hover:text-blue-400">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}

function QuestionIndex({ questions, titleId }) {
  if (!questions.length) return null;

  return (
    <nav aria-labelledby={titleId}>
      <div className="flex items-center gap-2">
        <CircleHelp className="h-4 w-4 text-blue-500" aria-hidden="true" />
        <h2 id={titleId} className="text-sm font-extrabold">
          Questions in this guide
        </h2>
      </div>
      <ol className="mt-4 space-y-1.5">
        {questions.map((question, index) => (
          <li key={question._id}>
            <a
              href={`#${question.anchorId}`}
              className="group flex gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-blue-50 hover:text-blue-700 dark:text-zinc-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-300"
            >
              <span className="font-bold text-zinc-400 group-hover:text-blue-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="line-clamp-2 font-medium leading-5">
                {question.question}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function ChapterIndex({ chapters, courseSlug, titleId }) {
  if (!chapters?.length) return null;

  return (
    <nav aria-labelledby={titleId}>
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-emerald-500" aria-hidden="true" />
        <h2 id={titleId} className="text-sm font-extrabold">
          Course Chapters
        </h2>
      </div>
      <ol className="mt-4 space-y-1.5">
        {chapters.map((chapter, index) => (
          <li key={chapter._id}>
            <Link
              href={`/${encodeURIComponent(courseSlug)}/${encodeURIComponent(chapter.slug)}`}
              className="group flex gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
            >
              <span className="font-bold text-zinc-400 group-hover:text-emerald-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="line-clamp-2 font-medium leading-5">
                {chapter.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function InterviewQuestions({ questions }) {
  return (
    <section className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
      {questions.map((question, index) => (
        <article
          key={question._id}
          id={question.anchorId}
          className="scroll-mt-28 py-8 first:pt-2 sm:py-10"
        >
          <div className="flex items-start gap-3 sm:gap-5">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm shadow-blue-500/20">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold capitalize text-zinc-500 dark:text-zinc-400">
                {question.difficulty && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    {question.difficulty}
                  </span>
                )}
                {question.questionType && (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 dark:bg-zinc-800">
                    {question.questionType}
                  </span>
                )}
                {(question.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2.5 py-1 dark:border-zinc-700"
                  >
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mt-4 font-outfit text-xl font-bold leading-8 text-zinc-950 sm:text-2xl dark:text-white">
                <a
                  href={`#${question.anchorId}`}
                  className="group inline-flex gap-2"
                >
                  {question.question}
                  <Hash
                    className="mt-2 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60"
                    aria-hidden="true"
                  />
                </a>
              </h2>
              <div className="mt-6">
                <TopicMarkdown content={question.answer} />
              </div>
              {question.codeExample && (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Code example
                  </h3>
                  <pre className="overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-sm leading-6 text-zinc-100">
                    <code>{question.codeExample}</code>
                  </pre>
                </div>
              )}
              {question.expectedOutput && (
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Expected output
                  </h3>
                  <pre className="overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-100 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <code>{question.expectedOutput}</code>
                  </pre>
                </div>
              )}
              {question.followUps?.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Follow-up questions
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-600 dark:text-zinc-400">
                    {question.followUps.map((followUp) => (
                      <li key={followUp}>{followUp}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

export default async function CourseTopicPage({ courseSlug, topicPath }) {
  const topic = await getPublicTopic(courseSlug, topicPath);
  if (!topic) notFound();

  const canonicalPath = pathForTopic(courseSlug, topic);
  const currentPath = `/${[courseSlug, ...topicPath]
    .map(encodeURIComponent)
    .join("/")}`;
  if (currentPath !== canonicalPath) redirect(canonicalPath);

  const questions = (topic.interviewQuestions || []).map((question, index) => ({
    ...question,
    anchorId: questionAnchor(question, index),
  }));
  const jsonLd = structuredData(courseSlug, topic, questions);
  const readingMinutes = estimateReadingTime(topic, questions);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header />

      <main className="mx-auto w-full max-w-7xl px-3 pb-24 pt-20 sm:px-6 sm:pt-24 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 overflow-x-auto px-1 sm:mb-7"
        >
          <ol className="flex min-w-max items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <li>
              <Link
                href="/"
                className="hover:text-zinc-900 dark:hover:text-white"
              >
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </li>
            <li>
              <Link
                href={`/courses/${encodeURIComponent(courseSlug)}`}
                className="hover:text-zinc-900 dark:hover:text-white"
              >
                {topic.course.title}
              </Link>
            </li>
            {topic.type === "interview" && topic.category?.name && (
              <>
                <li>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </li>
                <li className="text-zinc-700 dark:text-zinc-300">
                  {topic.category.name}
                </li>
              </>
            )}
            <li>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </li>
            <li className="max-w-64 truncate text-zinc-800 dark:text-zinc-200">
              {topic.title}
            </li>
          </ol>
        </nav>

        <header className="py-2 sm:py-6 lg:py-8">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2.5 text-xs font-bold">
              <Link
                href={`/courses/${encodeURIComponent(courseSlug)}`}
                className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70"
              >
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {topic.course.title}
              </Link>
              {topic.category?.name && (
                <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {topic.category.name}
                </span>
              )}
              <span className="rounded-full border border-zinc-200 px-3 py-1.5 capitalize text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                {topic.type === "interview"
                  ? "Interview guide"
                  : "Learning guide"}
              </span>
            </div>
            <h1 className="max-w-5xl font-outfit text-3xl font-black leading-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
              {topic.title}
            </h1>
            {topic.excerpt && (
              <p className="mt-5 max-w-4xl text-sm font-medium leading-7 text-zinc-600 sm:text-lg sm:leading-8 dark:text-zinc-300">
                {topic.excerpt}
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-zinc-200/80 pt-5 text-xs font-semibold text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" aria-hidden="true" />
                {readingMinutes} min read
              </span>
              {questions.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <CircleHelp
                    className="h-4 w-4 text-amber-500"
                    aria-hidden="true"
                  />
                  {questions.length} questions
                </span>
              )}
              {topic.relatedTopics?.length > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Layers3
                    className="h-4 w-4 text-emerald-500"
                    aria-hidden="true"
                  />
                  {topic.relatedTopics.length} related topics
                </span>
              )}
            </div>
          </div>
        </header>

        {topic.image && (
          <div className="mb-10 lg:mb-12">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-100 dark:bg-zinc-900 shadow-sm border border-zinc-200/70 dark:border-zinc-800">
              <Image
                src={getImageUrl(topic.image)}
                alt={topic.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        )}

        {questions.length > 0 && (
          <div className="mt-6 lg:hidden">
            <QuestionIndex
              questions={questions}
              titleId="mobile-question-index-title"
            />
          </div>
        )}

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="min-w-0">
            {topic.content && (
              <div className="pb-8">
                <TopicMarkdown content={topic.content} />
              </div>
            )}

            {questions.length > 0 && (
              <InterviewQuestions questions={questions} />
            )}
            <div className="mt-8 border-t border-zinc-200/80 pt-8 dark:border-zinc-800/80">
              <AuthorIdentityCard
                author={topic.author || topic.course?.author}
                publishedAt={topic.createdAt}
                updatedAt={topic.updatedAt}
                compact
              />
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 pt-2">
              {questions.length > 0 && (
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <QuestionIndex
                    questions={questions}
                    titleId="desktop-question-index-title"
                  />
                </div>
              )}
              {topic.courseChapters?.length > 0 && (
                <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <ChapterIndex
                    chapters={topic.courseChapters}
                    courseSlug={courseSlug}
                    titleId="desktop-chapter-index-title"
                  />
                </div>
              )}
              <Link
                href={`/courses/${encodeURIComponent(courseSlug)}`}
                className="group flex items-center justify-between gap-3 py-4 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span>
                  <span className="block text-[11px] font-bold uppercase text-zinc-400">
                    Continue learning
                  </span>
                  <span className="mt-1 block text-sm font-bold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    View course index
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-400 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </aside>
        </div>

        <nav
          aria-label="Topic navigation"
          className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <TopicLink
            topic={topic.previousTopic}
            courseSlug={courseSlug}
            direction="previous"
          />
          <TopicLink
            topic={topic.nextTopic}
            courseSlug={courseSlug}
            direction="next"
          />
        </nav>

        {topic.relatedTopics?.length > 0 && (
          <section className="mt-12" aria-labelledby="related-topics-title">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Layers3 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id="related-topics-title"
                  className="font-outfit text-xl font-black sm:text-2xl"
                >
                  Keep exploring
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Related guides from {topic.course.title}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {topic.relatedTopics.map((related) => (
                <Link
                  key={related._id}
                  href={pathForTopic(courseSlug, related)}
                  className="group flex min-h-36 flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:hover:border-emerald-700"
                >
                  <div>
                    <h3 className="font-bold text-zinc-900 group-hover:text-emerald-700 dark:text-zinc-100 dark:group-hover:text-emerald-400">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {related.excerpt}
                      </p>
                    )}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Read topic
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
