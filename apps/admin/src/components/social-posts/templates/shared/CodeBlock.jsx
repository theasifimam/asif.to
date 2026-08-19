"use client";

import { useMemo } from "react";
import hljs from "highlight.js";

export default function CodeBlock({
  code = {},
  settings = {},
  maxHeight = 520,
}) {
  const {
    language = "javascript",
    filename = "",
    content = "",
    highlightLines = [],
    showLineNumbers = true,
  } = code || {};

  const highlighted = useMemo(() => {
    try {
      const selectedLanguage = hljs.getLanguage(language)
        ? language
        : "javascript";

      return hljs.highlight(content || "// Add code", {
        language: selectedLanguage,
      }).value;
    } catch {
      return content || "// Add code";
    }
  }, [content, language]);

  const lines = highlighted.split("\n");
  const rawCount = (content || "").split("\n").length;
  const fontSize = rawCount > 22 ? 16 : rawCount > 14 ? 19 : 22;
  const isDark = settings.codeTheme !== "light";
  const accent = settings.accentColor || "#2563eb";

  return (
    <div
      style={{
        borderRadius: 22,
        overflow: "hidden",
        background: isDark ? "#111118" : "#fafafa",
        border: "1px solid rgba(127,127,127,.18)",
        boxShadow: "0 20px 60px rgba(0,0,0,.22)",
      }}
    >
      <div
        style={{
          height: 48,
          padding: "0 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: isDark ? "#18181f" : "#f4f4f5",
          borderBottom: "1px solid rgba(127,127,127,.14)",
        }}
      >
        <div style={{ display: "flex", gap: 7 }}>
          {["#ef4444", "#f59e0b", "#22c55e"].map((color) => (
            <i
              key={color}
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: color,
              }}
            />
          ))}
        </div>

        <span
          style={{
            font: "700 12px ui-monospace, SFMono-Regular, Menlo, monospace",
            color: isDark ? "#a1a1aa" : "#52525b",
          }}
        >
          {filename || language}
        </span>
      </div>

      <div
        style={{
          padding: "20px 22px",
          maxHeight,
          overflow: "hidden",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize,
          lineHeight: 1.6,
        }}
      >
        {lines.map((line, index) => {
          const isHighlighted = highlightLines.includes(index + 1);

          return (
            <div
              key={index}
              style={{
                display: "flex",
                margin: "0 -22px",
                padding: "0 22px",
                background: isHighlighted ? `${accent}22` : "transparent",
                borderLeft: isHighlighted
                  ? `3px solid ${accent}`
                  : "3px solid transparent",
              }}
            >
              {showLineNumbers && (
                <span
                  style={{
                    width: 34,
                    marginRight: 16,
                    textAlign: "right",
                    color: isDark ? "#52525b" : "#a1a1aa",
                    flexShrink: 0,
                    userSelect: "none",
                  }}
                >
                  {index + 1}
                </span>
              )}

              <code
                className={`hljs language-${language}`}
                style={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  color: isDark ? "#e4e4e7" : "#18181b",
                  background: "transparent",
                  padding: 0,
                  flex: 1,
                }}
                dangerouslySetInnerHTML={{ __html: line || " " }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
