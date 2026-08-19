"use client";

import { getTemplate } from "./templates/registry";

const baseInput =
  "w-full rounded-lg border border-zinc-200/90 dark:border-zinc-800 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/25";

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted-foreground">
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
  const fields = getTemplate(slide.template).supportedFields;
  const set = (key, value) => onChange({ [key]: value });

  return (
    <div className="space-y-4">
      {fields.includes("eyebrow") && (
        <Field label="Eyebrow">
          <Input
            value={slide.eyebrow || ""}
            onChange={(e) => set("eyebrow", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("title") && (
        <Field label="Title">
          <Textarea
            value={slide.title || ""}
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("subtitle") && (
        <Field label="Subtitle">
          <Textarea
            value={slide.subtitle || ""}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("body") && (
        <Field label="Body">
          <Textarea
            value={slide.body || ""}
            onChange={(e) => set("body", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("highlightedText") && (
        <Field label="Highlighted text">
          <Textarea
            value={slide.highlightedText || ""}
            onChange={(e) => set("highlightedText", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("quote") && (
        <Field label="Quote">
          <Textarea
            value={slide.quote || ""}
            onChange={(e) => set("quote", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("author") && (
        <Field label="Author">
          <Input
            value={slide.author || ""}
            onChange={(e) => set("author", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("stepNumber") && (
        <Field label="Step number">
          <Input
            type="number"
            min="1"
            value={slide.stepNumber || ""}
            onChange={(e) => set("stepNumber", Number(e.target.value) || null)}
          />
        </Field>
      )}

      {fields.includes("cta") && (
        <Field label="CTA">
          <Input
            value={slide.cta || ""}
            onChange={(e) => set("cta", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("url") && (
        <Field label="URL">
          <Input
            value={slide.url || ""}
            onChange={(e) => set("url", e.target.value)}
          />
        </Field>
      )}

      {fields.includes("bulletPoints") && (
        <Field label="Bullets — one per line">
          <Textarea
            value={(slide.bulletPoints || []).join("\n")}
            onChange={(e) =>
              set("bulletPoints", e.target.value.split("\n").filter(Boolean))
            }
          />
        </Field>
      )}

      {fields.includes("comparisonLeft") && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {["comparisonLeft", "comparisonRight"].map((key) => (
            <div
              key={key}
              className="space-y-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 p-3"
            >
              <Input
                placeholder="Label"
                value={slide[key]?.label || ""}
                onChange={(e) =>
                  set(key, {
                    ...(slide[key] || {}),
                    label: e.target.value,
                  })
                }
              />

              <Textarea
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
        <div className="space-y-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 p-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Language"
              value={slide.code?.language || "javascript"}
              onChange={(e) =>
                set("code", {
                  ...(slide.code || {}),
                  language: e.target.value,
                })
              }
            />

            <Input
              placeholder="Filename"
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
            className="min-h-52 rounded-lg border border-zinc-200/90 dark:border-zinc-800 font-mono"
            placeholder="Code"
            value={slide.code?.content || ""}
            onChange={(e) =>
              set("code", {
                ...(slide.code || {}),
                content: e.target.value,
              })
            }
          />

          <Input
            placeholder="Highlight lines e.g. 2,4,5"
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

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
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
      )}
    </div>
  );
}
