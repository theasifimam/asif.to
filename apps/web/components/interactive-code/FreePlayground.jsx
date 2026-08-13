"use client";

import { useState } from "react";
import InteractiveCode from "./InteractiveCode";
import { FREE_PLAYGROUND_MODES } from "@/lib/playground/freePlaygroundTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FreePlayground({ fillViewport = false }) {
  const [language, setLanguage] = useState("javascript");
  const selected = FREE_PLAYGROUND_MODES[language];

  return (
    <section aria-labelledby="playground-workspace">
      <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label
            htmlFor="playground-language"
            className="block text-xs font-black uppercase tracking-wider text-zinc-500"
          >
            Technology
          </label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger id="playground-language" className="mt-2 min-w-64">
              <SelectValue placeholder="Select a technology" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FREE_PLAYGROUND_MODES).map(([value, mode]) => (
                <SelectItem value={value} key={value}>
                  {mode.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {selected.description}
        </p>
      </div>
      <h2 id="playground-workspace" className="sr-only">
        Editable code and output workspace
      </h2>
      <InteractiveCode
        key={language}
        language={language}
        files={selected.files}
        title={`${selected.label} Playground`}
        fillViewport={fillViewport}
      />
    </section>
  );
}
