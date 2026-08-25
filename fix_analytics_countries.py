#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import shutil
import subprocess
from pathlib import Path

GA4_SERVICE = Path("server/src/services/googleAnalytics.service.js")
ADMIN_PAGE = Path("apps/admin/src/app/(admin)/analytics/page.jsx")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(
            f"{label}: expected exactly one match, found {count}. "
            "Your local file may differ from the GitHub version this patch was built for."
        )
    return text.replace(old, new, 1)


def patch_ga4_service(text: str) -> str:
    old = '''      run({ dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 50 }),'''
    new = '''      run({ dateRanges, dimensions: [{ name: "country" }], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }], orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }], limit: 50 }),'''

    if new in text:
        return text

    return replace_once(text, old, new, "GA4 country metrics")


def patch_admin(text: str) -> str:
    text = text.replace(
        '''  const locationDimension = searchParams.get("location") || "timezone";''',
        '''  const locationDimension = searchParams.get("location") || "country";''',
        1,
    )

    old_loader = '''  const loadLocations = useCallback(async () => {
    const response = await analyticsApi.locations({
      ...range,
      dimension: locationDimension,
      page: locationPage,
      limit: 15,
    });

    if (response.success) {
      setLocations(unwrap(response));
    }
  }, [range, locationDimension, locationPage]);'''

    new_loader = '''  const loadLocations = useCallback(async () => {
    if (locationDimension === "country") {
      const response = await analyticsApi.ga4(range);

      if (!response.success) {
        setLocations({
          dimension: "country",
          source: "GA4",
          error:
            response.error ||
            "Google Analytics country data is currently unavailable.",
          rows: [],
          chart: [],
          pagination: {
            page: 1,
            limit: 15,
            total: 0,
            pages: 1,
          },
        });
        return;
      }

      const countryRows = (
        unwrap(response)?.audience?.countries || []
      )
        .filter(
          (row) =>
            row.country &&
            row.country !== "(not set)",
        )
        .map((row) => ({
          key: row.country,
          visitors: Number(row.activeUsers) || 0,
          sessions: Number(row.sessions) || 0,
          pageViews: Number(row.screenPageViews) || 0,
        }))
        .sort((a, b) => b.visitors - a.visitors);

      const limit = 15;
      const pages = Math.max(
        1,
        Math.ceil(countryRows.length / limit),
      );
      const safePage = Math.min(locationPage, pages);
      const start = (safePage - 1) * limit;

      setLocations({
        dimension: "country",
        source: "GA4",
        error: "",
        chart: countryRows.slice(0, 8),
        rows: countryRows.slice(start, start + limit),
        pagination: {
          page: safePage,
          limit,
          total: countryRows.length,
          pages,
        },
      });
      return;
    }

    const response = await analyticsApi.locations({
      ...range,
      dimension: "timezone",
      page: locationPage,
      limit: 15,
    });

    if (response.success) {
      setLocations({
        ...unwrap(response),
        source: "First-party browser timezone",
        error: "",
      });
    }
  }, [range, locationDimension, locationPage]);'''

    if new_loader not in text:
        text = replace_once(
            text,
            old_loader,
            new_loader,
            "main analytics country loader",
        )

    descriptions = [
        '''        description="Country is used when your CDN/proxy supplies a country header. Browser timezone remains available as a privacy-conscious location signal."''',
        '''        description="Countries are shown only when a trusted CDN/edge supplies an ISO country header. Browser timezone is displayed separately and is never converted into a country."''',
    ]
    new_description = '''        description="Countries come directly from Google Analytics 4. Browser timezone is a separate first-party signal and is never converted into a country."'''
    for old in descriptions:
        if old in text:
            text = text.replace(old, new_description, 1)
            break

    if '''              valueLabel="visitors"''' in text:
        text = text.replace(
            '''              valueLabel="visitors"''',
            '''              valueLabel={locationDimension === "country" ? "users" : "browsers"}''',
            1,
        )
    elif '''              valueLabel="browsers"''' in text:
        text = text.replace(
            '''              valueLabel="browsers"''',
            '''              valueLabel={locationDimension === "country" ? "users" : "browsers"}''',
            1,
        )

    for old_col in [
        '''            {
              key: "visitors",
              label: "Visitors",
              render: (row) => number(row.visitors),
            },''',
        '''            {
              key: "visitors",
              label: "Unique browsers",
              render: (row) => number(row.visitors),
            },''',
    ]:
        if old_col in text:
            text = text.replace(
                old_col,
                '''            {
              key: "visitors",
              label:
                locationDimension === "country"
                  ? "Active users"
                  : "Unique browsers",
              render: (row) => number(row.visitors),
            },''',
                1,
            )
            break

    old_tabs = '''          {[
            ["queries", "Queries"],
            ["pages", "Pages"],
          ].map(([value, label]) => ('''
    new_tabs = '''          {[
            ["queries", "Queries"],
            ["pages", "Pages"],
            ["countries", "Countries"],
          ].map(([value, label]) => ('''
    if old_tabs in text:
        text = text.replace(old_tabs, new_tabs, 1)

    source_notice = '''        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-zinc-400">
          <span>
            Source:{" "}
            {locationDimension === "country"
              ? "Google Analytics 4"
              : "First-party browser timezone"}
          </span>
          {locationDimension === "country" && (
            <span>· Active users, sessions and page views</span>
          )}
        </div>

        {locationDimension === "country" && locations?.error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            {locations.error} Country data is not replaced with guessed
            timezone-based geography.
          </div>
        )}

'''
    desc_pos = text.find(new_description)
    if desc_pos != -1 and "Source:{" "}" not in text[desc_pos:desc_pos + 2500]:
        body = '''      >
        <div className="grid gap-4 xl:grid-cols-2">'''
        body_pos = text.find(body, desc_pos)
        if body_pos != -1:
            replacement = '''      >
''' + source_notice + '''        <div className="grid gap-4 xl:grid-cols-2">'''
            text = text[:body_pos] + text[body_pos:].replace(body, replacement, 1)

    return text


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Use GA4 for audience countries and expose GSC countries."
    )
    parser.add_argument("--root", default=".")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()

    for rel in (GA4_SERVICE, ADMIN_PAGE):
        if not (root / rel).is_file():
            print(f"Missing expected file: {rel}")
            return 2

    try:
        ga4 = patch_ga4_service(read(root / GA4_SERVICE))
        admin = patch_admin(read(root / ADMIN_PAGE))
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        return 3

    print("Validated changes:")
    print(f"  - {GA4_SERVICE}")
    print(f"  - {ADMIN_PAGE}")
    print("  - Audience Countries -> GA4")
    print("  - Search Countries -> Google Search Console")
    print("  - No timezone-to-country fallback")

    if args.dry_run:
        print("\nDry run complete. No files changed.")
        return 0

    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup = root / ".analytics-country-fix-backup" / stamp

    for rel in (GA4_SERVICE, ADMIN_PAGE):
        src = root / rel
        dst = backup / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)

    (root / GA4_SERVICE).write_text(ga4, encoding="utf-8")
    (root / ADMIN_PAGE).write_text(admin, encoding="utf-8")

    try:
        result = subprocess.run(
            ["git", "diff", "--check"],
            cwd=root,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        if result.returncode != 0:
            print(result.stdout)
            print(f"Backups: {backup}")
            return 4
    except FileNotFoundError:
        print("git not available; skipped git diff --check")

    print("\nDone.")
    print(f"Backups: {backup}")
    print("\nDashboard meaning after deployment:")
    print("  Audience > Countries: GA4 active users, sessions, page views")
    print("  Audience > Time zones: first-party browser timezone")
    print("  Google Search > Countries: GSC clicks, impressions, CTR, position")
    print("\nNext: run git diff, build/test server and apps/admin, then deploy both.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
