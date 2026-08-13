"use client";

import React from "react";
import Link from "next/link";
import { TECH_STACKS } from "@/lib/tutorialData";
import {
  Zap,
  Code2,
  Server,
  Layers,
  Database,
  GitBranch,
  FileCode,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const ICON_MAP = {
  Zap,
  Code2,
  Server,
  Layers,
  Database,
  GitBranch,
  FileCode,
  ShieldCheck,
  Sparkles,
};

export default function TechStackGrid({
  selectedTech,
  onSelectTech,
  activeTechIds = [],
  courses = [],
  isLoading = false,
}) {
  const visibleTechStacks = TECH_STACKS.filter((tech) =>
    activeTechIds.includes(tech.id),
  );

  if (!isLoading && visibleTechStacks.length === 0) return null;

  return (
    <section className="w-full my-2 sm:my-4 min-w-0">
      <div className="flex items-center justify-between mb-3.5">
        <div className="min-w-0">
          <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-foreground truncate">
            Technologies & Frameworks
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            Click any stack to view course syllabus & index
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 min-w-0">
        {isLoading
          ? [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-sm animate-pulse"
              />
            ))
          : visibleTechStacks.map((tech) => {
              const IconComponent = ICON_MAP[tech.icon] || Code2;
              const matchingCourse = courses.find((c) => c.techId === tech.id);
              const courseSlug = matchingCourse?.slug || tech.id;

              return (
                <Link
                  key={tech.id}
                  href={`/courses/${courseSlug}`}
                  className="group relative flex flex-col justify-between text-left p-3.5 sm:p-5 rounded-3xl bg-white dark:bg-zinc-900/90 shadow-xs hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-800/90 transition-all duration-300 active:scale-[0.98] border border-zinc-200/60 dark:border-zinc-800/60 min-w-0 overflow-hidden min-h-[160px] sm:min-h-[175px]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-2.5">
                      <div
                        className={`p-2 sm:p-2.5 rounded-2xl bg-gradient-to-br ${tech.color} text-white shadow-sm shrink-0`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 truncate max-w-[50%]">
                        {tech.name}
                      </span>
                    </div>
                    <h3 className="font-black text-xs sm:text-sm tracking-tight text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {tech.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                      {tech.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/60 pt-2">
                    <span className="truncate">{tech.category}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-blue-600 dark:text-blue-400 shrink-0" />
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
