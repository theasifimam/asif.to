"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Search, Sparkles } from "lucide-react";
import SaveButton from "@/components/articles/SaveButton";
import { TECH_STACKS } from "@/lib/tutorialData";

function excerpt(content = "") {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 170);
}

export default function CheatsheetsClient({
  initialCourses = [],
  initialCheatsheets = [],
}) {
  const [selectedTech, setSelectedTech] = useState("");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    const query = search.trim().toLowerCase();

    // Map each course to a cheatsheet if it exists in the database
    const list = initialCourses.map((course) => {
      const cheatsheet = initialCheatsheets.find(
        (cs) => cs.techId === course.techId,
      );
      if (cheatsheet) {
        return {
          type: "present",
          id: cheatsheet._id,
          techId: cheatsheet.techId,
          title: cheatsheet.title,
          slug: cheatsheet.slug,
          content: cheatsheet.content,
          seoDescription: cheatsheet.seoDescription,
          keywords: cheatsheet.keywords,
        };
      } else {
        return {
          type: "coming_soon",
          id: `cs-coming-${course._id || course.slug}`,
          techId: course.techId,
          title: `${course.title.replace(/\b(Course|Tutorial)\b/gi, "").trim()} Cheatsheet`,
          slug: null,
          content: "",
          seoDescription: `A comprehensive syntax reference for ${course.title}. Coming soon!`,
          keywords: [],
        };
      }
    });

    // Also include any database cheatsheets that don't match any course's techId
    initialCheatsheets.forEach((cs) => {
      const alreadyAdded = list.some((item) => item.techId === cs.techId);
      if (!alreadyAdded) {
        list.push({
          type: "present",
          id: cs._id,
          techId: cs.techId,
          title: cs.title,
          slug: cs.slug,
          content: cs.content,
          seoDescription: cs.seoDescription,
          keywords: cs.keywords,
        });
      }
    });

    // Filter by selectedTech
    let filtered = list;
    if (selectedTech) {
      filtered = filtered.filter((item) => item.techId === selectedTech);
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter((item) =>
        `${item.title} ${item.content} ${(item.keywords || []).join(" ")}`
          .toLowerCase()
          .includes(query),
      );
    }

    return filtered;
  }, [initialCourses, initialCheatsheets, selectedTech, search]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-24 sm:px-6">
      <nav className="mb-7 flex items-center gap-2 text-xs font-bold text-zinc-400">
        <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-700 dark:text-zinc-200">Cheatsheets</span>
      </nav>
      <section className="overflow-hidden rounded-4xl border border-blue-500/15 bg-linear-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-2xl shadow-blue-600/15 sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Reference guides
        </span>
        <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
          Coding cheatsheets built for fast reading and live practice.
        </h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-blue-100 sm:text-base">
          Each cheatsheet is a focused article with searchable explanations and
          code blocks you can open directly in the interactive editor.
        </p>
      </section>

      <section className="mt-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles, concepts, or code..."
            className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-11 pr-4 text-sm font-semibold shadow-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTech("")}
            className={`rounded-full px-4 py-2 text-xs font-bold ${
              !selectedTech
                ? "bg-blue-600 text-white"
                : "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            All
          </button>
          {TECH_STACKS.map((tech) => (
            <button
              key={tech.id}
              onClick={() => setSelectedTech(tech.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap ${
                selectedTech === tech.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              {tech.name}
            </button>
          ))}
        </div>
      </section>

      {items.length ? (
        <section className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const tech = TECH_STACKS.find((entry) => entry.id === item.techId);
            const isComingSoon = item.type === "coming_soon";

            return (
              <article
                key={item.id}
                className={`group flex min-h-72 flex-col rounded-3xl border p-6 shadow-sm transition ${
                  isComingSoon
                    ? "border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/30 opacity-75"
                    : "border-zinc-200 bg-white hover:-translate-y-1 hover:border-blue-400 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {tech?.name || item.techId}
                  </span>
                  {!isComingSoon ? (
                    <SaveButton
                      itemId={item.id}
                      itemType="cheatsheet"
                      label="Save"
                      size="sm"
                    />
                  ) : (
                    <span className="rounded-full bg-zinc-200/60 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Coming Soon
                    </span>
                  )}
                </div>

                {isComingSoon ? (
                  <FileText className="mt-6 h-7 w-7 text-zinc-400" />
                ) : (
                  <BookOpen className="mt-6 h-7 w-7 text-blue-500" />
                )}

                <h2 className="mt-4 text-xl font-black leading-tight">
                  {item.title}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {item.seoDescription ||
                    excerpt(item.content) ||
                    (isComingSoon
                      ? "Syntax cheatsheet and reference guide coming soon."
                      : "Open this cheatsheet to read the complete reference.")}
                </p>

                {!isComingSoon ? (
                  <Link
                    href={`/cheatsheets/${item.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-blue-600"
                  >
                    Read cheatsheet{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-zinc-400">
                    Coming soon
                  </span>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <FileText className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-3 text-sm font-bold text-zinc-500">
            No cheatsheets match your search.
          </p>
        </div>
      )}
    </main>
  );
}
