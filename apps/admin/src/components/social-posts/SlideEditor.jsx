"use client";

import { getTemplate } from "./templates/registry";

const baseInput =
  "w-full rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-background px-3.5 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/25 transition-all";

function Field({ label, children, className = "" }) {
  return (
    <label className={`block space-y-1.5 ${className}`}>
      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input(props) {
  return <input className={baseInput} {...props} />;
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`${baseInput} min-h-24 resize-y ${className}`}
      {...props}
    />
  );
}

export default function SlideEditor({ slide, onChange }) {
  const templateObj = getTemplate(slide.template);
  const fields = templateObj.supportedFields;
  const set = (key, value) => onChange({ [key]: value });

  return (
    <div className="space-y-5">
      {/* Header Info Badge */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60 text-xs">
        <span className="font-bold text-zinc-500">
          Editing Fields for: <strong className="text-primary">{templateObj.name}</strong>
        </span>
        <span className="text-[11px] text-muted-foreground font-medium">
          {fields.length} active field{fields.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Grid for top short fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.includes("eyebrow") && (
          <Field label="Eyebrow / Badge">
            <Input
              placeholder="e.g. REACT TIPS"
              value={slide.eyebrow || ""}
              onChange={(e) => set("eyebrow", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("author") && (
          <Field label="Author / Credit">
            <Input
              placeholder="e.g. Asif Imam"
              value={slide.author || ""}
              onChange={(e) => set("author", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("stepNumber") && (
          <Field label="Step Number">
            <Input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={slide.stepNumber || ""}
              onChange={(e) => set("stepNumber", Number(e.target.value) || null)}
            />
          </Field>
        )}

        {fields.includes("cta") && (
          <Field label="Call to Action (CTA)">
            <Input
              placeholder="e.g. Save for later"
              value={slide.cta || ""}
              onChange={(e) => set("cta", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("url") && (
          <Field label="Target URL">
            <Input
              placeholder="e.g. asif.to/react"
              value={slide.url || ""}
              onChange={(e) => set("url", e.target.value)}
            />
          </Field>
        )}
      </div>

      {/* Main Text Content Fields */}
      <div className="space-y-4">
        {fields.includes("title") && (
          <Field label="Slide Title">
            <Textarea
              className="min-h-20 font-semibold"
              placeholder="Enter main title..."
              value={slide.title || ""}
              onChange={(e) => set("title", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("subtitle") && (
          <Field label="Subtitle">
            <Textarea
              className="min-h-20"
              placeholder="Enter supporting subtitle..."
              value={slide.subtitle || ""}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("body") && (
          <Field label="Body Content">
            <Textarea
              className="min-h-28"
              placeholder="Enter main paragraph text..."
              value={slide.body || ""}
              onChange={(e) => set("body", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("highlightedText") && (
          <Field label="Highlighted Key Takeaway">
            <Textarea
              className="min-h-20 font-medium"
              placeholder="Text to highlight..."
              value={slide.highlightedText || ""}
              onChange={(e) => set("highlightedText", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("quote") && (
          <Field label="Quote Text">
            <Textarea
              className="min-h-24 italic"
              placeholder="Enter quote..."
              value={slide.quote || ""}
              onChange={(e) => set("quote", e.target.value)}
            />
          </Field>
        )}

        {fields.includes("bulletPoints") && (
          <Field label="Bullet Points (One item per line)">
            <Textarea
              className="min-h-32 font-medium"
              placeholder="First point&#10;Second point&#10;Third point"
              value={(slide.bulletPoints || []).join("\n")}
              onChange={(e) =>
                set("bulletPoints", e.target.value.split("\n").filter(Boolean))
              }
            />
          </Field>
        )}

        {fields.includes("comparisonLeft") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["comparisonLeft", "comparisonRight"].map((key, idx) => (
              <div
                key={key}
                className="space-y-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 bg-muted/20"
              >
                <div className="text-xs font-bold text-primary">
                  {idx === 0 ? "Side A (e.g. DO / GOOD)" : "Side B (e.g. DON'T / BAD)"}
                </div>
                <Input
                  placeholder="Column Header Label"
                  value={slide[key]?.label || ""}
                  onChange={(e) =>
                    set(key, {
                      ...(slide[key] || {}),
                      label: e.target.value,
                    })
                  }
                />

                <Textarea
                  className="min-h-28"
                  placeholder="Items, one per line"
                  value={(slide[key]?.items || []).join("\n")}
                  onChange={(e) =>
                    set(key, {
                      ...(slide[key] || {}),
                      items: e.target.value.split("\n").filter(Boolean),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}

        {fields.includes("code") && (
          <div className="space-y-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Code Snippet Editor
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-zinc-300"
                  checked={slide.code?.showLineNumbers !== false}
                  onChange={(e) =>
                    set("code", {
                      ...(slide.code || {}),
                      showLineNumbers: e.target.checked,
                    })
                  }
                />
                Show line numbers
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Language (e.g. javascript, tsx)"
                value={slide.code?.language || "javascript"}
                onChange={(e) =>
                  set("code", {
                    ...(slide.code || {}),
                    language: e.target.value,
                  })
                }
              />

              <Input
                placeholder="Filename (e.g. App.jsx)"
                value={slide.code?.filename || ""}
                onChange={(e) =>
                  set("code", {
                    ...(slide.code || {}),
                    filename: e.target.value,
                  })
                }
              />
            </div>

            <Textarea
              className="min-h-48 rounded-xl font-mono text-xs leading-relaxed bg-zinc-950 text-zinc-100 dark:bg-black p-3.5"
              placeholder="// Enter code here..."
              value={slide.code?.content || ""}
              onChange={(e) =>
                set("code", {
                  ...(slide.code || {}),
                  content: e.target.value,
                })
              }
            />

            <Input
              placeholder="Highlight lines e.g. 2, 4, 5"
              value={(slide.code?.highlightLines || []).join(",")}
              onChange={(e) =>
                set("code", {
                  ...(slide.code || {}),
                  highlightLines: e.target.value
                    .split(",")
                    .map((value) => Number(value.trim()))
                    .filter(Boolean),
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
