"use client";

import { useMemo, useState } from "react";

import { SandpackProvider } from "@codesandbox/sandpack-react";
import {
  normalizeFiles,
  VSCODE_DARK_THEME,
  VSCODE_LIGHT_THEME,
} from "./sandpackConfig";
import { sandpackTemplateFor } from "@/lib/playground/config";

import Workspace from "./Workspace";
import ChapterWorkspace from "./ChapterWorkspace";

export default function InteractiveCodeSandbox({
  language = "javascript",
  languageOptions,
  onLanguageChange,
  code,
  files,
  title,
  fillViewport = false,
  playgroundId,
  testCases = [],
  executionEnabled = true,
  compact = false,
}) {
  const [editorTheme, setEditorTheme] = useState("dark");
  const initialFiles = useMemo(
    () => normalizeFiles(language, code, files),
    [language, code, files],
  );
  const stablePlaygroundId = useMemo(() => {
    if (playgroundId) return playgroundId;
    const signature = `${title || "playground"}:${language}:${Object.entries(
      initialFiles,
    )
      .map(([path, value]) => `${path}:${value.code ?? value}`)
      .join("|")}`;
    let hash = 0;
    for (let index = 0; index < signature.length; index += 1)
      hash = ((hash << 5) - hash + signature.charCodeAt(index)) | 0;
    return `${String(title || "playground")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Math.abs(hash)}`;
  }, [initialFiles, language, playgroundId, title]);

  return (
    <SandpackProvider
      key={`${playgroundId || "playground"}-${language}-${Object.keys(initialFiles).join("-")}`}
      template={sandpackTemplateFor(language)}
      files={initialFiles}
      theme={editorTheme === "dark" ? VSCODE_DARK_THEME : VSCODE_LIGHT_THEME}
      options={{
        // Keep compilation manual. Starting Parcel while saved files are still
        // being restored can strand the preview in its loading state.
        autorun: false,
        recompileMode: "delayed",
        recompileDelay: 2147000000,
      }}
    >
      {compact ? (
        <ChapterWorkspace
          language={language}
          title={title}
          executionEnabled={executionEnabled}
        />
      ) : (
      <Workspace
        language={language}
        languageOptions={languageOptions}
        onLanguageChange={onLanguageChange}
        title={title}
        editorTheme={editorTheme}
        onThemeChange={() =>
          setEditorTheme((value) => (value === "dark" ? "light" : "dark"))
        }
        fillViewport={fillViewport}
        playgroundId={stablePlaygroundId}
        starterFiles={initialFiles}
        testCases={testCases}
        executionEnabled={executionEnabled}
      />
      )}
    </SandpackProvider>
  );
}
