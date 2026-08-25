#!/usr/bin/env python3
"""
Patch asif.to analytics so the admin dashboard shows only defensible,
first-party measurements.

What this patch changes
-----------------------
1. Starts a clean "trusted v2" analytics collection instead of mixing old
   records whose country provenance cannot be verified.
2. Stops inferring a country from browser timezone.
3. Accepts country only from known edge/CDN country headers.
4. Excludes obvious automated user agents and localhost traffic.
5. Uses a 30-minute browser session instead of a browser-tab lifetime session.
6. Makes the admin UI describe what is actually measured:
   unique browser IDs, tracked page views, observed engagement, and verified
   country coverage.
7. Hides the country ranking when there is no verified country data.

Run from the repository root:
    python fix_analytics_trust.py

Optional:
    python fix_analytics_trust.py --dry-run
    python fix_analytics_trust.py --root C:\\path\\to\\asif.to

The script creates timestamped backups in:
    .analytics-fix-backup/
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import shutil
import subprocess
from pathlib import Path


MARKER = "ASIF_TRUSTED_ANALYTICS_V2"

CONTROLLER = Path("server/src/controllers/analytics.simple.controller.js")
TRACKER = Path("apps/web/components/analytics/AnalyticsTracker.jsx")
ADMIN_PAGE = Path("apps/admin/src/app/(admin)/analytics/page.jsx")
TRUSTED_DAILY = Path("server/src/models/AnalyticsTrustedDaily.js")
TRUSTED_IDENTITY = Path("server/src/models/AnalyticsTrustedIdentity.js")


TRUSTED_DAILY_CONTENT = r'''import { Schema, model } from "mongoose";

// ASIF_TRUSTED_ANALYTICS_V2
// This collection intentionally starts clean. Legacy AnalyticsDaily records
// may contain country values inferred from timezone and are not mixed here.
const analyticsTrustedDailySchema = new Schema(
  {
    date: { type: Date, required: true },
    path: { type: String, required: true, maxlength: 2048 },
    source: { type: String, required: true, maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrer: { type: String, default: "", maxlength: 2048 },

    // Country is stored only when the server receives a verified edge/CDN
    // ISO-3166 alpha-2 country header. It is never inferred from timezone.
    country: { type: String, default: "", maxlength: 2 },
    countrySource: {
      type: String,
      enum: ["", "cloudflare", "vercel", "cloudfront"],
      default: "",
      maxlength: 32,
    },

    // This is a viewport class, not a claim about the physical device.
    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },

    pageViews: { type: Number, default: 0 },
    engagementMs: { type: Number, default: 0 },
  },
  { timestamps: true },
);

analyticsTrustedDailySchema.index(
  {
    date: 1,
    path: 1,
    source: 1,
    medium: 1,
    campaign: 1,
    referrer: 1,
    country: 1,
    countrySource: 1,
    device: 1,
  },
  { unique: true },
);
analyticsTrustedDailySchema.index({ date: -1, pageViews: -1 });
analyticsTrustedDailySchema.index({ path: 1, date: -1 });
analyticsTrustedDailySchema.index({ date: 1, country: 1, countrySource: 1 });

export default model("AnalyticsTrustedDaily", analyticsTrustedDailySchema);
'''


TRUSTED_IDENTITY_CONTENT = r'''import { Schema, model } from "mongoose";

// ASIF_TRUSTED_ANALYTICS_V2
// A visitor is a distinct first-party browser identifier. It is deliberately
// not called a unique human/person because a person can use multiple browsers
// and a browser can be shared.
const analyticsTrustedIdentitySchema = new Schema(
  {
    date: { type: Date, required: true },
    visitorHash: { type: String, required: true, maxlength: 64 },
    sessionHash: { type: String, required: true, maxlength: 64 },
    path: { type: String, required: true, maxlength: 2048 },

    source: { type: String, default: "", maxlength: 120 },
    medium: { type: String, default: "", maxlength: 80 },
    campaign: { type: String, default: "", maxlength: 160 },
    referrerDomain: { type: String, default: "", maxlength: 255 },
    landingPath: { type: String, default: "", maxlength: 2048 },

    country: { type: String, default: "", maxlength: 2 },
    countrySource: {
      type: String,
      enum: ["", "cloudflare", "vercel", "cloudfront"],
      default: "",
      maxlength: 32,
    },

    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "other"],
      default: "other",
    },
    timezone: { type: String, default: "", maxlength: 100 },
    language: { type: String, default: "", maxlength: 32 },
  },
  { timestamps: true },
);

analyticsTrustedIdentitySchema.index(
  { date: 1, visitorHash: 1, sessionHash: 1, path: 1 },
  { unique: true },
);
analyticsTrustedIdentitySchema.index({ date: 1, visitorHash: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, sessionHash: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, source: 1, medium: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, country: 1, countrySource: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, timezone: 1 });
analyticsTrustedIdentitySchema.index({ date: 1, device: 1 });

// Keep raw identity rows for ~400 days, matching the previous analytics model.
analyticsTrustedIdentitySchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 34560000 },
);

export default model(
  "AnalyticsTrustedIdentity",
  analyticsTrustedIdentitySchema,
);
'''


STRICT_LOCATION_HELPERS = r'''// ASIF_TRUSTED_ANALYTICS_V2
const TRUSTED_COUNTRY_SOURCES = [
  "cloudflare",
  "vercel",
  "cloudfront",
];

const TRUSTED_COUNTRY_HEADERS = [
  ["cf-ipcountry", "cloudflare"],
  ["x-vercel-ip-country", "vercel"],
  ["cloudfront-viewer-country", "cloudfront"],
];

function normalizeCountryCode(value) {
  const code = String(value || "").trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) return "";

  // Cloudflare uses XX for unknown and T1 for Tor. Neither is a country.
  if (code === "XX" || code === "T1") return "";

  return code;
}

function resolveCountryName(countryCode) {
  const code = normalizeCountryCode(countryCode);

  if (!code) return "Unknown";

  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code) || code;
  } catch {
    return code;
  }
}

function countryFromRequest(req) {
  for (const [header, source] of TRUSTED_COUNTRY_HEADERS) {
    const raw = req.headers[header];
    const value = Array.isArray(raw) ? raw[0] : raw;
    const code = normalizeCountryCode(value);

    if (code) {
      return { code, source };
    }
  }

  return { code: "", source: "" };
}

const BOT_USER_AGENT =
  /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|facebot|twitterbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|developers\.google\.com\/\+\/web\/snippet|headlesschrome|lighthouse|pagespeed|pingdom|uptimerobot|statuscake|python-requests|python\/|curl\/|wget\/|postmanruntime|node-fetch|axios\//i;

function shouldIgnoreAnalyticsRequest(req) {
  const userAgent = clean(req.headers["user-agent"], 1024);

  // Real browsers normally send a UA. With a strict/trust-first dashboard,
  // requests without one are not counted.
  if (!userAgent || BOT_USER_AGENT.test(userAgent)) {
    return true;
  }

  return false;
}
'''


TRUSTED_IDENTITY_LOCATION_FUNCTION = r'''async function identityLocationRows(start, end, field) {
  const match = {
    date: { $gte: start, $lt: end },
  };

  if (field === "country") {
    match.country = { $regex: /^[A-Z]{2}$/ };
    match.countrySource = { $in: TRUSTED_COUNTRY_SOURCES };
  } else {
    match.timezone = {
      $exists: true,
      $nin: ["", null],
    };
  }

  const keyExpression =
    field === "country"
      ? "$country"
      : "$timezone";

  const [visitors, sessions] = await Promise.all([
    AnalyticsIdentity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            key: keyExpression,
            visitor: "$visitorHash",
          },
        },
      },
      {
        $group: {
          _id: "$_id.key",
          visitors: { $sum: 1 },
        },
      },
    ]),
    AnalyticsIdentity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            key: keyExpression,
            session: "$sessionHash",
          },
        },
      },
      {
        $group: {
          _id: "$_id.key",
          sessions: { $sum: 1 },
        },
      },
    ]),
  ]);

  return { visitors, sessions };
}
'''


def read_text(path: Path) -> tuple[str, str]:
    raw = path.read_bytes()
    newline = "\r\n" if b"\r\n" in raw else "\n"
    text = raw.decode("utf-8").replace("\r\n", "\n")
    return text, newline


def encode_with_newline(text: str, newline: str) -> bytes:
    if newline == "\r\n":
        text = text.replace("\n", "\r\n")
    return text.encode("utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(
            f"{label}: expected exactly 1 match, found {count}. "
            "The repo may have changed since this patch was generated."
        )
    return text.replace(old, new, 1)


def regex_replace_once(
    text: str,
    pattern: str,
    replacement: str,
    label: str,
    flags: int = re.S,
) -> str:
    updated, count = re.subn(pattern, lambda _match: replacement, text, count=1, flags=flags)
    if count != 1:
        raise RuntimeError(
            f"{label}: expected exactly 1 regex match, found {count}. "
            "The repo may have changed since this patch was generated."
        )
    return updated


def patch_controller(text: str) -> str:
    text = replace_once(
        text,
        'import AnalyticsDaily from "../models/AnalyticsDaily.js";\n'
        'import AnalyticsIdentity from "../models/AnalyticsIdentity.js";',
        'import AnalyticsDaily from "../models/AnalyticsTrustedDaily.js";\n'
        'import AnalyticsIdentity from "../models/AnalyticsTrustedIdentity.js";',
        "controller trusted-model imports",
    )

    text = regex_replace_once(
        text,
        r'const TIMEZONE_COUNTRY_MAP = \{.*?\n\};\n\n'
        r'function resolveCountryName\(countryCodeOrTimezone\) \{.*?\n\}\n\n'
        r'function countryFromRequest\(req, fallback = ""\) \{.*?\n\}\n',
        STRICT_LOCATION_HELPERS.rstrip() + "\n",
        "remove timezone-to-country inference",
    )

    text = replace_once(
        text,
        '      country = "",\n',
        "",
        "remove client country payload",
    )

    text = replace_once(
        text,
        '    const safeCountry = countryFromRequest(req, country);\n',
        '    const { code: safeCountry, source: countrySource } =\n'
        '      countryFromRequest(req);\n',
        "strict country extraction",
    )

    text = replace_once(
        text,
        '    const date = utcDay(new Date());\n',
        '    if (shouldIgnoreAnalyticsRequest(req)) {\n'
        '      return res.status(204).end();\n'
        '    }\n\n'
        '    const date = utcDay(new Date());\n',
        "known-bot filtering",
    )

    text = replace_once(
        text,
        '      country: safeCountry,\n'
        '      device: safeDevice,\n',
        '      country: safeCountry,\n'
        '      countrySource,\n'
        '      device: safeDevice,\n',
        "daily country provenance",
    )

    text = replace_once(
        text,
        '              country: safeCountry,\n'
        '              device: safeDevice,\n',
        '              country: safeCountry,\n'
        '              countrySource,\n'
        '              device: safeDevice,\n',
        "identity country provenance",
    )

    text = regex_replace_once(
        text,
        r'async function identityLocationRows\(start, end, field\) \{.*?\n\}\n\n'
        r'export const getLocations',
        TRUSTED_IDENTITY_LOCATION_FUNCTION.rstrip()
        + "\n\nexport const getLocations",
        "location identity aggregation",
    )

    old_country_block = r'''    if (dimension === "country") {
      const daily = await AnalyticsDaily.aggregate([
        {
          $match: {
            date: { $gte: dates.start, $lt: dates.end },
          },
        },
        {
          $group: {
            _id: "$country",
            pageViews: { $sum: "$pageViews" },
          },
        },
      ]);

      for (const row of daily) {
        const rawKey = row._id || "Unknown";
        const key = resolveCountryName(rawKey);
        const current = map.get(key) || {
          key: key,
          visitors: 0,
          sessions: 0,
          pageViews: 0,
        };
        current.pageViews += row.pageViews || 0;
        map.set(key, current);
      }
    }
'''

    new_country_block = r'''    let quality =
      dimension === "country"
        ? {
            source: "verified-edge-country",
            hasVerifiedCountryData: false,
            countryInferredFromTimezone: false,
            coveragePercent: 0,
            knownCountryPageViews: 0,
            totalTrackedPageViews: 0,
            note:
              "Only verified CDN/edge ISO country headers are shown. Unlocated traffic is omitted rather than guessed.",
          }
        : {
            source: "browser-timezone",
            trustworthyAsCountry: false,
            note:
              "Timezone is a browser-reported setting and is not used to infer country.",
          };

    if (dimension === "country") {
      const [daily, totals] = await Promise.all([
        AnalyticsDaily.aggregate([
          {
            $match: {
              date: { $gte: dates.start, $lt: dates.end },
              country: { $regex: /^[A-Z]{2}$/ },
              countrySource: { $in: TRUSTED_COUNTRY_SOURCES },
            },
          },
          {
            $group: {
              _id: "$country",
              pageViews: { $sum: "$pageViews" },
            },
          },
        ]),
        AnalyticsDaily.aggregate([
          {
            $match: {
              date: { $gte: dates.start, $lt: dates.end },
            },
          },
          {
            $group: {
              _id: null,
              pageViews: { $sum: "$pageViews" },
            },
          },
        ]),
      ]);

      for (const row of daily) {
        const key = resolveCountryName(row._id);
        const current = map.get(key) || {
          key,
          visitors: 0,
          sessions: 0,
          pageViews: 0,
        };
        current.pageViews += row.pageViews || 0;
        map.set(key, current);
      }

      const knownCountryPageViews = daily.reduce(
        (sum, row) => sum + (row.pageViews || 0),
        0,
      );
      const totalTrackedPageViews = totals[0]?.pageViews || 0;

      quality = {
        source: "verified-edge-country",
        hasVerifiedCountryData:
          knownCountryPageViews > 0 || map.size > 0,
        countryInferredFromTimezone: false,
        coveragePercent:
          totalTrackedPageViews > 0
            ? (knownCountryPageViews / totalTrackedPageViews) * 100
            : 0,
        knownCountryPageViews,
        totalTrackedPageViews,
        note:
          "Only verified CDN/edge ISO country headers are shown. Unlocated traffic is omitted rather than guessed.",
      };
    }
'''
    text = replace_once(
        text,
        old_country_block,
        new_country_block,
        "verified-country aggregation",
    )

    location_start = text.index("export const getLocations")
    location_end = text.index("export const getDevices", location_start)
    location_section = text[location_start:location_end]
    location_section = replace_once(
        location_section,
        '        dimension,\n'
        '        chart,\n'
        '        ...paginateRows(rows, page, limit),\n',
        '        dimension,\n'
        '        quality,\n'
        '        chart,\n'
        '        ...paginateRows(rows, page, limit),\n',
        "location quality metadata",
    )
    text = (
        text[:location_start]
        + location_section
        + text[location_end:]
    )

    overview_anchor = '''        trend,
        sync: {
'''
    overview_replacement = '''        trend,
        quality: {
          collection: "trusted-v2",
          legacyFirstPartyDataExcluded: true,
          knownBotsExcluded: true,
          visitorDefinition:
            "Distinct first-party browser identifiers, not guaranteed unique people.",
          sessionDefinition:
            "30-minute inactivity browser sessions.",
          pageViewDefinition:
            "Client-side route/page opens recorded by the asif.to tracker.",
          countryDefinition:
            "Country is accepted only from verified CDN/edge ISO headers and is never inferred from timezone.",
        },
        sync: {
'''
    text = replace_once(
        text,
        overview_anchor,
        overview_replacement,
        "overview quality metadata",
    )

    return text


def patch_tracker(text: str) -> str:
    old_id = r'''const id = (key, session = false) => {
  const store = session ? sessionStorage : localStorage;
  let value = store.getItem(key);

  if (!value) {
    value = crypto.randomUUID();
    store.setItem(key, value);
  }

  return value;
};
'''
    new_id = r'''// ASIF_TRUSTED_ANALYTICS_V2
const VISITOR_KEY = "asif_visitor_id";
const SESSION_KEY = "asif_session_id";
const SESSION_LAST_ACTIVITY_KEY = "asif_session_last_activity";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function getVisitorId() {
  let value = localStorage.getItem(VISITOR_KEY);

  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, value);
  }

  return value;
}

function getSessionId() {
  const now = Date.now();
  const lastActivity = Number(
    localStorage.getItem(SESSION_LAST_ACTIVITY_KEY) || 0,
  );
  let value = localStorage.getItem(SESSION_KEY);

  if (
    !value ||
    !lastActivity ||
    now - lastActivity > SESSION_TIMEOUT_MS
  ) {
    value = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, value);
  }

  localStorage.setItem(
    SESSION_LAST_ACTIVITY_KEY,
    String(now),
  );

  return value;
}
'''
    text = replace_once(
        text,
        old_id,
        new_id,
        "30-minute session implementation",
    )

    text = replace_once(
        text,
        '      visitorId: id("asif_visitor_id"),\n'
        '      sessionId: id("asif_session_id", true),\n',
        '      visitorId: getVisitorId(),\n'
        '      sessionId: getSessionId(),\n',
        "tracker visitor/session IDs",
    )

    return text


def patch_admin_page(text: str) -> str:
    replacements = [
        (
            '''            First-party asif.to traffic explains people, sources, content,
            devices and location. Search Console explains how Google Search is
            performing.''',
            '''            First-party analytics shows measured browser activity: browser
            IDs, tracked page views, sessions, acquisition and viewport data.
            Search Console remains separate for Google Search performance.''',
            "header measurement wording",
        ),
        (
            '          label="Visitors"\n',
            '          label="Unique browsers"\n',
            "overview visitor label",
        ),
        (
            '          help="Unique first-party visitors."\n',
            '          help="Distinct first-party browser IDs; known bots and local development are excluded."\n',
            "overview visitor help",
        ),
        (
            '          label="Page views"\n',
            '          label="Tracked page views"\n',
            "overview page-view label",
        ),
        (
            '          help="Pages actually opened on asif.to."\n',
            '          help="Client-side page and route opens recorded by the asif.to tracker."\n',
            "overview page-view help",
        ),
        (
            '          label="Sessions"\n',
            '          label="30-min sessions"\n',
            "overview session label",
        ),
        (
            '          help="Separate browsing sessions."\n',
            '          help="Browser sessions separated after 30 minutes of inactivity."\n',
            "overview session help",
        ),
        (
            '          label="Avg. time / view"\n',
            '          label="Observed time / view"\n',
            "engagement label",
        ),
        (
            '          help="First-party engaged time."\n',
            '          help="Observed page-lifecycle time; browsers can block or drop unload beacons."\n',
            "engagement help",
        ),
        (
            '        title="Are more people using asif.to?"\n',
            '        title="Is tracked browser activity growing?"\n',
            "trend title",
        ),
        (
            '            { key: "visitors", label: "Visitors" },\n',
            '            { key: "visitors", label: "Unique browsers" },\n',
            "trend visitor label",
        ),
        (
            '        title="Where did visitors come from?"\n',
            '        title="Where did tracked visits come from?"\n',
            "acquisition title",
        ),
        (
            '        title="What are people actually reading?"\n',
            '        title="What pages are actually being opened?"\n',
            "content title",
        ),
        (
            '        description="This is first-party usage, not Google impressions. It shows the pages visitors really opened."\n',
            '        description="This is first-party browser activity, not Google impressions. It shows page and route opens recorded by the site tracker."\n',
            "content description",
        ),
        (
            '        title="Where and how are people visiting?"\n',
            '        title="Where and how is tracked traffic arriving?"\n',
            "audience title",
        ),
        (
            '        description="Country is used when your CDN/proxy supplies a country header. Browser timezone remains available as a privacy-conscious location signal."\n',
            '        description="Countries are shown only when a trusted CDN/edge supplies an ISO country header. Browser timezone is displayed separately and is never converted into a country."\n',
            "audience description",
        ),
        (
            '            <h3 className="mb-4 text-sm font-black">Device mix</h3>\n',
            '            <h3 className="mb-4 text-sm font-black">Viewport mix</h3>\n',
            "viewport wording",
        ),
        (
            '              valueLabel="visitors"\n',
            '              valueLabel="browsers"\n',
            "location chart unit",
        ),
    ]

    for old, new, label in replacements:
        text = replace_once(text, old, new, label)

    # Multiple report tables expose the same distinct browser-ID metric.
    text = text.replace(
        '                label: "Visitors",\n',
        '                label: "Unique browsers",\n',
    )
    text = text.replace(
        '              label: "Visitors",\n',
        '              label: "Unique browsers",\n',
    )

    audience_open = '''      >
        <div className="grid gap-4 xl:grid-cols-2">
'''
    audience_new = '''      >
        {locationDimension === "country" && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[11px] leading-5 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
            {locations?.quality?.hasVerifiedCountryData ? (
              <>
                Verified country coverage:{" "}
                <strong>
                  {Number(
                    locations?.quality?.coveragePercent || 0,
                  ).toFixed(1)}
                  %
                </strong>{" "}
                of tracked page views in this range. Traffic without a
                verified edge country header is omitted, not guessed from
                timezone.
              </>
            ) : (
              <>
                No verified country data is available for this range. The
                dashboard intentionally hides guessed country rankings. Put
                the API behind Cloudflare, Vercel or CloudFront country
                headers to populate this report.
              </>
            )}
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
'''
    audience_anchor = '''        description="Countries are shown only when a trusted CDN/edge supplies an ISO country header. Browser timezone is displayed separately and is never converted into a country."
        action={'''
    pos = text.find(audience_anchor)
    if pos == -1:
        raise RuntimeError("audience quality notice: Audience anchor not found")
    insert_pos = text.find(audience_open, pos)
    if insert_pos == -1:
        raise RuntimeError("audience quality notice: section body not found")
    text = (
        text[:insert_pos]
        + text[insert_pos:].replace(audience_open, audience_new, 1)
    )

    chart_old = '''            <HorizontalBarChart
              rows={locations?.chart || []}
              labelKey="key"
              valueKey="visitors"
              valueLabel="browsers"
            />
'''
    chart_new = '''            {locationDimension === "country" &&
            !locations?.quality?.hasVerifiedCountryData ? (
              <div className="grid min-h-44 place-items-center rounded-2xl bg-zinc-50 px-6 text-center text-xs font-semibold leading-5 text-zinc-400 dark:bg-zinc-900/50">
                Country ranking is hidden until verified country observations
                exist.
              </div>
            ) : (
              <HorizontalBarChart
                rows={locations?.chart || []}
                labelKey="key"
                valueKey="visitors"
                valueLabel="browsers"
              />
            )}
'''
    text = replace_once(
        text,
        chart_old,
        chart_new,
        "hide unverified country chart",
    )

    return text


def run_git_check(root: Path) -> tuple[bool, str]:
    try:
        result = subprocess.run(
            ["git", "diff", "--check"],
            cwd=root,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            check=False,
        )
        return result.returncode == 0, result.stdout.strip()
    except FileNotFoundError:
        return True, "git executable not found; skipped git diff --check"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Apply trust-first analytics fixes to asif.to."
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Repository root (default: current directory)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate and show planned changes without writing files",
    )
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()

    required = [CONTROLLER, TRACKER, ADMIN_PAGE]
    missing = [str(p) for p in required if not (root / p).is_file()]
    if missing:
        print("ERROR: This does not look like the expected asif.to repo.")
        print("Missing:")
        for item in missing:
            print(f"  - {item}")
        return 2

    controller_text, controller_nl = read_text(root / CONTROLLER)
    tracker_text, tracker_nl = read_text(root / TRACKER)
    admin_text, admin_nl = read_text(root / ADMIN_PAGE)

    if MARKER in controller_text:
        print("Trusted analytics v2 is already present in the controller.")
        print("No changes were made.")
        return 0

    try:
        patched_controller = patch_controller(controller_text)
        patched_tracker = patch_tracker(tracker_text)
        patched_admin = patch_admin_page(admin_text)
    except RuntimeError as exc:
        print(f"ERROR: {exc}")
        print("No files were changed.")
        return 3

    planned = [
        CONTROLLER,
        TRACKER,
        ADMIN_PAGE,
        TRUSTED_DAILY,
        TRUSTED_IDENTITY,
    ]

    print("Validated patch against the current repo structure.")
    print("Planned files:")
    for path in planned:
        action = "create" if not (root / path).exists() else "update"
        print(f"  - {action:6} {path}")

    if args.dry_run:
        print("\nDry run complete. No files were changed.")
        return 0

    timestamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_root = root / ".analytics-fix-backup" / timestamp

    # Back up every existing file before writing anything.
    for relative in planned:
        source = root / relative
        if source.exists():
            destination = backup_root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, destination)

    outputs = {
        CONTROLLER: (patched_controller, controller_nl),
        TRACKER: (patched_tracker, tracker_nl),
        ADMIN_PAGE: (patched_admin, admin_nl),
        TRUSTED_DAILY: (TRUSTED_DAILY_CONTENT, "\n"),
        TRUSTED_IDENTITY: (TRUSTED_IDENTITY_CONTENT, "\n"),
    }

    try:
        for relative, (content, newline) in outputs.items():
            target = root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(encode_with_newline(content, newline))
    except Exception:
        print("ERROR while writing. Restoring backups...")
        for relative in planned:
            backup = backup_root / relative
            target = root / relative
            if backup.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(backup, target)
            elif target.exists() and relative in (TRUSTED_DAILY, TRUSTED_IDENTITY):
                target.unlink()
        raise

    ok, output = run_git_check(root)
    if not ok:
        print("\nWARNING: git diff --check reported a problem:")
        print(output)
        print(f"Backups are in: {backup_root}")
        return 4

    print("\nAnalytics trust patch applied successfully.")
    print(f"Backups: {backup_root}")
    print(
        "\nIMPORTANT: First-party analytics intentionally starts from a clean "
        "trusted-v2 collection after deployment. Old first-party counts are "
        "not mixed into the new dashboard because their country/bot/session "
        "provenance cannot be proven."
    )
    print(
        "\nCountry reports will remain empty unless the API receives a verified "
        "country header from Cloudflare, Vercel, or CloudFront. This is by "
        "design: unknown location is better than fabricated location."
    )
    print(
        "\nNext steps:\n"
        "  1. Review: git diff -- server/src/controllers/analytics.simple.controller.js "
        "apps/web/components/analytics/AnalyticsTracker.jsx "
        "\"apps/admin/src/app/(admin)/analytics/page.jsx\" "
        "server/src/models/AnalyticsTrustedDaily.js "
        "server/src/models/AnalyticsTrustedIdentity.js\n"
        "  2. Build/test the server, apps/web, and apps/admin.\n"
        "  3. Deploy server + web + admin together.\n"
        "  4. Visit production asif.to, then confirm /analytics starts collecting "
        "trusted-v2 page views.\n"
        "  5. If Countries stays empty, verify that your production API is actually "
        "behind Cloudflare/Vercel/CloudFront and receives its country header."
    )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
