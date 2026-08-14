import { Loader2 } from "lucide-react";
import Toolbar from "./Toolbar";
import { useWorkspace } from "./useWorkspace";
import { MobileNavigation } from "./MobileNavigation";
import { WorkspacePanels } from "./WorkspacePanels";
import { ErrorBanner } from "./ErrorBanner";
import { WorkspaceFooter } from "./WorkspaceFooter";

function Workspace(props) {
  const workspace = useWorkspace(props);
  const {
    state: {
      fontSize,
      fullscreen,
      explorerOpen,
      saveStatus,
      shareStatus,
      formatting,
      restoring,
      resetOpen,
    },
    setters: { setPanel, setFontSize, setExplorerOpen, setRuntimeIssue },
    refs: { workspaceRef },
    computed: { isDark, consoleFirst },
    handlers: { toggleFullscreen, formatActive, reset, confirmReset, share },
    language,
    title,
  } = workspace;

  return (
    <div
      ref={workspaceRef}
      data-editor-theme={props.editorTheme}
      className={`asif-playground relative flex flex-col overflow-hidden border shadow-2xl transition-colors ${
        isDark
          ? "border-[#3c3c3c] bg-[#1e1e1e] text-white"
          : "border-zinc-300 bg-white text-zinc-900"
      } ${
        fullscreen
          ? "fixed inset-0 z-100 h-screen rounded-none"
          : props.fillViewport
            ? "h-[calc(100dvh-130px)] min-h-120 rounded-2xl sm:rounded-3xl"
            : "min-h-115 h-[68vh] max-h-175 lg:h-130 rounded-2xl sm:rounded-3xl"
      }`}
    >
      {workspace.state.resizeAxis && (
        <div
          className={`pointer-events-none absolute inset-0 z-50 ${
            workspace.state.resizeAxis === "horizontal"
              ? "cursor-col-resize"
              : "cursor-row-resize"
          }`}
          aria-hidden="true"
        />
      )}

      {/* Top Header Toolbar */}
      <Toolbar
        title={title}
        language={language}
        languageOptions={props.languageOptions}
        onLanguageChange={props.onLanguageChange}
        onSelect={(value) =>
          setPanel(consoleFirst && value === "preview" ? "console" : value)
        }
        fullscreen={fullscreen}
        onFullscreen={toggleFullscreen}
        fontSize={fontSize}
        setFontSize={setFontSize}
        editorTheme={props.editorTheme}
        onThemeChange={props.onThemeChange}
        onResetLayout={() => {
          workspace.setters.setSplit(50);
          workspace.setters.setOutputSplit(68);
          setExplorerOpen(true);
        }}
        explorerOpen={explorerOpen}
        onToggleExplorer={() => setExplorerOpen((value) => !value)}
        onRuntimeIssue={setRuntimeIssue}
        onFormat={formatActive}
        onReset={reset}
        onShare={share}
        shareStatus={shareStatus}
        saveStatus={saveStatus}
        formatting={formatting}
        runtimeAdapter={workspace.runtimeAdapter}
      />

      {restoring && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/75 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-bold text-white shadow-xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Restoring your code...
          </div>
        </div>
      )}

      <MobileNavigation workspace={workspace} />
      <WorkspacePanels workspace={workspace} />
      <ErrorBanner workspace={workspace} />

      {resetOpen && (
        <div
          className="absolute inset-0 z-50 grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-title"
        >
          <div
            className={`max-w-sm rounded-2xl border p-5 shadow-2xl ${isDark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`}
          >
            <h2 id="reset-title" className="font-black">
              Reset code?
            </h2>
            <p className="mt-2 text-sm opacity-75">
              Your current changes will be replaced with the starter code.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => workspace.setters.setResetOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkspaceFooter workspace={workspace} />

      <style jsx global>{`
        .asif-playground .sp-console-item::after {
          display: none !important;
        }
        .asif-playground .sp-console-item {
          border: 0 !important;
          padding-block: 6px !important;
        }
        .asif-playground[data-editor-theme="dark"] .sp-console-list {
          background: #1e1e1e !important;
          color: #d4d4d4 !important;
        }
        .asif-playground[data-editor-theme="light"] .sp-console-list {
          background: #ffffff !important;
          color: #1f1f1f !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-activeLine {
          background: #2a2d2e !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-gutters {
          background: #1e1e1e !important;
          border-right: 1px solid #333 !important;
        }
        .asif-playground[data-editor-theme="dark"] .cm-selectionBackground,
        .asif-playground[data-editor-theme="dark"] .cm-content ::selection {
          background: #264f78 !important;
          color: #ffffff !important;
        }
        .asif-playground * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .asif-playground *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .asif-playground .cm-scroller,
        .asif-playground .sp-console-list,
        .asif-playground .sp-preview-container {
          overflow: auto !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-activeLine {
          background: #f0f0f0 !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-gutters {
          background: #ffffff !important;
          border-right-color: #e5e5e5 !important;
        }
        .asif-playground[data-editor-theme="light"] .cm-selectionBackground,
        .asif-playground[data-editor-theme="light"] .cm-content ::selection {
          background: #add6ff !important;
          color: #111111 !important;
        }
        @media (min-width: 1024px) {
          .asif-playground .playground-output-split {
            display: grid !important;
            grid-template-rows: minmax(0, var(--preview-size)) 8px minmax(
                0,
                calc(100% - var(--preview-size) - 8px)
              );
          }
        }
      `}</style>
    </div>
  );
}

export default Workspace;
