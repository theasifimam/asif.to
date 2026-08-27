"use client";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-95 w-full animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
  ),
});

export default function LibraryEditor({ value, onChange, placeholder }) {
  const { theme } = useTheme();
  const [draft, setDraft] = useState(value || "");
  const latest = useRef(value || "");
  const timer = useRef(null);
  useEffect(() => {
    if ((value || "") !== latest.current) {
      latest.current = value || "";
      setDraft(value || "");
    }
  }, [value]);
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);
  const change = (next) => {
    const text = next || "";
    latest.current = text;
    setDraft(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(text), 150);
  };
  return (
    <div
      className="w-full min-w-0"
      data-color-mode={theme === "dark" ? "dark" : "light"}
    >
      <div className="mb-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
          Markdown editor
        </span>
      </div>
      <MDEditor
        value={draft}
        onChange={change}
        preview="edit"
        height={500}
        textareaProps={{ placeholder: placeholder || "Start writing…" }}
      />
      <style jsx global>{`
        [data-color-mode] .w-md-editor {
          border-radius: 1.5rem !important;
          width: 100% !important;
          min-width: 0 !important;
          overflow: hidden;
        }
        [data-color-mode] .w-md-editor-toolbar {
          display: flex !important;
          flex-wrap: wrap !important;
          white-space: normal !important;
          gap: 0.25rem;
        }
        [data-color-mode] .w-md-editor-toolbar::-webkit-scrollbar {
          display: none;
        }
        [data-color-mode="dark"] .w-md-editor {
          background: #09090b !important;
        }
        @media (max-width: 640px) {
          [data-color-mode] .w-md-editor {
            height: 380px !important;
            display: flex !important;
            flex-direction: column;
          }
          [data-color-mode] .w-md-editor-content {
            order: 1;
            flex: 1;
            min-height: 0;
            overflow: auto;
          }
          [data-color-mode] .w-md-editor-toolbar {
            order: 2;
            border-top: 1px solid #e4e4e7;
            border-bottom: 0 !important;
          }
          [data-color-mode] .w-md-editor-text textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
