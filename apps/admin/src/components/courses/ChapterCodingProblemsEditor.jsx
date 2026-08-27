"use client";

import { Code2, Plus, Trash2 } from "lucide-react";

const LANGUAGES = [
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["react", "React.js"],
  ["react-typescript", "React + TypeScript"],
  ["nextjs", "Next.js"],
  ["html", "HTML / CSS / JavaScript"],
  ["python", "Python"],
  ["c", "C"],
  ["cpp", "C++"],
  ["java", "Java"],
];

const emptyProblem = () => ({
  title: "",
  description: "",
  language: "javascript",
  starterCode: "",
  hints: "",
  expectedOutput: "",
});

const fieldClass =
  "w-full rounded-2xl border-0 bg-zinc-100 px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-2 dark:bg-zinc-900";

export default function ChapterCodingProblemsEditor({ problems = [], onChange }) {
  const update = (index, key, value) => {
    onChange(
      problems.map((problem, problemIndex) =>
        problemIndex === index ? { ...problem, [key]: value } : problem,
      ),
    );
  };

  return (
    <section className="space-y-5 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold">Chapter coding problems</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add focused exercises with clear starter code. Learners solve them in the simplified chapter editor.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...problems, emptyProblem()])}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add problem
        </button>
      </div>

      {!problems.length && (
        <div className="rounded-3xl border border-dashed border-zinc-300 p-6 text-center text-sm text-muted-foreground dark:border-zinc-700">
          No coding problems yet. Add one when learners should practise this chapter with code.
        </div>
      )}

      {problems.map((problem, index) => (
        <div key={index} className="space-y-4 rounded-3xl bg-zinc-50 p-4 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Problem {index + 1}</h3>
            <button
              type="button"
              onClick={() => onChange(problems.filter((_, problemIndex) => problemIndex !== index))}
              className="rounded-full p-2 text-red-500 hover:bg-red-500/10"
              aria-label={`Remove problem ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px]">
            <label className="space-y-1.5 text-xs font-semibold">
              Problem title
              <input
                value={problem.title || ""}
                onChange={(event) => update(index, "title", event.target.value)}
                placeholder="Render your first React component"
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold">
              Language
              <select
                value={problem.language || "javascript"}
                onChange={(event) => update(index, "language", event.target.value)}
                className={fieldClass}
              >
                {LANGUAGES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1.5 text-xs font-semibold">
            Learner instructions
            <textarea
              rows={3}
              value={problem.description || ""}
              onChange={(event) => update(index, "description", event.target.value)}
              placeholder="Explain the task in small, beginner-friendly steps."
              className={fieldClass}
            />
          </label>
          <label className="block space-y-1.5 text-xs font-semibold">
            Starter code
            <textarea
              rows={10}
              spellCheck={false}
              value={problem.starterCode || ""}
              onChange={(event) => update(index, "starterCode", event.target.value)}
              placeholder="Add only the code learners need to begin. Avoid unrelated boilerplate."
              className={`${fieldClass} font-mono`}
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5 text-xs font-semibold">
              Hints (one per line)
              <textarea
                rows={4}
                value={problem.hints || ""}
                onChange={(event) => update(index, "hints", event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="space-y-1.5 text-xs font-semibold">
              Expected output
              <textarea
                rows={4}
                value={problem.expectedOutput || ""}
                onChange={(event) => update(index, "expectedOutput", event.target.value)}
                placeholder="Optional example of the expected UI or console output"
                className={`${fieldClass} font-mono`}
              />
            </label>
          </div>
        </div>
      ))}
    </section>
  );
}
