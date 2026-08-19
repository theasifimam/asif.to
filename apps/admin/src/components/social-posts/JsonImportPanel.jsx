"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileJson2 } from "lucide-react";
import { Button, Textarea } from "../ui";
import { TEMPLATE_MAP } from "./templates/registry";
import { EMPTY_POST } from "./hooks/useSocialPost";

const VALID_PLATFORMS = new Set([
  "instagram",
  "linkedin",
  "twitter",
  "facebook",
  "general",
]);

const FORMAT_ALIASES = {
  "square-1080": "square-1080",
  square: "square-1080",
  "square 1080×1080": "square-1080",
  "square 1080x1080": "square-1080",
  "portrait-1080": "portrait-1080",
  portrait: "portrait-1080",
  "portrait 1080×1350": "portrait-1080",
  "portrait 1080x1350": "portrait-1080",
};

const SAMPLE = `{
  "internalPostName": "react-useeffect-cleanup",
  "category": "React.js",
  "platform": "instagram",
  "recommendedFormat": "portrait",
  "caption": "A concise caption for the carousel.",
  "hashtags": ["#ReactJS", "#useEffect"],
  "slides": [
    {
      "template": "tutorial-cover",
      "eyebrow": "React.js",
      "title": "When Does useEffect Cleanup Run?",
      "subtitle": "Learn the cleanup lifecycle clearly.",
      "badge": "React"
    },
    {
      "template": "summary",
      "title": "Remember the rule",
      "body": "Clean up what your effect sets up.",
      "cta": "Learn more on asif.to",
      "url": "https://asif.to"
    }
  ]
}`;

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stripCodeFence(value) {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function normalizeFormat(value) {
  if (!value) return EMPTY_POST.format;
  return FORMAT_ALIASES[String(value).trim().toLowerCase()] || value;
}

function normalizePlatform(value) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = String(candidate || "instagram").trim().toLowerCase();
  return VALID_PLATFORMS.has(normalized) ? normalized : "general";
}

function normalizeHashtags(value) {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }

  if (typeof value === "string") {
    return value
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
  }

  return [];
}

function normalizeSlide(slide, index) {
  if (!slide || typeof slide !== "object" || Array.isArray(slide)) {
    throw new Error(`Slide ${index + 1} must be an object.`);
  }

  const template = String(slide.template || "").trim();
  if (!TEMPLATE_MAP[template]) {
    throw new Error(
      `Slide ${index + 1} uses unsupported template "${template || "(missing)"}".`,
    );
  }

  return {
    ...slide,
    id: slide.id || uid(),
    order: index,
    template,
    ...(slide.code
      ? {
          code: {
            language: slide.code.language || "javascript",
            filename: slide.code.filename || "",
            content: slide.code.content || "",
            highlightLines: Array.isArray(slide.code.highlightLines)
              ? slide.code.highlightLines
              : Array.isArray(slide.highlightLines)
                ? slide.highlightLines
                : [],
            showLineNumbers: slide.code.showLineNumbers !== false,
          },
        }
      : {}),
  };
}

export function parseSocialPostImport(raw) {
  if (!raw.trim()) throw new Error("Paste a social post JSON object first.");

  let parsed;
  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new Error(
      "Invalid JSON. Ask the model to return valid JSON with double-quoted keys and values.",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The imported value must be one post object.");
  }

  if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("The post must contain at least one slide.");
  }

  if (parsed.slides.length > 20) {
    throw new Error("A social post can contain at most 20 imported slides.");
  }

  const name = String(
    parsed.name || parsed.internalPostName || "Untitled social post",
  ).trim();

  if (!name) throw new Error("Post name cannot be empty.");

  return {
    ...EMPTY_POST,
    name,
    category: String(parsed.category || "").trim(),
    platform: normalizePlatform(parsed.platform),
    format: normalizeFormat(parsed.format || parsed.recommendedFormat),
    status: parsed.status === "published" ? "published" : "draft",
    caption: String(parsed.caption || parsed.postCaption || "").trim(),
    hashtags: normalizeHashtags(parsed.hashtags),
    settings: {
      ...EMPTY_POST.settings,
      ...(parsed.settings || {}),
    },
    slides: parsed.slides.map(normalizeSlide),
  };
}

export default function JsonImportPanel({ onImport, onCancel }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(false);

  const lineCount = useMemo(() => value.split("\n").length, [value]);

  const importPost = () => {
    try {
      const post = parseSocialPostImport(value);
      setError("");
      setValid(true);
      onImport(post);
    } catch (err) {
      setValid(false);
      setError(err instanceof Error ? err.message : "Could not import this JSON.");
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-card p-4 dark:border-zinc-800">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <FileJson2 size={17} />
            Import post from JSON
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Paste one complete post object. It will be validated and loaded into the
            Studio for preview before you save it.
          </p>
        </div>
        <Button variant="outline" onClick={() => setValue(SAMPLE)}>
          Load sample
        </Button>
      </div>

      <Textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
          setValid(false);
        }}
        spellCheck={false}
        placeholder={SAMPLE}
        className="min-h-80 resize-y font-mono text-xs leading-5"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {lineCount} {lineCount === 1 ? "line" : "lines"}
          {error ? (
            <span className="ml-3 inline-flex items-center gap-1 text-destructive">
              <AlertCircle size={13} /> {error}
            </span>
          ) : valid ? (
            <span className="ml-3 inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={13} /> Valid post loaded
            </span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={importPost} disabled={!value.trim()}>
            Validate &amp; Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
