import Link from "next/link";
import { ArrowRight, GraduationCap, ListChecks, MessagesSquare } from "lucide-react";

/**
 * "Get ready for this job": free asif.to courses, a practice quiz and interview
 * questions for the skills a posting asks for. Renders nothing for jobs whose
 * skills we have no published content for. Jobs without a taught skill (hospitality,
 * sales, construction...) get the matching role interview guides instead, and
 * render nothing when there is no guide either.
 */
export default function JobLearningPanel({ learning, compact = false }) {
  const items = learning?.items || [];
  const careerGuides = learning?.careerGuides || [];
  if (!items.length) return careerGuides.length ? <CareerGuides guides={careerGuides} compact={compact} /> : null;

  const skillNames = [...new Set(items.flatMap((item) => item.skills))];
  const heading = skillNames.length
    ? `Get ready: ${skillNames.slice(0, 3).join(", ")}${skillNames.length > 3 ? " and more" : ""}`
    : "Get ready for this role";

  return (
    <section
      aria-labelledby="job-learning-heading"
      className={`${compact ? "mt-7" : "mt-2"} rounded-3xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 sm:p-5`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="job-learning-heading" className={`font-outfit font-black ${compact ? "text-base" : "text-xl"}`}>
            {heading}
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            This role asks for skills you can learn, practise and be quizzed on here, for free.
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.course.slug}
            className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/80"
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link href={item.course.href} className="min-w-0 text-sm font-bold leading-snug hover:text-blue-600">
                {item.course.title}
              </Link>
              {item.skills.length > 0 && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Covers {item.skills.join(", ")}
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={item.course.href}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-blue-600 px-3.5 text-xs font-bold text-white transition hover:bg-blue-500"
              >
                Start course <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href={item.quizHref}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-xs font-bold transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700"
              >
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" /> Practice quiz
              </Link>
              <Link
                href={item.interviewHref}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-zinc-200 px-3.5 text-xs font-bold transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-700"
              >
                <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" /> Interview questions
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CareerGuides({ guides, compact }) {
  return (
    <section
      aria-labelledby="job-career-guides-heading"
      className={`${compact ? "mt-7" : "mt-2"} rounded-3xl border border-blue-200/70 bg-blue-50/60 p-4 dark:border-blue-900/50 dark:bg-blue-950/20 sm:p-5`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id="job-career-guides-heading" className={`font-outfit font-black ${compact ? "text-base" : "text-xl"}`}>
            Prepare for the interview
          </h2>
          <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
            Common questions, scenarios and sample answers for roles like this one, free.
          </p>
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {guides.map((guide) => (
          <li
            key={guide.slug}
            className="rounded-2xl border border-zinc-200/80 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900/80"
          >
            <Link href={guide.href} className="text-sm font-bold leading-snug hover:text-blue-600">
              {guide.name} interview questions
            </Link>
            {guide.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600 dark:text-zinc-400">{guide.description}</p>
            )}
            <Link
              href={guide.href}
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-full bg-blue-600 px-3.5 text-xs font-bold text-white transition hover:bg-blue-500"
            >
              <MessagesSquare className="h-3.5 w-3.5" aria-hidden="true" /> {guide.questionCount} questions
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
