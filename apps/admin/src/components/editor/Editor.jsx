"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { memo, useEffect, useRef, useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-125 w-full bg-zinc-50 dark:bg-zinc-900/20 animate-pulse rounded-3xl" />
  ),
});

const Editor = memo(function Editor({ value, onChange, placeholder }) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState(value || "");
  const latestValue = useRef(value || "");
  const timer = useRef(null);

  useEffect(() => {
    const next = value || "";
    if (next !== latestValue.current) {
      latestValue.current = next;
      setDraft(next);
    }
  }, [value]);

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const handleChange = (nextValue) => {
    const next = nextValue || "";
    latestValue.current = next;
    setDraft(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), 150);
  };

  return (
    <div
      className="md-editor-wrapper"
      data-color-mode={theme === "dark" ? "dark" : "light"}
    >
      <MDEditor
        value={draft}
        onChange={handleChange}
        preview="edit"
        height={500}
        className="w-full font-inter"
        textareaProps={{
          placeholder: placeholder || "START WRITING...",
        }}
      />

      <style jsx global>{`
        .md-editor-wrapper {
          --md-border-color: #e4e4e7; /* zinc-200 */
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .md-editor-wrapper[data-color-mode="dark"] {
          --md-border-color: #27272a; /* zinc-800 */
        }

        .w-md-editor {
          border: 1px solid var(--md-border-color) !important;
          border-radius: 1.5rem !important;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        /* Toolbar wrapping so options flow into multiple lines instead of horizontal scrolling */
        .w-md-editor-toolbar {
          border-bottom: 1px solid var(--md-border-color) !important;
          padding: 0.5rem 0.75rem !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          
          overflow-x: visible !important;
          white-space: normal !important;
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: flex-start !important;
          align-items: center !important;
          gap: 0.35rem 0.5rem !important;
        }

        .w-md-editor-toolbar::-webkit-scrollbar {
          display: none !important; /* Hide scrollbar Chrome/Safari */
        }

        /* Allow toolbar list items to wrap cleanly onto a second line */
        .w-md-editor-toolbar ul {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 0.25rem !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .w-md-editor-toolbar ul li {
          display: inline-block !important;
          flex-shrink: 0 !important;
        }

        .w-md-editor-toolbar ul li button {
          width: 32px !important;
          height: 32px !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 0.5rem !important;
          background: transparent !important;
        }

        .w-md-editor-content {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .w-md-editor-text {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
        }

        .w-md-editor-text textarea {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
        }

        .md-editor-wrapper[data-color-mode="dark"] .w-md-editor {
          box-shadow: none;
          background: #09090b !important;
        }

        .md-editor-wrapper[data-color-mode="dark"] .w-md-editor-toolbar {
          background: #09090b !important;
        }

        .wmde-markdown pre {
          border-radius: 1rem !important;
        }

        /* Customize syntax highlighting theme in dark mode */
        .md-editor-wrapper[data-color-mode="dark"] .wmde-markdown pre {
          background-color: #0b0e14 !important;
          border: 1px solid #1a1f26 !important;
        }

        /* Mobile layout optimizations */
        @media (max-width: 640px) {
          .w-md-editor {
            display: flex !important;
            flex-direction: column !important;
            height: 380px !important;
            border-radius: 1.25rem !important;
          }

          .w-md-editor-content {
            order: 1 !important;
            flex: 1 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            min-height: 0 !important;
          }

          /* Place toolbar at the bottom of the editor container */
          .w-md-editor-toolbar {
            order: 2 !important;
            border-bottom: none !important;
            border-top: 1px solid var(--md-border-color) !important;
            padding: 0.4rem 0.5rem !important;
            background: #ffffff !important;
          }

          .w-md-editor-toolbar ul li button:active {
            background: #f4f4f5 !important;
          }

          /* Dark Mode Toolbar for Mobile */
          .md-editor-wrapper[data-color-mode="dark"] .w-md-editor-toolbar {
            background: #09090b !important;
          }

          .md-editor-wrapper[data-color-mode="dark"] .w-md-editor-toolbar ul li button:active {
            background: #18181b !important;
          }

          /* Prevent iOS browser auto-zoom on textarea focus */
          .w-md-editor-text textarea {
            font-size: 16px !important;
            line-height: 1.5 !important;
            padding: 0.75rem !important;
          }
        }

        /* Fullscreen Mode Styling */
        .md-editor-wrapper.fullscreen {
          position: fixed !important;
          inset: 0 !important;
          z-index: 9999 !important;
          height: 100dvh !important;
          width: 100vw !important;
          background: #ffffff !important;
          padding: 1rem !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }

        .md-editor-wrapper.fullscreen[data-color-mode="dark"] {
          background: #09090b !important;
        }

        .md-editor-wrapper.fullscreen .w-md-editor {
          height: 100% !important;
          flex: 1 !important;
          border-radius: 1rem !important;
        }

        @media (max-width: 640px) {
          .md-editor-wrapper.fullscreen {
            padding: 0.5rem !important;
          }
          .md-editor-wrapper.fullscreen .w-md-editor {
            border-radius: 0.75rem !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
});

const MDEditorMarkdown = dynamic(
  () =>
    import("@uiw/react-md-editor").then(
      (module) => module.default?.Markdown || module.Markdown,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-16 w-full bg-zinc-50 dark:bg-zinc-900/20 animate-pulse rounded-2xl" />
    ),
  },
);

export const MarkdownPreview = memo(function MarkdownPreview({
  source,
  placeholder = "No description provided.",
}) {
  const { theme } = useTheme();
  const [mdSource, setMdSource] = useState(source || "");

  useEffect(() => {
    setMdSource(source || "");
  }, [source]);

  if (!mdSource?.trim()) {
    return (
      <p className="text-xs text-zinc-400 dark:text-zinc-500 italic p-1">
        {placeholder}
      </p>
    );
  }

  return (
    <div
      className="md-editor-wrapper"
      data-color-mode={theme === "dark" ? "dark" : "light"}
    >
      <MDEditorMarkdown
        source={mdSource}
        className="wmde-markdown font-inter bg-transparent p-1 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100"
        style={{ backgroundColor: "transparent", color: "inherit" }}
      />
    </div>
  );
});

export default Editor;

