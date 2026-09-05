"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CodePlaygroundModal from "./CodePlaygroundModal";

function codeLanguage(codeElement) {
  const languageClass = [...(codeElement?.classList || [])].find((name) =>
    name.startsWith("language-"),
  );
  return (
    languageClass
      ?.slice("language-".length)
      .replace(/-(?:play|no-play|static)$/, "") || "javascript"
  );
}

function playgroundDirective(pre) {
  const code = pre.querySelector("code");
  const languageClass = [...(code?.classList || [])].find((name) =>
    name.startsWith("language-"),
  );
  const hasPlayToken = (value) =>
    String(value || "")
      .trim()
      .split(/\s+/)
      .some((token) => token.toLowerCase() === "play");

  // Markdown renderers preserve the text after the language as data-meta.
  if (
    languageClass &&
    [pre.dataset.meta, code?.dataset?.meta].some(hasPlayToken)
  ) {
    return true;
  }

  const metadataSources = [pre.className, code?.className].filter(Boolean);

  return metadataSources.some((metadata) => {
    const tokens = String(metadata).trim().split(/\s+/).filter(Boolean);
    const languageIndex = tokens.findIndex((token) =>
      token.toLowerCase().startsWith("language-"),
    );
    const firstMetadataIndex = languageIndex >= 0 ? languageIndex : 0;
    return tokens
      .slice(firstMetadataIndex + 1)
      .some((token) => token.toLowerCase() === "play");
  });
}

export default function MarkdownCodePlayground({
  children,
  className = "",
  ...props
}) {
  const rootRef = useRef(null);
  const [snippet, setSnippet] = useState(null);

  const addPlayButtons = useCallback(() => {
    rootRef.current?.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.playgroundReady === "true") return;
      if (!playgroundDirective(pre)) {
        pre.dataset.playgroundReady = "disabled";
        pre.querySelector("[data-code-play='true']")?.remove();
        return;
      }
      pre.dataset.playgroundReady = "true";
      pre.classList.add("relative");

      const button = document.createElement("button");
      button.type = "button";
      button.dataset.codePlay = "true";
      button.className =
        "absolute right-2 top-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-lg transition hover:bg-emerald-400 active:scale-95";
      button.setAttribute(
        "aria-label",
        "Open this code in the interactive editor",
      );
      button.title = "Run and edit this code";
      button.textContent = "Play";
      pre.appendChild(button);
    });
  }, []);

  useEffect(() => {
    addPlayButtons();
    const observer = new MutationObserver(addPlayButtons);
    if (rootRef.current)
      observer.observe(rootRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [addPlayButtons, children]);

  const handleClick = (event) => {
    const button = event.target.closest("[data-code-play='true']");
    if (!button || !rootRef.current?.contains(button)) return;
    const pre = button.closest("pre");
    const codeElement = pre?.querySelector("code");
    const code =
      codeElement?.textContent || pre?.childNodes?.[0]?.textContent || "";
    setSnippet({
      code,
      language: codeLanguage(codeElement),
      title: "Code example",
    });
  };

  return (
    <>
      <div ref={rootRef} onClick={handleClick} className={className} {...props}>
        {children}
      </div>
      <CodePlaygroundModal
        open={Boolean(snippet)}
        onClose={() => setSnippet(null)}
        code={snippet?.code || ""}
        language={snippet?.language}
        title={snippet?.title}
      />
    </>
  );
}
