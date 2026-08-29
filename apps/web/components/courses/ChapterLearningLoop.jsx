"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Code2,
  Layers,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";

import RevisionFlashcards from "@/components/home/RevisionFlashcards";
import InteractiveCode from "@/components/interactive-code";
import { runnableLanguage } from "@/components/interactive-code/CodePlaygroundModal";
import { useGetQuizQuestionsQuery, useSubmitPracticeQuizMutation } from "@/lib/api/courseApi";

const FLOW = [
  ["learn", "Learn", BookOpen],
  ["practice", "Practice", Code2],
  ["revise", "Revise", Layers],
  ["build", "Build", Sparkles],
];

const stageDone = (stage, progress) => {
  const value = progress?.stages?.[stage] || {};
  return Boolean(value.completed) || Number(value.score) >= 70;
};

function starterCode(language, chapterTitle) {
  const title = String(chapterTitle || "this chapter");
  const detected = runnableLanguage(language);

  if (detected === "python") {
    return `# Build your solution for: ${title}\n\ndef solution():\n    # Add your code here\n    pass\n\nsolution()`;
  }
  if (detected === "c") {
    return `#include <stdio.h>\n\nint main(void) {\n    // Build your solution for: ${title}\n    printf("Start coding!\\n");\n    return 0;\n}`;
  }
  if (detected === "cpp") {
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Build your solution for: ${title}\n    cout << "Start coding!" << endl;\n    return 0;\n}`;
  }
  if (detected === "java") {
    return `public class Main {\n    public static void main(String[] args) {\n        // Build your solution for: ${title}\n        System.out.println("Start coding!");\n    }\n}`;
  }
  if (["react", "react-typescript", "nextjs"].includes(detected)) {
    return `export default function App() {\n  return (\n    <main>\n      <h1>${title}</h1>\n      {/* Build your solution here */}\n    </main>\n  );\n}`;
  }
  if (["html", "css"].includes(detected)) {
    return `<!doctype html>\n<html>\n  <body>\n    <h1>${title}</h1>\n    <!-- Build your solution here -->\n  </body>\n</html>`;
  }
  return `// Build your solution for: ${title}\nfunction solution() {\n  // Add your code here\n}\n\nsolution();`;
}

function FlowStep({ stage, label, Icon, progress }) {
  const complete = stageDone(stage, progress);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${
          complete
            ? "bg-emerald-500 text-white"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        }`}
      >
        {complete ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>
      <span className="truncate text-[11px] font-black">{label}</span>
    </div>
  );
}

function Accordion({ id, icon: Icon, eyebrow, title, summary, done, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800/80 first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-content`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:opacity-80"
      >
        <span
          className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl ${
            done
              ? "bg-emerald-500 text-white"
              : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
          }`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
            {eyebrow}
          </span>
          <span className="mt-0.5 block text-xs sm:text-sm font-black text-foreground">{title}</span>
          <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 truncate">
            {summary}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180 text-blue-600" : ""}`}
        />
      </button>
      {open && (
        <div id={`${id}-content`} className="pb-4 pt-1 w-full min-w-0">
          {children}
        </div>
      )}
    </div>
  );
}

function CodeProblem({ chapter, snippets, completed, onComplete }) {
  const build = chapter.learningActivities?.build || {};
  const firstSnippet = snippets.find((item) => String(item?.code || "").trim());
  const configuredProblems = Array.isArray(chapter.codingProblems)
    ? chapter.codingProblems.filter((problem) => problem?.title)
    : [];
  const problems = configuredProblems.length
    ? configuredProblems
    : [
        {
          title: build.title || "Chapter coding problem",
          description:
            build.description ||
            chapter.tryItChallenge ||
            `Create a small example that applies the main idea from ${chapter.title}.`,
          language:
            firstSnippet?.language || firstSnippet?.lang || chapter.language,
          starterCode: firstSnippet?.code || "",
          hints: [],
          expectedOutput: "",
        },
      ];
  const requirements = Array.isArray(build.requirements) ? build.requirements : [];
  const [checked, setChecked] = useState(() => new Set());
  const ready = requirements.length === 0 || requirements.every((_, index) => checked.has(index));

  const toggleRequirement = (index) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div>
      <div className="space-y-5">
        {problems.map((problem, problemIndex) => {
          const language = runnableLanguage(
            problem.language || chapter.language || "javascript",
            problem.starterCode || "",
          );
          const code =
            problem.starterCode || starterCode(language, problem.title);
          const hints = Array.isArray(problem.hints) ? problem.hints : [];

          return (
            <article key={problem._id || `${problem.title}-${problemIndex}`} className="space-y-3">
              <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-950">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black">
                    {problems.length > 1 ? `${problemIndex + 1}. ` : ""}{problem.title}
                  </h3>
                  {Number(build.estimatedMinutes) > 0 && problemIndex === 0 && (
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-black text-blue-600 dark:text-blue-300">
                      About {build.estimatedMinutes} min
                    </span>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-line text-xs leading-6 text-zinc-600 dark:text-zinc-300">
                  {problem.description}
                </p>
                {hints.length > 0 && (
                  <details className="mt-3 rounded-xl border border-zinc-200 px-3 py-2 text-xs dark:border-zinc-800">
                    <summary className="cursor-pointer font-black text-blue-600 dark:text-blue-400">Need a hint?</summary>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-zinc-500">
                      {hints.map((hint, hintIndex) => <li key={`${hint}-${hintIndex}`}>{hint}</li>)}
                    </ul>
                  </details>
                )}
                {problem.expectedOutput && (
                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-zinc-400">Expected output</p>
                    <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-zinc-900 p-3 text-xs text-zinc-100">{problem.expectedOutput}</pre>
                  </div>
                )}
                {problem.solutionCode && (
                  <details className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 px-3 py-2.5 text-xs dark:bg-emerald-950/20 dark:border-emerald-800/40">
                    <summary className="cursor-pointer font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                      <span>View Solution / Answer Code</span>
                      <span className="text-[10px] font-normal text-emerald-600/70 dark:text-emerald-400/70">(Try solving first!)</span>
                    </summary>
                    <div className="mt-2.5 space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Reference Solution:</p>
                      <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-3.5 text-xs text-emerald-300 font-mono leading-relaxed">{problem.solutionCode}</pre>
                    </div>
                  </details>
                )}
              </div>
              <InteractiveCode
                language={language}
                code={code}
                title={problem.title}
                playgroundId={`${chapter.slug}-chapter-problem-${problemIndex + 1}`}
                compact
              />
            </article>
          );
        })}
      </div>

      {requirements.length > 0 && (
        <div className="mt-3 grid gap-2">
          {requirements.map((requirement, index) => {
            const selected = checked.has(index);
            return (
              <button
                key={`${requirement}-${index}`}
                type="button"
                onClick={() => toggleRequirement(index)}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left text-xs font-semibold ${
                  selected
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-500/10"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${selected ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-300"}`}>
                  {selected && <CheckCircle2 className="h-3 w-3" />}
                </span>
                {requirement}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        disabled={!ready || completed}
        onClick={() => onComplete?.()}
        className="mt-4 rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        {completed ? "Build completed ✓" : "Mark coding problem complete"}
      </button>
    </div>
  );
}

function KnowledgeQuiz({ courseSlug, chapter, chapterNumber, onComplete }) {
  const isAuthenticated = useSelector((state) => Boolean(state.auth?.isAuthenticated));
  const { data, isLoading } = useGetQuizQuestionsQuery({
    courseId: courseSlug,
    throughChapterId: chapter._id,
    limit: 100,
  });
  const [saveAttempt] = useSubmitPracticeQuizMutation();
  const questions = data?.data || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  if (isLoading) {
    return <div className="grid min-h-40 place-items-center"><LogoLoader className="h-6 w-6  text-blue-600"  /></div>;
  }

  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-zinc-50 p-5 text-center text-xs font-semibold text-zinc-500 dark:bg-zinc-950">
        No published quiz questions are mapped to the chapters you have learned yet.
      </div>
    );
  }

  const question = questions[index];
  const checkAnswer = () => {
    if (selected === null || answered) return;
    setAnswers((current) => {
      const next = [...current];
      next[index] = selected;
      return next;
    });
    setAnswered(true);
  };

  const finishOrContinue = async () => {
    if (!answered) return;
    if (index + 1 < questions.length) {
      setIndex((value) => value + 1);
      setSelected(null);
      setAnswered(false);
      return;
    }

    const correct = questions.reduce(
      (total, item, questionIndex) =>
        total + (Number(answers[questionIndex]) === Number(item.correctIndex) ? 1 : 0),
      0,
    );
    const percentage = Math.round((correct / questions.length) * 100);
    setResult(percentage);
    await onComplete?.(percentage);

    if (isAuthenticated) {
      try {
        await saveAttempt({
          courseSlug,
          questionIds: questions.map((item) => item._id),
          answers,
        }).unwrap();
        toast.success("Knowledge-check score saved");
      } catch {
        toast.error("Quiz completed, but the score could not be saved");
      }
    }
  };

  if (result !== null) {
    return (
      <div className="rounded-2xl bg-zinc-50 p-6 text-center dark:bg-zinc-950">
        <p className="text-3xl font-black">{result}%</p>
        <p className="mt-2 text-xs text-zinc-500">
          {result >= 70 ? "Great work — checkpoint complete." : "Review the material and try again. A score of 70% completes this checkpoint."}
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setSelected(null);
            setAnswered(false);
            setAnswers([]);
            setResult(null);
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-[11px] font-black dark:border-zinc-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-600 dark:text-blue-400">
          Question {index + 1} of {questions.length}
        </p>
        <span className="text-[10px] font-bold text-zinc-400">Covers chapters 1–{chapterNumber}</span>
      </div>
      <h3 className="mt-4 text-base font-black sm:text-lg">{question.question}</h3>
      <div className="mt-5 grid gap-2">
        {(question.options || []).map((option, optionIndex) => {
          const chosen = selected === optionIndex;
          const correct = answered && Number(optionIndex) === Number(question.correctIndex);
          const wrong = answered && chosen && !correct;
          return (
            <button
              key={`${option}-${optionIndex}`}
              type="button"
              disabled={answered}
              onClick={() => setSelected(optionIndex)}
              className={`flex items-start gap-3 rounded-2xl border p-3 text-left text-xs font-semibold ${
                correct
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                  : wrong
                    ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                    : chosen
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[10px] font-black dark:bg-zinc-900">
                {correct ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : wrong ? <XCircle className="h-3.5 w-3.5 text-red-600" /> : String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="leading-5">{option}</span>
            </button>
          );
        })}
      </div>
      {answered && question.explanation && (
        <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200">
          {question.explanation}
        </div>
      )}
      <div className="mt-5 flex justify-end">
        {!answered ? (
          <button type="button" disabled={selected === null} onClick={checkAnswer} className="rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white disabled:opacity-40">
            Check answer
          </button>
        ) : (
          <button type="button" onClick={finishOrContinue} className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-5 py-2.5 text-[11px] font-black text-white">
            {index + 1 === questions.length ? "Finish quiz" : "Next question"}
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function ChapterLearningLoop({
  courseSlug,
  chapter,
  chapterIndex = 0,
  standaloneSnippets = [],
  progress,
  onStageComplete,
}) {
  const chapterKey = String(chapter?._id || chapter?.slug || "chapter");
  const counts = chapter?.learningAvailability || {};
  const revisionDone = stageDone("revise", progress);
  const practiceDone = stageDone("practice", progress);
  const buildDone = stageDone("build", progress);
  const flow = useMemo(() => FLOW, []);

  if (!chapter) return null;

  return (
    <section
      id="chapter-learning-loop"
      className="scroll-mt-28 my-8 border-t border-b border-zinc-200 dark:border-zinc-800/80 py-6 w-full min-w-0"
    >
      {/* Flat Section Header */}
      <div className="pb-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              Chapter Activities
            </p>
            <h2 className="mt-0.5 text-lg sm:text-xl font-black text-foreground">
              Chapter Practice & Learning Loop
            </h2>
            <p className="mt-0.5 text-xs font-medium leading-relaxed text-zinc-500 dark:text-zinc-400">
              Interactive flashcards, hands-on coding challenges, and knowledge checks.
            </p>
          </div>
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600 dark:text-blue-400 shrink-0">
            {progress?.masteryScore || 0}% mastery
          </span>
        </div>

        {/* Step Flow Bar */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {flow.map(([stage, label, Icon]) => (
            <FlowStep
              key={stage}
              stage={stage}
              label={label}
              Icon={Icon}
              progress={progress}
            />
          ))}
        </div>
      </div>

      {/* Flat Inner Activity Accordions */}
      <div className="mt-2 space-y-0">
        <Accordion
          key={`${chapterKey}-flashcards`}
          id={`${chapterKey}-flashcards`}
          icon={Layers}
          eyebrow="Revise"
          title="Chapter flashcards"
          summary={`${Number(counts.reviseCount || 0)} cards mapped to this chapter. Tap to open the revision deck.`}
          done={revisionDone}
        >
          {Number(counts.reviseCount || 0) > 0 ? (
            <RevisionFlashcards
              selectedTech={courseSlug}
              selectedChapterId={chapter._id}
              onDeckComplete={() =>
                onStageComplete?.("revise", { completed: true })
              }
              embedded
            />
          ) : (
            <div className="rounded-2xl bg-zinc-50 p-5 text-center text-xs font-semibold text-zinc-500 dark:bg-zinc-950">
              No flashcards are mapped to this chapter yet.
            </div>
          )}
        </Accordion>

        <Accordion
          key={`${chapterKey}-code-problem`}
          id={`${chapterKey}-code-problem`}
          icon={Code2}
          eyebrow="Practice & build"
          title="Solve the chapter coding problems"
          summary={`${chapter.codingProblems?.length || 1} focused problem${(chapter.codingProblems?.length || 1) === 1 ? "" : "s"}. Edit the starter code and run it here.`}
          done={buildDone}
        >
          <CodeProblem
            chapter={chapter}
            snippets={standaloneSnippets}
            completed={buildDone}
            onComplete={() => onStageComplete?.("build", { completed: true })}
          />
        </Accordion>

        <Accordion
          key={`${chapterKey}-quiz`}
          id={`${chapterKey}-quiz`}
          icon={Brain}
          eyebrow="Knowledge check"
          title="Quiz what you have learned so far"
          summary={`Questions can cover this chapter and every earlier chapter in the course. Best score: ${progress?.stages?.practice?.score || 0}%.`}
          done={practiceDone}
        >
          <KnowledgeQuiz
            courseSlug={courseSlug}
            chapter={chapter}
            chapterNumber={chapterIndex + 1}
            onComplete={(score) =>
              onStageComplete?.("practice", {
                score,
                completed: score >= 70,
              })
            }
          />
        </Accordion>
      </div>
    </section>
  );
}
