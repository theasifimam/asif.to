"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  FileJson2,
  Sparkles,
} from "lucide-react";
import { Button, Textarea } from "../ui";
import { TEMPLATE_MAP } from "./templates/registry";
import { EMPTY_POST } from "./hooks/useSocialPost";
import {
  SOCIAL_POST_SAMPLES,
  getSocialPostSample,
  stringifySocialPostSample,
} from "./sampleObjects";

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

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `slide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function stripCodeFence(value) {
  const trimmed = value.trim();
  const fenced = trimmed.match(
    /^```(?:json|javascript|js)?\s*([\s\S]*?)\s*```$/i,
  );
  return fenced ? fenced[1].trim() : trimmed;
}

function normalizeFormat(value) {
  if (!value) return EMPTY_POST.format;

  const normalized = String(value).trim().toLowerCase();
  return FORMAT_ALIASES[normalized] || EMPTY_POST.format;
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

  const normalized = {
    ...slide,
    id: slide.id || uid(),
    order: index,
    template,
  };

  if (slide.code) {
    normalized.code = {
      language: slide.code.language || "javascript",
      filename: slide.code.filename || "",
      content: slide.code.content || "",
      highlightLines: Array.isArray(slide.code.highlightLines)
        ? slide.code.highlightLines
        : Array.isArray(slide.highlightLines)
          ? slide.highlightLines
          : [],
      showLineNumbers: slide.code.showLineNumbers !== false,
    };
  }

  return normalized;
}

export function parseSocialPostImport(raw) {
  if (!raw.trim()) {
    throw new Error("Paste a social post JSON object first.");
  }

  let parsed;

  try {
    parsed = JSON.parse(stripCodeFence(raw));
  } catch {
    throw new Error(
      "Invalid JSON. Ask AI to return only valid JSON using double quotes.",
    );
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The imported value must be one post object.");
  }

  if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("The post must contain at least one slide.");
  }

  if (parsed.slides.length > 20) {
    throw new Error("A social post can contain at most 20 slides.");
  }

  const name = String(
    parsed.name || parsed.internalPostName || "Untitled social post",
  ).trim();

  if (!name) {
    throw new Error("Post name cannot be empty.");
  }

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

export default function JsonImportPanel({ onImport }) {
  const [sampleId, setSampleId] = useState("educational-carousel");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedSample = getSocialPostSample(sampleId);

  const lineCount = useMemo(
    () => (value ? value.split("\n").length : 0),
    [value],
  );

  const loadSample = (id = sampleId) => {
    setSampleId(id);
    setValue(stringifySocialPostSample(id));
    setError("");
  };

  const copySample = async () => {
    const sample = stringifySocialPostSample(sampleId);

    try {
      await navigator.clipboard.writeText(sample);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setValue(sample);
    }
  };

  const importPost = () => {
    try {
      const post = parseSocialPostImport(value);
      setError("");
      onImport(post);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not import this JSON.",
      );
    }
  };

  return (
    <div className="admin-surface overflow-hidden">
      <div className="border-b border-zinc-200/80 p-5 dark:border-zinc-800 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold">Create with AI JSON</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Choose the kind of post you want, copy its sample structure to
              ChatGPT, then paste the completed JSON back here.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                1
              </span>
              <span className="text-sm font-semibold">
                Choose a post format
              </span>
            </div>

            <select
              value={sampleId}
              onChange={(event) => {
                const next = event.target.value;
                setSampleId(next);
                loadSample(next);
              }}
              className="w-full rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800"
            >
              {SOCIAL_POST_SAMPLES.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.label}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {selectedSample.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => loadSample()}>
                <FileJson2 size={15} />
                Load sample
              </Button>

              <Button variant="outline" onClick={copySample}>
                <Clipboard size={15} />
                {copied ? "Copied" : "Copy sample"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-muted/30 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                2
              </span>
              <span className="text-sm font-semibold">
                Ask AI to fill the sample
              </span>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Give the copied structure to ChatGPT with your topic. For example:
            </p>

            <div className="mt-2 rounded-lg border bg-background p-3 text-xs leading-5">
              Create a post about <strong>React useEffect cleanup</strong> using
              exactly this JSON structure. Keep it concise and technically
              accurate. Return only valid JSON.
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-muted/30 p-4 dark:border-zinc-800">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                3
              </span>
              <span className="text-sm font-semibold">
                Paste and validate
              </span>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Paste AI's completed JSON on the right. The Studio validates it
              before opening the editor, and nothing is saved yet.
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold">Post JSON</label>
            <span className="text-xs text-muted-foreground">
              {lineCount ? `${lineCount} lines` : "Waiting for JSON"}
            </span>
          </div>

          <Textarea
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            spellCheck={false}
            placeholder="Paste the completed JSON object here..."
            className="min-h-[470px] resize-y rounded-xl font-mono text-xs leading-5"
          />

          {error && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button onClick={importPost} disabled={!value.trim()}>
              <CheckCircle2 size={16} />
              Validate &amp; open editor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
