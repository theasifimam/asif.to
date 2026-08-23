"use client";

// ASIF_MAPPING_REVIEW_UI_V1
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Link2, X } from "lucide-react";
import { chaptersApi, topicCategoriesApi } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";
const REVIEW_CONFIDENCE = 75;

const idOf = (value) => String(value?._id || value || "");

function extractArray(response) {
  const candidates = [
    response?.data?.data?.data,
    response?.data?.data,
    response?.data,
  ];
  return candidates.find(Array.isArray) || [];
}

function normalize(mapping = {}) {
  return {
    course: idOf(mapping.course),
    category: idOf(mapping.category),
    chapter: idOf(mapping.chapter),
    source: mapping.source || "manual",
    confidence: Number(mapping.confidence ?? 100),
    mappedAt: mapping.mappedAt || null,
  };
}

function statusFor(mapping) {
  if (!mapping.category && !mapping.chapter) {
    return {
      warning: true,
      label: "Unmapped",
      detail: "Choose a category and chapter.",
    };
  }

  if (!mapping.category || !mapping.chapter) {
    return {
      warning: true,
      label: "Incomplete",
      detail: !mapping.category
        ? "Category still needs to be selected."
        : "Chapter still needs to be selected.",
    };
  }

  if (
    mapping.source === "auto" &&
    Number(mapping.confidence || 0) < REVIEW_CONFIDENCE
  ) {
    return {
      warning: true,
      label: `Low confidence · ${mapping.confidence || 0}%`,
      detail: "Review the automatic categorisation.",
    };
  }

  if (mapping.source === "manual") {
    return {
      warning: false,
      label: "Manual · 100%",
      detail: "Confirmed manually.",
    };
  }

  return {
    warning: false,
    label: `${mapping.source === "legacy" ? "Legacy" : "Auto"} · ${
      mapping.confidence || 0
    }%`,
    detail: "Mapping confidence is above the review threshold.",
  };
}

export default function LearningMappingFields({
  courseIds = [],
  courses = [],
  value = [],
  onChange,
}) {
  const [optionsByCourse, setOptionsByCourse] = useState({});

  const selectedCourseIds = useMemo(
    () =>
      Array.from(
        new Set((courseIds || []).map(String).filter(Boolean)),
      ),
    [courseIds],
  );

  const mappings = useMemo(
    () => (value || []).map(normalize),
    [value],
  );

  useEffect(() => {
    const existing = new Map(
      mappings.map((item) => [item.course, item]),
    );

    const next = selectedCourseIds.map((course) => ({
      course,
      category: existing.get(course)?.category || "",
      chapter: existing.get(course)?.chapter || "",
      source: existing.get(course)?.source || "manual",
      confidence: Number(existing.get(course)?.confidence ?? 100),
      mappedAt: existing.get(course)?.mappedAt || null,
    }));

    const compact = (items) =>
      JSON.stringify(
        items.map((item) => ({
          course: item.course,
          category: item.category || "",
          chapter: item.chapter || "",
          source: item.source || "manual",
          confidence: Number(item.confidence ?? 100),
        })),
      );

    const kept = mappings.filter((item) =>
      selectedCourseIds.includes(item.course),
    );

    if (compact(kept) !== compact(next)) {
      onChange?.(next);
    }
  }, [selectedCourseIds, mappings, onChange]);

  useEffect(() => {
    let cancelled = false;

    async function load(courseId) {
      if (!courseId || optionsByCourse[courseId]) return;

      const [chapterResponse, categoryResponse] = await Promise.all([
        chaptersApi.list(courseId, { limit: 100 }),
        topicCategoriesApi.list(courseId),
      ]);

      if (cancelled) return;

      setOptionsByCourse((current) => ({
        ...current,
        [courseId]: {
          chapters: extractArray(chapterResponse),
          categories: extractArray(categoryResponse),
        },
      }));
    }

    selectedCourseIds.forEach(load);

    return () => {
      cancelled = true;
    };
  }, [selectedCourseIds, optionsByCourse]);

  const replaceMapping = (courseId, changes) => {
    const next = selectedCourseIds.map((id) => {
      const current =
        mappings.find((item) => item.course === id) || {
          course: id,
          category: "",
          chapter: "",
        };

      if (id !== courseId) return current;

      return {
        ...current,
        ...changes,
        source: "manual",
        confidence: 100,
        mappedAt: new Date().toISOString(),
      };
    });

    onChange?.(next);
  };

  const update = (courseId, field, value) =>
    replaceMapping(courseId, {
      [field]: value === NONE ? "" : value,
    });

  if (!selectedCourseIds.length) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-xs text-zinc-500 dark:border-zinc-700">
        Select a course first. Category and chapter mapping will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-blue-600" />
          Learning placement
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Confirm where this question belongs. Manual changes become 100%
          confidence and remove the question from the mapping review queue.
        </p>
      </div>

      {selectedCourseIds.map((courseId) => {
        const course = courses.find(
          (item) => String(item._id) === courseId,
        );

        const mapping =
          mappings.find((item) => item.course === courseId) || {
            course: courseId,
            category: "",
            chapter: "",
            source: "manual",
            confidence: 100,
          };

        const options = optionsByCourse[courseId] || {
          chapters: [],
          categories: [],
        };

        const status = statusFor(mapping);

        return (
          <div
            key={courseId}
            className={`rounded-2xl border p-3 ${
              status.warning
                ? "border-amber-300/70 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-500/5"
                : "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-500/5"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-xs font-black">
                  {course?.title || "Selected course"}
                </div>
                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] font-black ${
                    status.warning
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {status.warning ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {status.label}
                </div>
                <p className="mt-1 text-[10px] text-zinc-500">
                  {status.detail}
                </p>
              </div>

              {(mapping.category || mapping.chapter) && (
                <button
                  type="button"
                  onClick={() =>
                    replaceMapping(courseId, {
                      category: "",
                      chapter: "",
                    })
                  }
                  className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 hover:text-red-600"
                  title="Clear mapping"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="mt-3 grid gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500">
                  Category
                </label>
                <Select
                  value={mapping.category || NONE}
                  onValueChange={(value) =>
                    update(courseId, "category", value)
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Choose category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not mapped</SelectItem>
                    {options.categories.map((item) => (
                      <SelectItem
                        key={item._id}
                        value={String(item._id)}
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500">
                  Chapter
                </label>
                <Select
                  value={mapping.chapter || NONE}
                  onValueChange={(value) =>
                    update(courseId, "chapter", value)
                  }
                >
                  <SelectTrigger className="h-10 rounded-xl bg-white dark:bg-zinc-950">
                    <SelectValue placeholder="Choose chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Not mapped</SelectItem>
                    {options.chapters.map((item) => (
                      <SelectItem
                        key={item._id}
                        value={String(item._id)}
                      >
                        {item.order ? `${item.order}. ` : ""}
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
