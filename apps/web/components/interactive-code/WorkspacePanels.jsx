"use client";

import { useState } from "react";
import { executeCurrentFiles } from "./sandpackConfig";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { copyWorkspaceFiles, downloadWorkspaceFiles } from "./workspaceExportUtils";
import WorkspaceEditorPanel from "./WorkspaceEditorPanel";
import WorkspaceSplitResizer from "./WorkspaceSplitResizer";
import WorkspaceOutputPanel from "./WorkspaceOutputPanel";
import MobileFloatingDock from "./MobileFloatingDock";

export function WorkspacePanels({ workspace }) {
  const { requireAuth } = useAuthPrompt();
  const {
    state: {
      panel,
      split,
      outputSplit,
      fontSize,
      fullscreen,
      explorerOpen,
      consoleOpen,
      runtimeIssue,
      device,
      tests,
      customInput,
      customOutput,
      previewBusy,
      shareStatus,
      formatting,
    },
    setters: { setPanel, setDevice, setCustomInput, setFontSize, setConsoleOpen },
    refs: { splitRef, outputRef, workspaceRef },
    computed: { isDark, consoleFirst },
    handlers: {
      runTests,
      runCustom,
      startResize,
      moveResize,
      stopResize,
      reset,
      formatActive,
      share,
      toggleFullscreen,
    },
    sandpack,
    language,
    title,
    testCases,
    runtimeAdapter,
    executionEnabled,
  } = workspace;

  const [executing, setExecuting] = useState(false);
  const isRunning = executing || runtimeAdapter?.status === "loading";

  const handleRun = async () => {
    if (executionEnabled === false) return;
    if (isRunning) return;
    if (!requireAuth()) return;
    if (consoleFirst) {
      setConsoleOpen(true);
    }
    if (runtimeAdapter) {
      setPanel("console");
      runtimeAdapter.run();
      return;
    }
    setExecuting(true);
    setPanel(consoleFirst ? "console" : "preview");
    try {
      await executeCurrentFiles(sandpack);
    } catch {
      // ignore
    } finally {
      setTimeout(() => setExecuting(false), 500);
    }
  };

  const handleRunTests = () => {
    if (executionEnabled === false || !requireAuth()) return;
    runTests();
  };

  const handleRunCustom = () => {
    if (executionEnabled === false || !requireAuth()) return;
    runCustom();
  };

  const handleCopy = () => copyWorkspaceFiles(sandpack);
  const handleDownload = () => downloadWorkspaceFiles(sandpack, title);

  const isOutputPanelVisible = consoleFirst ? consoleOpen : true;

  return (
    <div
      ref={splitRef}
      className={`relative flex min-h-0 flex-1 flex-col transition-colors lg:grid ${
        isDark ? "bg-zinc-950" : "bg-zinc-100"
      }`}
      style={{
        gridTemplateColumns: isOutputPanelVisible
          ? `${split}% 8px minmax(0, 1fr)`
          : "1fr",
      }}
    >
      {/* Left Side: File Explorer + Code Editor */}
      <WorkspaceEditorPanel
        panel={panel}
        setPanel={setPanel}
        explorerOpen={explorerOpen}
        isDark={isDark}
        fontSize={fontSize}
      />

      {/* Desktop Split Resize Bar */}
      {isOutputPanelVisible && (
        <WorkspaceSplitResizer
          direction="horizontal"
          isDark={isDark}
          startResize={startResize}
          moveResize={moveResize}
          stopResize={stopResize}
        />
      )}

      {/* Right Side: Output (Preview & Console & Tests) */}
      <WorkspaceOutputPanel
        outputRef={outputRef}
        isDark={isDark}
        panel={panel}
        isOutputPanelVisible={isOutputPanelVisible}
        consoleFirst={consoleFirst}
        consoleOpen={consoleOpen}
        setConsoleOpen={setConsoleOpen}
        outputSplit={outputSplit}
        previewBusy={previewBusy}
        device={device}
        setDevice={setDevice}
        sandpack={sandpack}
        language={language}
        runtimeIssue={runtimeIssue}
        runtimeAdapter={runtimeAdapter}
        startResize={startResize}
        moveResize={moveResize}
        stopResize={stopResize}
        tests={tests}
        testCases={testCases}
        executionEnabled={executionEnabled}
        handleRunTests={handleRunTests}
        customInput={customInput}
        setCustomInput={setCustomInput}
        handleRunCustom={handleRunCustom}
        customOutput={customOutput}
      />

      {/* Mobile Floating Island Control Dock */}
      <MobileFloatingDock
        isDark={isDark}
        handleRun={handleRun}
        isRunning={isRunning}
        executionEnabled={executionEnabled}
        reset={reset}
        panel={panel}
        setPanel={setPanel}
        consoleFirst={consoleFirst}
        workspaceRef={workspaceRef}
        formatting={formatting}
        formatActive={formatActive}
        share={share}
        shareStatus={shareStatus}
        handleCopy={handleCopy}
        handleDownload={handleDownload}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fullscreen={fullscreen}
        toggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
