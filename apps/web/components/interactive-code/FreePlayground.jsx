"use client";

import { useMemo, useState } from "react";
import InteractiveCode from "./InteractiveCode";
import { FREE_PLAYGROUND_MODES } from "@/lib/playground/freePlaygroundTemplates";

export default function FreePlayground({ fillViewport = false }) {
  const [language, setLanguage] = useState("javascript");
  const selected = FREE_PLAYGROUND_MODES[language];

  const languageOptions = useMemo(
    () =>
      Object.entries(FREE_PLAYGROUND_MODES).map(([value, mode]) => ({
        value,
        label: mode.label,
        description: mode.description,
      })),
    [],
  );

  return (
    <section aria-labelledby="playground-workspace" className="w-full">
      <h2 id="playground-workspace" className="sr-only">
        Editable code and output workspace
      </h2>
      <InteractiveCode
        language={language}
        languageOptions={languageOptions}
        onLanguageChange={setLanguage}
        files={selected.files}
        title={`${selected.label} Playground`}
        fillViewport={fillViewport}
      />
    </section>
  );
}
