#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
from datetime import datetime
from pathlib import Path
from textwrap import dedent

MARKER = "ASIF_MAPPING_REVIEW_UI_V1"
REVIEW_CONFIDENCE = 75

MAPPING_COMPONENT = dedent(r'''
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
''').lstrip()


ADMIN_LIST_FUNCTION = dedent(r'''
// ASIF_MAPPING_REVIEW_UI_V1:admin-list
export const getQuizQuestionsAdmin = async (req, res) => {
  try {
    const {
      courseId,
      chapterId,
      categoryId,
      mapping = "all",
      confidenceThreshold = 75,
      type = "quiz",
      page = 1,
      limit = 20,
    } = req.query;

    const threshold = Math.min(
      100,
      Math.max(0, Number(confidenceThreshold) || 75),
    );

    const selectedCourse =
      courseId && mongoose.isValidObjectId(courseId)
        ? courseId
        : null;

    const mappingActive =
      type !== "interview" && mapping !== "all";

    const filter =
      type === "all"
        ? mappingActive
          ? { type: "quiz" }
          : {}
        : {
            type: type === "interview" ? "interview" : "quiz",
          };

    if (selectedCourse) {
      if (type === "interview") {
        filter.course = selectedCourse;
      } else if (type === "all" && !mappingActive) {
        filter.$or = [
          { courses: selectedCourse },
          { course: selectedCourse },
        ];
      } else {
        filter.courses = selectedCourse;
      }
    }

    const and = [];

    if (
      type !== "interview" &&
      (chapterId || categoryId)
    ) {
      const elem = {};
      if (selectedCourse) elem.course = selectedCourse;
      if (chapterId && mongoose.isValidObjectId(chapterId)) {
        elem.chapter = chapterId;
      }
      if (categoryId && mongoose.isValidObjectId(categoryId)) {
        elem.category = categoryId;
      }
      if (Object.keys(elem).length) {
        and.push({
          learningMappings: { $elemMatch: elem },
        });
      }
    }

    const incomplete = [
      { category: null },
      { category: { $exists: false } },
      { chapter: null },
      { chapter: { $exists: false } },
      { confidence: { $lt: threshold } },
    ];

    if (type !== "interview") {
      if (mapping === "needs_review") {
        if (selectedCourse) {
          and.push({
            $or: [
              {
                learningMappings: {
                  $not: {
                    $elemMatch: { course: selectedCourse },
                  },
                },
              },
              {
                learningMappings: {
                  $elemMatch: {
                    course: selectedCourse,
                    $or: incomplete,
                  },
                },
              },
            ],
          });
        } else {
          and.push({
            $or: [
              {
                "learningMappings.0": { $exists: false },
              },
              {
                learningMappings: {
                  $elemMatch: { $or: incomplete },
                },
              },
            ],
          });
        }
      }

      if (mapping === "mapped") {
        and.push(
          selectedCourse
            ? {
                learningMappings: {
                  $elemMatch: { course: selectedCourse },
                },
              }
            : {
                "learningMappings.0": { $exists: true },
              },
        );
      }

      if (mapping === "unmapped") {
        and.push(
          selectedCourse
            ? {
                learningMappings: {
                  $not: {
                    $elemMatch: { course: selectedCourse },
                  },
                },
              }
            : {
                "learningMappings.0": { $exists: false },
              },
        );
      }

      if (mapping === "low_confidence") {
        and.push({
          learningMappings: {
            $elemMatch: {
              ...(selectedCourse
                ? { course: selectedCourse }
                : {}),
              confidence: { $lt: threshold },
            },
          },
        });
      }

      if (mapping === "complete") {
        if (selectedCourse) {
          and.push({
            learningMappings: {
              $elemMatch: {
                course: selectedCourse,
                category: { $ne: null },
                chapter: { $ne: null },
                confidence: { $gte: threshold },
              },
            },
          });
        } else {
          and.push({
            "learningMappings.0": { $exists: true },
          });
          and.push({
            learningMappings: {
              $not: {
                $elemMatch: { $or: incomplete },
              },
            },
          });
        }
      }
    }

    if (and.length) {
      filter.$and = [
        ...(filter.$and || []),
        ...and,
      ];
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(
      Math.max(Number(limit) || 20, 1),
      100,
    );

    const [questions, total] = await Promise.all([
      QuizQuestion.find(filter)
        .populate("courses", "title slug techId")
        .populate("course", "title slug techId")
        .populate("category", "name slug")
        .populate("learningMappings.course", "title slug techId")
        .populate("learningMappings.category", "name slug")
        .populate("learningMappings.chapter", "title slug order")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      QuizQuestion.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
      meta: {
        mapping,
        confidenceThreshold: threshold,
      },
    });
  } catch (error) {
    console.error("[QUIZ] getQuizQuestionsAdmin error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
''').strip()


def args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


class Patcher:
    def __init__(self, root, dry_run):
        self.root = root
        self.dry_run = dry_run
        self.changed = []
        self.skipped = []
        self.warnings = []
        self.backed = set()
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_root = root / ".mapping_review_backup" / stamp

    def backup(self, path):
        if self.dry_run or path in self.backed or not path.exists():
            return
        target = self.backup_root / path.relative_to(self.root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        self.backed.add(path)

    def save(self, path, content):
        old = path.read_text(encoding="utf-8") if path.exists() else None
        if old == content:
            self.skipped.append(str(path.relative_to(self.root)))
            return
        self.backup(path)
        if not self.dry_run:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8", newline="\n")
        self.changed.append(str(path.relative_to(self.root)))

    def report(self):
        print("\nQuestion mapping review upgrade")
        print("=" * 60)
        print("Mode:", "DRY RUN" if self.dry_run else "APPLIED")

        if self.changed:
            print("\nChanged:")
            for item in dict.fromkeys(self.changed):
                print("  +", item)

        if self.skipped:
            print("\nAlready current:")
            for item in self.skipped:
                print("  =", item)

        if self.warnings:
            print("\nWarnings:")
            for item in self.warnings:
                print("  !", item)

        if self.backed and not self.dry_run:
            print("\nBackups:", self.backup_root.relative_to(self.root))

        print("\nQuestion Bank now defaults to:")
        print("  Needs mapping")
        print("  - no mapping")
        print("  - missing category")
        print("  - missing chapter")
        print("  - confidence < 75%")
        print("\nManual edits become source=manual, confidence=100.")


def validate(root):
    required = [
        root / "server/src/models/Question.js",
        root / "server/src/controllers/quiz.controller.js",
        root / "apps/admin/src/app/(admin)/quiz/page.jsx",
        root / "apps/admin/src/app/(admin)/quiz/components/QuestionForm.jsx",
    ]
    missing = [str(p.relative_to(root)) for p in required if not p.exists()]
    if missing:
        raise SystemExit(
            "Run from the asif.to repository root. Missing:\n  - "
            + "\n  - ".join(missing)
        )

    model = required[0].read_text(encoding="utf-8")
    if "learningMappings" not in model:
        raise SystemExit(
            "Question.learningMappings is not installed. "
            "Run upgrade_question_learning_mapping.py first."
        )


def patch_backend(p):
    path = p.root / "server/src/controllers/quiz.controller.js"
    text = path.read_text(encoding="utf-8")

    if "// ASIF_MAPPING_REVIEW_UI_V1:admin-list" not in text:
        pattern = (
            r'export const getQuizQuestionsAdmin = async '
            r'\(req, res\) => \{.*?\n\};'
            r'(?=\n\nexport const getQuestionAdmin)'
        )
        text, count = re.subn(
            pattern,
            ADMIN_LIST_FUNCTION,
            text,
            count=1,
            flags=re.S,
        )
        if not count:
            raise SystemExit(
                "Could not patch getQuizQuestionsAdmin() in quiz.controller.js"
            )

    # Ensure the edit endpoint returns readable course/category/chapter labels.
    start = text.find("export const getQuestionAdmin")
    end = text.find("/** POST /api/v1/quiz", start)
    if start >= 0 and end > start:
        block = text[start:end]
        if 'populate("learningMappings.chapter"' not in block:
            needle = '      .populate("course", "title slug techId")\n      .lean();'
            replacement = (
                '      .populate("course", "title slug techId")\n'
                '      .populate("category", "name slug")\n'
                '      .populate("learningMappings.course", "title slug techId")\n'
                '      .populate("learningMappings.category", "name slug")\n'
                '      .populate("learningMappings.chapter", "title slug order")\n'
                '      .lean();'
            )
            if needle in block:
                block = block.replace(needle, replacement, 1)
                text = text[:start] + block + text[end:]
            else:
                p.warnings.append(
                    "getQuestionAdmin population anchor not found; inspect manually."
                )

    p.save(path, text)


def patch_form(p):
    path = p.root / "apps/admin/src/app/(admin)/quiz/components/QuestionForm.jsx"
    text = path.read_text(encoding="utf-8")

    if "LearningMappingFields" not in text:
        anchor = 'import FollowUpQuestionPicker from "@/components/editor/FollowUpQuestionPicker";'
        if anchor not in text:
            raise SystemExit("QuestionForm import anchor changed.")
        text = text.replace(
            anchor,
            anchor + '\nimport LearningMappingFields from "./LearningMappingFields";',
            1,
        )

    initial_start = text.find("const initialForm")
    initial_end = text.find("const slugify", initial_start)
    if initial_start >= 0 and "learningMappings:" not in text[initial_start:initial_end]:
        text = text.replace(
            'courseIds: [], course: ""',
            'courseIds: [], learningMappings: [], course: ""',
            1,
        )

    if "mapping.category?._id" not in text:
        needle = (
            'courseIds: (item.courses || []).map((course) => course._id || course), options:'
        )
        if needle in text:
            text = text.replace(
                needle,
                'courseIds: (item.courses || []).map((course) => course._id || course), '
                'learningMappings: (item.learningMappings || []).map((mapping) => ({ '
                'course: mapping.course?._id || mapping.course || "", '
                'category: mapping.category?._id || mapping.category || "", '
                'chapter: mapping.chapter?._id || mapping.chapter || "", '
                'source: mapping.source || "manual", '
                'confidence: mapping.confidence ?? 100, '
                'mappedAt: mapping.mappedAt || null })), options:',
                1,
            )
        else:
            p.warnings.append("Could not normalize learningMappings on edit.")

    if "<LearningMappingFields" not in text:
        needle = (
            '</div></div><label className="flex items-center gap-3 text-sm">'
            '<input type="checkbox" checked={form.quizEnabled}'
        )
        if needle not in text:
            raise SystemExit("QuestionForm Courses block changed.")
        text = text.replace(
            needle,
            '</div></div>'
            '<LearningMappingFields '
            'courseIds={form.courseIds || []} '
            'courses={courses} '
            'value={form.learningMappings || []} '
            'onChange={(value) => update("learningMappings", value)} '
            '/>'
            '<label className="flex items-center gap-3 text-sm">'
            '<input type="checkbox" checked={form.quizEnabled}',
            1,
        )

    p.save(path, text)


HELPERS = dedent(r'''
const REVIEW_CONFIDENCE = 75;

function normalizedMappings(item) {
  if (item.type === "interview") {
    return [
      {
        course: item.course || null,
        category: item.category || null,
        chapter: null,
        source: "manual",
        confidence: 100,
        interview: true,
      },
    ];
  }

  if (item.learningMappings?.length) {
    return item.learningMappings;
  }

  return (item.courses || []).map((course) => ({
    course,
    category: null,
    chapter: null,
    source: "unmapped",
    confidence: 0,
  }));
}

function mappingNeedsReview(mapping) {
  if (mapping.interview) return false;

  return (
    !mapping.category ||
    !mapping.chapter ||
    Number(mapping.confidence || 0) < REVIEW_CONFIDENCE
  );
}

function QuestionMappingRows({ item, field }) {
  const mappings = normalizedMappings(item);

  if (!mappings.length) {
    return (
      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
        Unmapped
      </span>
    );
  }

  return (
    <div className="space-y-1">
      {mappings.map((mapping, index) => {
        const needsReview = mappingNeedsReview(mapping);

        let value = "—";
        if (field === "course") {
          value =
            mapping.course?.title ||
            mapping.course?.slug ||
            "Course";
        }
        if (field === "category") {
          value =
            mapping.category?.name ||
            (mapping.interview
              ? item.category?.name || "—"
              : "Unmapped");
        }
        if (field === "chapter") {
          value =
            mapping.chapter?.title ||
            (mapping.interview ? "—" : "Unmapped");
        }

        return (
          <div
            key={`${field}-${mapping.course?._id || mapping.course || index}`}
            className={`max-w-44 truncate text-[11px] font-semibold ${
              needsReview &&
              ["category", "chapter"].includes(field)
                ? "text-amber-600 dark:text-amber-400"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
            title={value}
          >
            {value}
          </div>
        );
      })}
    </div>
  );
}

function MappingStatus({ item }) {
  if (item.type === "interview") {
    return (
      <span className="text-[10px] font-black text-zinc-400">
        Interview taxonomy
      </span>
    );
  }

  const mappings = normalizedMappings(item);

  if (!mappings.length) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
        Needs mapping
      </span>
    );
  }

  return (
    <div className="space-y-1">
      {mappings.map((mapping, index) => {
        const confidence = Number(mapping.confidence || 0);
        const needsReview = mappingNeedsReview(mapping);

        const label =
          !mapping.category || !mapping.chapter
            ? "Incomplete"
            : mapping.source === "manual"
              ? "Manual · 100%"
              : `${
                  mapping.source === "legacy" ? "Legacy" : "Auto"
                } · ${confidence}%`;

        return (
          <div
            key={`status-${mapping.course?._id || mapping.course || index}`}
          >
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-black ${
                needsReview
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

''').lstrip()


def patch_page(p):
    path = p.root / "apps/admin/src/app/(admin)/quiz/page.jsx"
    text = path.read_text(encoding="utf-8")

    if "function QuestionMappingRows" not in text:
        anchor = "export default function QuestionsPage() {"
        if anchor not in text:
            raise SystemExit("QuestionsPage component not found.")
        text = text.replace(anchor, HELPERS + anchor, 1)

    # Make review queue the default.
    if 'mapping: "needs_review"' not in text:
        if 'mapping: "all"' in text:
            text = text.replace('mapping: "all"', 'mapping: "needs_review"', 1)
        else:
            text = text.replace(
                '    type: "all",\n    search: "",',
                '    type: "all",\n    mapping: "needs_review",\n    search: "",',
                1,
            )

    if "const { courseId, type, mapping, search }" not in text:
        text = text.replace(
            "const { courseId, type, search } = filters;",
            "const { courseId, type, mapping, search } = filters;",
            1,
        )

    if "const setMapping =" not in text:
        anchor = (
            "  const setType = (value) =>\n"
            "    setFilters((current) => ({ ...current, type: value }));"
        )
        if anchor in text:
            text = text.replace(
                anchor,
                anchor
                + "\n  const setMapping = (value) =>\n"
                + "    setFilters((current) => ({ ...current, mapping: value }));",
                1,
            )

    if "confidenceThreshold: REVIEW_CONFIDENCE" not in text:
        anchor = "    const params = {\n      type,\n      page,"
        if anchor in text:
            text = text.replace(
                anchor,
                "    const params = {\n"
                "      type,\n"
                "      mapping,\n"
                "      confidenceThreshold: REVIEW_CONFIDENCE,\n"
                "      page,",
                1,
            )
        elif "      mapping,\n      page," in text:
            text = text.replace(
                "      mapping,\n      page,",
                "      mapping,\n"
                "      confidenceThreshold: REVIEW_CONFIDENCE,\n"
                "      page,",
                1,
            )
        else:
            p.warnings.append("Could not add confidenceThreshold to load params.")

    text = text.replace(
        "[courseId, courses.length, page, limit, type]",
        "[courseId, courses.length, page, limit, type, mapping]",
        1,
    )

    # Add mapping filter when absent.
    if 'value="needs_review"' not in text:
        course_anchor = (
            '        <div className="w-full md:w-56">\n'
            '          <Select value={courseId}'
        )
        if course_anchor not in text:
            raise SystemExit("Course filter anchor not found.")

        filter_block = dedent(r'''
                <div className="w-full md:w-48">
                  <Select
                    value={mapping}
                    onValueChange={filter(setMapping)}
                    disabled={type === "interview"}
                  >
                    <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
                      <SelectValue placeholder="Mapping status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="needs_review">Needs mapping</SelectItem>
                      <SelectItem value="low_confidence">Low confidence</SelectItem>
                      <SelectItem value="unmapped">Completely unmapped</SelectItem>
                      <SelectItem value="complete">Complete mapping</SelectItem>
                      <SelectItem value="mapped">Any mapped</SelectItem>
                      <SelectItem value="all">All questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
        ''').rstrip() + "\n"

        text = text.replace(course_anchor, filter_block + course_anchor, 1)

    # If an older mapping select exists, add missing review options.
    if 'value="needs_review"' not in text:
        p.warnings.append("Existing mapping select needs manual review.")

    # Add explanation notice.
    if "Mapping cleanup queue." not in text:
        anchor = "      </AdminFilters>\n\n      <AdminContent"
        if anchor in text:
            notice = dedent(r'''
              </AdminFilters>

              {mapping === "needs_review" && type !== "interview" && (
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                  <span className="font-black">Mapping cleanup queue.</span>{" "}
                  Showing questions that are unmapped, missing a Category or
                  Chapter, or have automatic confidence below{" "}
                  {REVIEW_CONFIDENCE}%. Open Edit to confirm Course → Category
                  → Chapter.
                </div>
              )}

              <AdminContent
            ''').rstrip()
            text = text.replace(anchor, notice, 1)

    # Table headers.
    if ">Category</th>" not in text:
        old = (
            '                      <th className="px-6 py-4.5">Question</th>\n'
            '                      <th className="px-6 py-4.5">Type</th>\n'
            '                      <th className="px-6 py-4.5">Course</th>\n'
            '                      <th className="px-6 py-4.5">Difficulty</th>\n'
            '                      <th className="px-6 py-4.5 text-right">Actions</th>'
        )
        new = (
            '                      <th className="px-6 py-4.5">Question</th>\n'
            '                      <th className="px-6 py-4.5">Type</th>\n'
            '                      <th className="px-6 py-4.5">Course</th>\n'
            '                      <th className="px-6 py-4.5">Category</th>\n'
            '                      <th className="px-6 py-4.5">Chapter</th>\n'
            '                      <th className="px-6 py-4.5">Mapping</th>\n'
            '                      <th className="px-6 py-4.5">Difficulty</th>\n'
            '                      <th className="px-6 py-4.5 text-right">Actions</th>'
        )
        if old not in text:
            raise SystemExit("Table header anchor changed.")
        text = text.replace(old, new, 1)

    text = text.replace(
        '<td colSpan={5} className="px-6 py-10 text-center">',
        '<td colSpan={8} className="px-6 py-10 text-center">',
        1,
    )

    # Replace existing course cell with Course/Category/Chapter/Mapping cells.
    if "ASIF_MAPPING_REVIEW_UI_V1:table-mapping" not in text:
        old = dedent(r'''
                          <td className="px-6 py-4.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                            {item.type === "interview"
                              ? item.course?.title || "—"
                              : (item.courses || [])
                                  .map((course) => course.title)
                                  .join(", ") || "—"}
                          </td>
        ''').strip()

        new = dedent(r'''
                          {/* ASIF_MAPPING_REVIEW_UI_V1:table-mapping */}
                          <td className="px-6 py-4.5">
                            <QuestionMappingRows item={item} field="course" />
                          </td>
                          <td className="px-6 py-4.5">
                            <QuestionMappingRows item={item} field="category" />
                          </td>
                          <td className="px-6 py-4.5">
                            <QuestionMappingRows item={item} field="chapter" />
                          </td>
                          <td className="px-6 py-4.5">
                            <MappingStatus item={item} />
                          </td>
        ''').strip()

        if old not in text:
            raise SystemExit("Course table cell anchor changed.")
        text = text.replace(old, new, 1)

    text = text.replace("min-w-220 text-left text-sm", "min-w-300 text-left text-sm", 1)

    # Add mapping details to cards without depending on the old course block.
    if "ASIF_MAPPING_REVIEW_UI_V1:card-details" not in text:
        anchor = (
            '                    <div className="mt-5 flex items-center justify-between '
            'border-t border-zinc-100 pt-3.5 dark:border-zinc-800/80">'
        )
        card = dedent(r'''
                    {/* ASIF_MAPPING_REVIEW_UI_V1:card-details */}
                    {item.type === "quiz" && (
                      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900/70">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Category</p>
                          <QuestionMappingRows item={item} field="category" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Chapter</p>
                          <QuestionMappingRows item={item} field="chapter" />
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Mapping</p>
                          <MappingStatus item={item} />
                        </div>
                      </div>
                    )}

        ''') + anchor
        if anchor in text:
            text = text.replace(anchor, card, 1)
        else:
            p.warnings.append("Could not add mapping details to card view.")

    p.save(path, text)


def main():
    opts = args()
    root = Path(opts.root).resolve()
    validate(root)

    p = Patcher(root, opts.dry_run)

    p.save(
        root / "apps/admin/src/app/(admin)/quiz/components/LearningMappingFields.jsx",
        MAPPING_COMPONENT,
    )
    patch_backend(p)
    patch_form(p)
    patch_page(p)

    p.report()


if __name__ == "__main__":
    main()
