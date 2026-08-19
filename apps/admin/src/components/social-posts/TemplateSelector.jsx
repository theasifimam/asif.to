"use client";

import { useState } from "react";
import TEMPLATES, { TEMPLATE_CATEGORIES } from "./templates/registry";
import { Button } from "../ui";

export default function TemplateSelector({ value, onChange }) {
  const [category, setCategory] = useState("all");

  const templates =
    category === "all"
      ? TEMPLATES
      : TEMPLATES.filter((template) => template.category === category);

  return (
    <div className="space-y-3">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {TEMPLATE_CATEGORIES.map((item) => {
          const isActive = category === item.id;

          return (
            <Button
              key={item.id}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(item.id)}
              className="rounded-full px-3 text-xs"
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {templates.map((template) => {
          const isSelected = value === template.id;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange?.(template.id)}
              className={`
                w-full rounded-xl border p-3 text-left transition-all
                ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border border-zinc-200/90 dark:border-zinc-800 bg-background hover:border-primary/40 hover:bg-muted/50"
                }
              `}
            >
              <div className="text-sm font-semibold leading-tight">
                {template.name}
              </div>

              <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {template.description}
              </div>
            </button>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
          No templates found in this category.
        </div>
      )}
    </div>
  );
}
