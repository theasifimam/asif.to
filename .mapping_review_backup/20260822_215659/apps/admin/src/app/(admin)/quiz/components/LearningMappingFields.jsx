"use client";

// ASIF_QUESTION_LEARNING_MAPPING_V1
import { useEffect, useMemo, useState } from "react";
import { chaptersApi, topicCategoriesApi } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";
const idOf = (value) => String(value?._id || value || "");
const arrayFrom = (response) =>
  [response?.data?.data?.data, response?.data?.data, response?.data].find(Array.isArray) || [];

export default function LearningMappingFields({ courseIds = [], courses = [], value = [], onChange }) {
  const [options, setOptions] = useState({});
  const selected = useMemo(
    () => Array.from(new Set((courseIds || []).map(String).filter(Boolean))),
    [courseIds],
  );
  const mappings = useMemo(
    () => (value || []).map((m) => ({
      course: idOf(m.course),
      category: idOf(m.category),
      chapter: idOf(m.chapter),
      source: m.source || "manual",
      confidence: Number(m.confidence ?? 100),
    })),
    [value],
  );

  useEffect(() => {
    const byCourse = new Map(mappings.map((m) => [m.course, m]));
    const next = selected.map((course) => byCourse.get(course) || {
      course,
      category: "",
      chapter: "",
      source: "manual",
      confidence: 100,
    });
    const a = JSON.stringify(mappings.filter((m) => selected.includes(m.course)).map((m) => [m.course, m.category, m.chapter]));
    const b = JSON.stringify(next.map((m) => [m.course, m.category, m.chapter]));
    if (a !== b) onChange?.(next);
  }, [selected, mappings, onChange]);

  useEffect(() => {
    let cancelled = false;
    selected.forEach(async (courseId) => {
      if (!courseId || options[courseId]) return;
      const [chapterRes, categoryRes] = await Promise.all([
        chaptersApi.list(courseId, { limit: 100 }),
        topicCategoriesApi.list(courseId),
      ]);
      if (cancelled) return;
      setOptions((cur) => ({
        ...cur,
        [courseId]: {
          chapters: arrayFrom(chapterRes),
          categories: arrayFrom(categoryRes),
        },
      }));
    });
    return () => { cancelled = true; };
  }, [selected, options]);

  if (!selected.length) return null;

  const updateOne = (courseId, key, raw) => {
    const nextValue = raw === NONE ? "" : raw;
    const byCourse = new Map(mappings.map((m) => [m.course, m]));
    onChange?.(selected.map((id) => {
      const current = byCourse.get(id) || { course: id, category: "", chapter: "" };
      return id === courseId
        ? { ...current, [key]: nextValue, source: "manual", confidence: 100 }
        : current;
    }));
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold">Learning placement</div>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Optional. Map this question to the relevant category/chapter for each selected course.
          Unmapped questions remain available in the general course quiz/revision pool.
        </p>
      </div>

      {selected.map((courseId) => {
        const course = courses.find((c) => String(c._id) === courseId);
        const mapping = mappings.find((m) => m.course === courseId) || { course: courseId, category: "", chapter: "" };
        const opts = options[courseId] || { chapters: [], categories: [] };
        return (
          <div key={courseId} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-900/60 min-w-0 overflow-hidden">
            <div className="mb-3 text-xs font-black truncate">{course?.title || "Selected course"}</div>
            <div className="grid gap-3 min-w-0">
              <div className="space-y-1.5 min-w-0">
                <label className="text-[11px] font-bold text-zinc-500">Category</label>
                <Select value={mapping.category || NONE} onValueChange={(v) => updateOne(courseId, "category", v)}>
                  <SelectTrigger className="h-10 rounded-xl w-full min-w-0"><SelectValue placeholder="No category" /></SelectTrigger>
                  <SelectContent className="max-w-xs">
                    <SelectItem value={NONE}>No category</SelectItem>
                    {opts.categories.map((c) => <SelectItem key={c._id} value={String(c._id)}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-0">
                <label className="text-[11px] font-bold text-zinc-500">Chapter</label>
                <Select value={mapping.chapter || NONE} onValueChange={(v) => updateOne(courseId, "chapter", v)}>
                  <SelectTrigger className="h-10 rounded-xl w-full min-w-0"><SelectValue placeholder="No chapter" /></SelectTrigger>
                  <SelectContent className="max-w-xs">
                    <SelectItem value={NONE}>No chapter</SelectItem>
                    {opts.chapters.map((c) => <SelectItem key={c._id} value={String(c._id)}>{c.order}. {c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!mapping.category && !mapping.chapter && (
              <p className="mt-2 text-[10px] font-semibold text-zinc-400">Course-level only</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
