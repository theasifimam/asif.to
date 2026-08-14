"use client";

import { useEffect, useRef, useState } from "react";
import "highlight.js/styles/atom-one-dark.css";

const GRAMMARS = {
  python: () => import("highlight.js/lib/languages/python"),
  c: () => import("highlight.js/lib/languages/c"),
  cpp: () => import("highlight.js/lib/languages/cpp"),
  java: () => import("highlight.js/lib/languages/java"),
};
const LANGUAGE_LOADERS = new Map();

function loadHighlighter(language) {
  if (!LANGUAGE_LOADERS.has(language)) {
    LANGUAGE_LOADERS.set(
      language,
      Promise.all([import("highlight.js/lib/core"), GRAMMARS[language]()]).then(
        ([core, grammar]) => {
          const hljs = core.default;
          if (!hljs.getLanguage(language))
            hljs.registerLanguage(language, grammar.default);
          return hljs;
        },
      ),
    );
  }
  return LANGUAGE_LOADERS.get(language);
}

export default function RuntimeCodeEditor({
  language,
  label,
  value,
  onChange,
}) {
  const [highlighted, setHighlighted] = useState("");
  const [highlighting, setHighlighting] = useState(true);
  const preRef = useRef(null);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(
      () =>
        loadHighlighter(language)
          .then((hljs) => {
            if (active)
              setHighlighted(hljs.highlight(value, { language }).value);
          })
          .catch(() => {
            if (active) setHighlighted("");
          })
          .finally(() => {
            if (active) setHighlighting(false);
          }),
      75,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [language, value]);

  const syncScroll = (event) => {
    if (!preRef.current) return;
    preRef.current.scrollTop = event.currentTarget.scrollTop;
    preRef.current.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <div className="relative h-[calc(100%-36px)] bg-[#1e1e1e]">
      <pre
        ref={preRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-0 overflow-hidden whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6"
      >
        <code
          className={`hljs language-${language} block min-h-full bg-transparent! p-0!`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
      <textarea
        wrap="soft"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onScroll={syncScroll}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          event.preventDefault();
          const input = event.currentTarget;
          const next = `${value.slice(0, input.selectionStart)}  ${value.slice(input.selectionEnd)}`;
          const caret = input.selectionStart + 2;
          onChange(next);
          requestAnimationFrame(() => input.setSelectionRange(caret, caret));
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className="absolute inset-0 h-full w-full resize-none overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-blue-500/45 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
        aria-label={`${label} source code`}
      />
      {highlighting && (
        <span
          className="pointer-events-none absolute bottom-2 right-3 rounded bg-zinc-900/90 px-2 py-1 text-[10px] text-zinc-400"
          role="status"
        >
          Loading {label} highlighting...
        </span>
      )}
    </div>
  );
}
