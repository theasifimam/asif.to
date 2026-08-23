#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
from datetime import datetime
from pathlib import Path

MARKER = "ASIF_QUESTION_BANK_FILTERS_V1"


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


class Patcher:
    def __init__(self, root: Path, dry_run: bool):
        self.root = root
        self.dry_run = dry_run
        self.changed = []
        self.skipped = []
        self.warnings = []
        self.backed = set()
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_root = root / ".question_bank_filters_backup" / stamp

    def backup(self, path: Path):
        if self.dry_run or path in self.backed or not path.exists():
            return
        target = self.backup_root / path.relative_to(self.root)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, target)
        self.backed.add(path)

    def save(self, path: Path, content: str):
        current = path.read_text(encoding="utf-8")
        if current == content:
            self.skipped.append(str(path.relative_to(self.root)))
            return
        self.backup(path)
        if not self.dry_run:
            path.write_text(content, encoding="utf-8", newline="\n")
        self.changed.append(str(path.relative_to(self.root)))

    def report(self):
        print("\nQuestion Bank filters")
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
        print("\nFilters:")
        print("  Search | Type | Course | Category | Chapter | Mapping status")


def validate(root: Path):
    page = root / "apps/admin/src/app/(admin)/quiz/page.jsx"
    api = root / "apps/admin/src/lib/api.js"
    if not page.exists() or not api.exists():
        raise SystemExit("Run this from the asif.to repository root.")
    api_text = api.read_text(encoding="utf-8")
    if "chaptersApi" not in api_text or "topicCategoriesApi" not in api_text:
        raise SystemExit("Expected chaptersApi and topicCategoriesApi in admin api.js.")


def patch_page(p: Patcher):
    path = p.root / "apps/admin/src/app/(admin)/quiz/page.jsx"
    text = path.read_text(encoding="utf-8")

    if f"// {MARKER}" in text:
        p.skipped.append(str(path.relative_to(p.root)))
        return

    old_import = 'import { coursesApi, interviewQuestionsApi, quizApi } from "@/lib/api";'
    if old_import in text:
        text = text.replace(
            old_import,
            'import {\n'
            '  chaptersApi,\n'
            '  coursesApi,\n'
            '  interviewQuestionsApi,\n'
            '  quizApi,\n'
            '  topicCategoriesApi,\n'
            '} from "@/lib/api";\n'
            f'// {MARKER}',
            1,
        )
    elif "chaptersApi" not in text or "topicCategoriesApi" not in text:
        raise SystemExit("Could not patch Question Bank API imports.")

    state_anchor = (
        "  const [questions, setQuestions] = useState([]);\n"
        "  const [courses, setCourses] = useState([]);\n"
        "  const [loading, setLoading] = useState(true);"
    )
    if state_anchor in text:
        text = text.replace(
            state_anchor,
            "  const [questions, setQuestions] = useState([]);\n"
            "  const [courses, setCourses] = useState([]);\n"
            "  const [categories, setCategories] = useState([]);\n"
            "  const [chapters, setChapters] = useState([]);\n"
            "  const [taxonomyLoading, setTaxonomyLoading] = useState(false);\n"
            "  const [loading, setLoading] = useState(true);",
            1,
        )

    if 'categoryId: "all"' not in text:
        anchor = '    courseId: "all",\n    type: "all",'
        if anchor not in text:
            raise SystemExit("Could not locate useUrlFilters defaults.")
        text = text.replace(
            anchor,
            '    courseId: "all",\n'
            '    categoryId: "all",\n'
            '    chapterId: "all",\n'
            '    type: "all",',
            1,
        )

    if "categoryId" not in text[text.find("const { courseId"):text.find("const { courseId") + 220]:
        if "  const { courseId, type, mapping, search } = filters;" in text:
            text = text.replace(
                "  const { courseId, type, mapping, search } = filters;",
                "  const {\n"
                "    courseId,\n"
                "    categoryId,\n"
                "    chapterId,\n"
                "    type,\n"
                "    mapping,\n"
                "    search,\n"
                "  } = filters;",
                1,
            )
        elif "  const { courseId, type, search } = filters;" in text:
            text = text.replace(
                "  const { courseId, type, search } = filters;",
                "  const {\n"
                "    courseId,\n"
                "    categoryId,\n"
                "    chapterId,\n"
                "    type,\n"
                "    search,\n"
                "  } = filters;",
                1,
            )
        else:
            raise SystemExit("Could not extend filter destructuring.")

    simple_course_setter = (
        "  const setCourseId = (value) =>\n"
        "    setFilters((current) => ({ ...current, courseId: value }));"
    )
    if simple_course_setter in text:
        text = text.replace(
            simple_course_setter,
            "  const setCourseId = (value) =>\n"
            "    setFilters((current) => ({\n"
            "      ...current,\n"
            "      courseId: value,\n"
            '      categoryId: "all",\n'
            '      chapterId: "all",\n'
            "    }));\n"
            "  const setCategoryId = (value) =>\n"
            "    setFilters((current) => ({ ...current, categoryId: value }));\n"
            "  const setChapterId = (value) =>\n"
            "    setFilters((current) => ({ ...current, chapterId: value }));",
            1,
        )
    elif "const setCategoryId =" not in text:
        raise SystemExit("Could not patch dependent filter setters.")

    if "loadQuestionTaxonomy" not in text:
        anchor = "  // Data fetching\n"
        if anchor not in text:
            raise SystemExit("Could not find Data fetching section.")
        taxonomy = '''  useEffect(() => {
    let active = true;

    async function loadQuestionTaxonomy() {
      if (courseId === "all") {
        setCategories([]);
        setChapters([]);
        setTaxonomyLoading(false);
        return;
      }

      setTaxonomyLoading(true);

      const [categoryResponse, chapterResponse] = await Promise.all([
        topicCategoriesApi.list(courseId),
        chaptersApi.list(courseId, { limit: 100 }),
      ]);

      if (!active) return;

      const categoryItems =
        categoryResponse?.data?.data?.data ||
        categoryResponse?.data?.data ||
        [];

      const chapterItems =
        chapterResponse?.data?.data?.data ||
        chapterResponse?.data?.data ||
        [];

      setCategories(Array.isArray(categoryItems) ? categoryItems : []);
      setChapters(Array.isArray(chapterItems) ? chapterItems : []);
      setTaxonomyLoading(false);
    }

    loadQuestionTaxonomy();

    return () => {
      active = false;
    };
  }, [courseId]);

'''
        text = text.replace(anchor, taxonomy + anchor, 1)

    if 'categoryId !== "all"' not in text:
        anchor = '      ...(courseId !== "all" && { courseId }),\n    };'
        if anchor not in text:
            raise SystemExit("Could not extend API params.")
        text = text.replace(
            anchor,
            '      ...(courseId !== "all" && { courseId }),\n'
            '      ...(categoryId !== "all" && { categoryId }),\n'
            '      ...(chapterId !== "all" && { chapterId }),\n'
            '    };',
            1,
        )

    if "categoryId, chapterId, courses.length" not in text:
        patterns = [
            (
                r'\}, \[courseId, courses\.length, page, limit, type, mapping\]\);',
                '}, [courseId, categoryId, chapterId, courses.length, page, limit, type, mapping]);',
            ),
            (
                r'\}, \[courseId, courses\.length, page, limit, type\]\);',
                '}, [courseId, categoryId, chapterId, courses.length, page, limit, type]);',
            ),
        ]
        for pattern, replacement in patterns:
            text2, count = re.subn(pattern, replacement, text, count=1)
            if count:
                text = text2
                break

    if "ASIF_QUESTION_BANK_FILTERS_V1:category-filter" not in text:
        pattern = re.compile(
            r'(\s*<div className="w-full md:w-56">\s*'
            r'<Select value=\{courseId\}.*?'
            r'</Select>\s*</div>)',
            re.S,
        )
        match = pattern.search(text)
        if not match:
            raise SystemExit("Could not locate Course filter block.")

        filters_ui = '''
        {/* ASIF_QUESTION_BANK_FILTERS_V1:category-filter */}
        <div className="w-full md:w-52">
          <Select
            value={categoryId}
            onValueChange={filter(setCategoryId)}
            disabled={courseId === "all" || taxonomyLoading}
          >
            <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue
                placeholder={courseId === "all" ? "Select course first" : "All categories"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ASIF_QUESTION_BANK_FILTERS_V1:chapter-filter */}
        <div className="w-full md:w-56">
          <Select
            value={chapterId}
            onValueChange={filter(setChapterId)}
            disabled={courseId === "all" || taxonomyLoading}
          >
            <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue
                placeholder={courseId === "all" ? "Select course first" : "All chapters"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All chapters</SelectItem>
              {chapters.map((chapter) => (
                <SelectItem key={chapter._id} value={chapter._id}>
                  {chapter.order ? `${chapter.order}. ` : ""}
                  {chapter.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
'''
        insert_at = match.end()
        text = text[:insert_at] + "\n" + filters_ui + text[insert_at:]

    p.save(path, text)


def main():
    opts = parse_args()
    root = Path(opts.root).resolve()
    validate(root)
    p = Patcher(root, opts.dry_run)
    patch_page(p)
    p.report()


if __name__ == "__main__":
    main()
