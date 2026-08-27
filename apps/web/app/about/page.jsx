import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Compass,
  UserRound,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "About asif.to — Practical Full-Stack JavaScript Learning",
  description:
    "Learn why asif.to exists, who creates and maintains it, and how its programming tutorials are researched, tested, written, reviewed, and updated.",
  alternates: { canonical: absoluteUrl("", "/about") },
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
};

const principles = [
  [
    "Accuracy",
    "Prefer primary documentation and behavior verified in working code. State prerequisites and limitations instead of hiding them.",
  ],
  [
    "Clarity",
    "Explain one idea at a time, define the context, and make the path from concept to implementation easy to follow.",
  ],
  [
    "Practical examples",
    "Use examples that demonstrate how a feature behaves inside an application, not isolated syntax without context.",
  ],
  [
    "No unnecessary filler",
    "Keep supporting detail when it improves understanding and remove repetition that slows readers down.",
  ],
];
const process = [
  "Research primary documentation",
  "Implement the example",
  "Run and test relevant code",
  "Write the explanation",
  "Review for clarity and consistency",
  "Update when behavior changes",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28">
        <nav className="mb-7 flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Link href="/">Home</Link>
          <span>/</span>
          <span className="text-zinc-700 dark:text-zinc-200">About</span>
          <span>/</span>
          <Link href="/author/asif" className="hover:text-blue-600">
            Author
          </Link>
        </nav>
        <section className="max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-600">
            <Compass className="h-4 w-4" />
            About asif.to
          </p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Programming concepts made easier to understand, practice, and
            revisit.
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-500 dark:text-zinc-400">
            asif.to is a Full-Stack JavaScript learning site with step-by-step
            courses, chapters, articles, cheatsheets, quizzes, interview
            preparation, and revision tools. It was created to bring practical
            explanations and repeatable practice into one focused learning
            experience.
          </p>
        </section>
        <section className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              BookOpen,
              "What it is",
              "A structured library for learning and revisiting JavaScript, React, Next.js, Node.js, Express, MongoDB, and related application-development concepts.",
            ],
            [
              UserRound,
              "Who it is for",
              "Learners and working developers who want direct explanations, usable examples, and convenient tools for practice and revision.",
            ],
            [
              Code2,
              "Why it exists",
              "To reduce the gap between reading about a programming concept and understanding how it behaves in a real implementation.",
            ],
          ].map(([Icon, title, text]) => (
            <div
              key={title}
              className="rounded-4xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Icon className="h-6 w-6 text-blue-600" />
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-500">{text}</p>
            </div>
          ))}
        </section>
        <section className="mt-10 rounded-[2.5rem] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-10">
          <p className="text-[11px] font-black uppercase tracking-[.2em] text-blue-600">
            Trust and methodology
          </p>
          <h2 className="mt-2 text-3xl font-black">How content is created</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-500">
            Content begins with the relevant primary documentation and a
            concrete implementation. Examples are run or checked in the project
            context before the explanation is finalized. Review focuses on
            whether the code and prose agree, whether prerequisites are clear,
            and whether the page needs revision as the underlying technology
            changes.
          </p>
          <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-3xl bg-zinc-50 p-4 text-sm font-bold dark:bg-zinc-950"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-600 text-xs text-white">
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </section>
        <section className="mt-10">
          <h2 className="text-3xl font-black">Editorial principles</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {principles.map(([title, text]) => (
              <div
                key={title}
                className="flex gap-3 rounded-4xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <h3 className="font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mt-10 rounded-[2.5rem] bg-blue-600 p-7 text-white sm:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-100">
            Who maintains the website
          </p>
          <h2 className="mt-3 text-3xl font-black">
            asif.to is built and maintained by Asif Imam.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-blue-100">
            The same development work that powers the public site, admin tools,
            APIs, database models, learning features, analytics, and publishing
            workflow informs the technical context behind the tutorials.
          </p>
          <Link
            href="/author/asif"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black text-blue-700"
          >
            Meet Asif and read the methodology
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
