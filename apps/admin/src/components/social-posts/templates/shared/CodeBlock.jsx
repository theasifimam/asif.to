"use client";

import { useMemo } from "react";
import hljs from "highlight.js";

const HIGHLIGHT_STYLES = `
.social-code-block .hljs-comment,
.social-code-block .hljs-quote { color:#8b949e; font-style:italic; }

.social-code-block .hljs-keyword,
.social-code-block .hljs-selector-tag,
.social-code-block .hljs-subst { color:#ff7b72; }

.social-code-block .hljs-string,
.social-code-block .hljs-doctag,
.social-code-block .hljs-regexp,
.social-code-block .hljs-template-variable { color:#a5d6ff; }

.social-code-block .hljs-title,
.social-code-block .hljs-title.function_,
.social-code-block .hljs-section,
.social-code-block .hljs-name { color:#d2a8ff; }

.social-code-block .hljs-number,
.social-code-block .hljs-literal,
.social-code-block .hljs-symbol,
.social-code-block .hljs-bullet { color:#79c0ff; }

.social-code-block .hljs-built_in,
.social-code-block .hljs-type,
.social-code-block .hljs-class .hljs-title { color:#ffa657; }

.social-code-block .hljs-variable,
.social-code-block .hljs-params,
.social-code-block .hljs-attr,
.social-code-block .hljs-property { color:#ffa198; }

.social-code-block .hljs-meta,
.social-code-block .hljs-meta .hljs-keyword { color:#7ee787; }

.social-code-block[data-code-theme="light"] .hljs-comment,
.social-code-block[data-code-theme="light"] .hljs-quote { color:#6e7781; }

.social-code-block[data-code-theme="light"] .hljs-keyword,
.social-code-block[data-code-theme="light"] .hljs-selector-tag,
.social-code-block[data-code-theme="light"] .hljs-subst { color:#cf222e; }

.social-code-block[data-code-theme="light"] .hljs-string,
.social-code-block[data-code-theme="light"] .hljs-doctag,
.social-code-block[data-code-theme="light"] .hljs-regexp,
.social-code-block[data-code-theme="light"] .hljs-template-variable { color:#0a3069; }

.social-code-block[data-code-theme="light"] .hljs-title,
.social-code-block[data-code-theme="light"] .hljs-title.function_,
.social-code-block[data-code-theme="light"] .hljs-section,
.social-code-block[data-code-theme="light"] .hljs-name { color:#8250df; }

.social-code-block[data-code-theme="light"] .hljs-number,
.social-code-block[data-code-theme="light"] .hljs-literal,
.social-code-block[data-code-theme="light"] .hljs-symbol,
.social-code-block[data-code-theme="light"] .hljs-bullet { color:#0550ae; }

.social-code-block[data-code-theme="light"] .hljs-built_in,
.social-code-block[data-code-theme="light"] .hljs-type,
.social-code-block[data-code-theme="light"] .hljs-class .hljs-title,
.social-code-block[data-code-theme="light"] .hljs-variable,
.social-code-block[data-code-theme="light"] .hljs-params,
.social-code-block[data-code-theme="light"] .hljs-attr,
.social-code-block[data-code-theme="light"] .hljs-property { color:#953800; }

.social-code-block[data-code-theme="light"] .hljs-meta,
.social-code-block[data-code-theme="light"] .hljs-meta .hljs-keyword { color:#116329; }
`;

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
  const fontSize = rawCount > 22 ? 21 : rawCount > 14 ? 24 : 27;
  const isDark = settings.codeTheme !== "light";
  const accent = settings.accentColor || "#2563eb";

  return (
    <div
      className="social-code-block"
      data-code-theme={isDark ? "dark" : "light"}
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
            font: "700 16px ui-monospace, SFMono-Regular, Menlo, monospace",
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
          lineHeight: 1.55,
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
      <style>{HIGHLIGHT_STYLES}</style>
    </div>
  );
}
