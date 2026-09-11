"use client";

import React from "react";
import { SandpackCodeEditor } from "@codesandbox/sandpack-react";
import FileExplorer from "./FileExplorer";

export default function WorkspaceEditorPanel({
  panel,
  setPanel,
  explorerOpen,
  isDark,
  fontSize,
}) {
  return (
    <div
      className={`${
        panel === "code" || panel === "files"
          ? "flex flex-col w-full"
          : "hidden"
      } min-h-0 min-w-0 flex-1 lg:grid ${
        explorerOpen ? "lg:grid-cols-[190px_minmax(0,1fr)]" : "lg:grid-cols-1"
      }`}
    >
      <div
        className={`${
          panel === "files" ? "block w-full" : "hidden"
        } h-full min-h-0 ${explorerOpen ? "lg:block" : "lg:hidden"}`}
      >
        <FileExplorer isDark={isDark} onFileSelect={() => setPanel("code")} />
      </div>
      <div
        className={`${
          panel === "code" ? "block w-full" : "hidden"
        } h-full min-h-0 min-w-0 lg:block`}
      >
        <SandpackCodeEditor
          showTabs={false}
          showLineNumbers
          wrapContent={true}
          style={{ height: "100%", fontSize }}
        />
      </div>
    </div>
  );
}
