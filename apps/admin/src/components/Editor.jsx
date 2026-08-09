"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () =>
  <div className="h-125 w-full bg-zinc-50 dark:bg-zinc-900/20 animate-pulse rounded-3xl" />

});







const Editor = ({ value, onChange, placeholder }) => {
  const { theme } = useTheme();

  return (
    <div
      className="md-editor-wrapper"
      data-color-mode={theme === "dark" ? "dark" : "light"}>
      
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        preview="live"
        height={500}
        className="w-full font-inter"
        textareaProps={{
          placeholder: placeholder || "START WRITING..."
        }} />
      
      <style jsx global>{`
        .md-editor-wrapper {
          --md-border-color: #e4e4e7; /* zinc-200 */
        }

        .md-editor-wrapper[data-color-mode="dark"] {
          --md-border-color: #27272a; /* zinc-800 */
        }

        .w-md-editor {
          border: 1px solid var(--md-border-color) !important;
          border-radius: 1.5rem !important;
          overflow: hidden;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
        }

        .w-md-editor-toolbar {
          border-bottom: 1px solid var(--md-border-color) !important;
          padding: 0.5rem 1rem !important;
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
      `}</style>
    </div>);

};

export default Editor;