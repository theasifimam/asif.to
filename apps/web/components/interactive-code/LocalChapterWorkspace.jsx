"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useState } from "react";
import { Play, Terminal } from "lucide-react";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("css", css);

const stripTypeScript = (source) =>
  source
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, "")
    .replace(/:\s*[A-Za-z_$][\w$]*(?=\s*[,)=;{])/g, "")
    .replace(/\s+as\s+[A-Za-z_$][\w$<>\[\]| ]*/g, "");

const renderReactMarkup = (source) => {
  const match = source.match(/return\s*\(\s*([\s\S]*?)\s*\);?/);
  if (!match && /ReactDOM\.createRoot[\s\S]*\.render\s*\(/.test(source)) {
    return "<div><h2>React app mounted</h2><p>The App component is rendered into the root element.</p></div>";
  }
  let markup = match ? match[1] : source;
  markup = markup
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/className=/g, "class=");
  markup = markup.replace(/\{\s*['"`]([^'"`]*)['"`]\s*\}/g, "$1");
  markup = markup.replace(/\{\s*([^{}]+)\s*\}/g, (_, expression) => {
    try {
      return String(Function(`"use strict"; return (${expression})`)());
    } catch {
      return "";
    }
  });
  return markup.replace(/<([A-Z][\w.]*)[^>]*>[\s\S]*?<\/\1>/g, "");
};

const escapeHtml = (value) =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const highlightCode = (value, lang = "javascript") => {
  if (!value) return " ";

  let validLang = lang;
  if (lang === "react" || lang === "nextjs") {
    validLang = "javascript";
  }

  try {
    return hljs.highlight(value, { language: validLang }).value;
  } catch (e) {
    return escapeHtml(value);
  }
};

export default function LocalChapterWorkspace({
  language = "javascript",
  title,
  code = "",
}) {
  const { requireAuth } = useAuthPrompt();
  const [source, setSource] = useState(code);
  const [output, setOutput] = useState(
    "Press Run to execute this code in your browser.",
  );
  const [isOutputOpen, setIsOutputOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const uiOutput = ["react", "nextjs"].includes(language);

  const run = () => {
    if (!requireAuth()) return;
    setIsOutputOpen(true);
    if (uiOutput) {
      setOutput(renderReactMarkup(source));
      return;
    }
    setRunning(true);
    const workerSource = `self.onmessage=({data})=>{const out=[];const log=(...a)=>out.push(a.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' '));try{const console={log,warn:log,error:log,info:log};new Function('console',data.code)(console);self.postMessage({out})}catch(e){self.postMessage({error:e?.stack||e?.message||String(e)})}}`;
    const workerUrl = URL.createObjectURL(
      new Blob([workerSource], { type: "text/javascript" }),
    );
    const worker = new Worker(workerUrl);
    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      setRunning(false);
      setOutput("Execution timed out after 3 seconds.");
    }, 3000);
    worker.onmessage = ({ data }) => {
      clearTimeout(timeout);
      setOutput(
        data.error ||
          data.out?.join("\n") ||
          "Code ran successfully (no console output).",
      );
      setRunning(false);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
    worker.postMessage({
      code: language === "typescript" ? stripTypeScript(source) : source,
    });
  };

  return (
    <section className="local-workspace rounded-3xl bg-white dark:bg-[#1e1e1e] text-zinc-900 dark:text-white overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .local-workspace .hljs { color: #000000; }
        .local-workspace .hljs-keyword, .local-workspace .hljs-literal, .local-workspace .hljs-built_in, .local-workspace .hljs-tag .hljs-name { color: #0000ff; }
        .local-workspace .hljs-string, .local-workspace .hljs-doctag { color: #a31515; }
        .local-workspace .hljs-title, .local-workspace .hljs-title.class_, .local-workspace .hljs-type { color: #267f99; }
        .local-workspace .hljs-title.function_, .local-workspace .hljs-title.function_.invoke__ { color: #795e26; }
        .local-workspace .hljs-variable, .local-workspace .hljs-template-variable { color: #001080; }
        .local-workspace .hljs-number { color: #098658; }
        .local-workspace .hljs-comment { color: #008000; }
        .local-workspace .hljs-attr, .local-workspace .hljs-attribute { color: #ff0000; }
        .local-workspace .hljs-punctuation, .local-workspace .hljs-operator { color: #000000; }
        .local-workspace .hljs-property { color: #001080; }

        .dark .local-workspace .hljs { color: #d4d4d4; }
        .dark .local-workspace .hljs-keyword, .dark .local-workspace .hljs-literal, .dark .local-workspace .hljs-built_in, .dark .local-workspace .hljs-tag .hljs-name { color: #569cd6; }
        .dark .local-workspace .hljs-string, .dark .local-workspace .hljs-doctag { color: #ce9178; }
        .dark .local-workspace .hljs-title, .dark .local-workspace .hljs-title.class_, .dark .local-workspace .hljs-type { color: #4ec9b0; }
        .dark .local-workspace .hljs-title.function_, .dark .local-workspace .hljs-title.function_.invoke__ { color: #dcdcaa; }
        .dark .local-workspace .hljs-variable, .dark .local-workspace .hljs-template-variable { color: #9cdcfe; }
        .dark .local-workspace .hljs-number { color: #b5cea8; }
        .dark .local-workspace .hljs-comment { color: #6a9955; }
        .dark .local-workspace .hljs-attr, .dark .local-workspace .hljs-attribute { color: #9cdcfe; }
        .dark .local-workspace .hljs-punctuation, .dark .local-workspace .hljs-operator { color: #d4d4d4; }
        .dark .local-workspace .hljs-property { color: #9cdcfe; }
      `,
        }}
      />
      <header className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-400">
            Try it
          </p>
          <h3 className="mt-0.5 truncate text-sm font-bold">
            {title || "Code example"}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOutputOpen(!isOutputOpen)}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <Terminal className="h-4 w-4" color={"#a8a8a8ff"} />
            {isOutputOpen ? "Hide" : "Output"}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-black hover:bg-blue-500 disabled:opacity-50 text-white"
          >
            {running ? (
              <LogoLoader className="h-4 w-4 " color={"#ffffff"} />
            ) : (
              <Play className="h-4 w-4" color={"#ffffff"} />
            )}{" "}
            Run
          </button>
        </div>
      </header>
      <div className="grid min-h-64 bg-zinc-100 dark:bg-[#1e1e1e]">
        <pre
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 m-0 whitespace-pre-wrap wrap-break-word p-4 font-mono text-sm leading-6 text-zinc-900 dark:text-zinc-100"
          dangerouslySetInnerHTML={{
            __html:
              highlightCode(source, language) +
              (source.endsWith("\n") ? " " : ""),
          }}
        />
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          aria-label="Editable code"
          className="col-start-1 row-start-1 m-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-zinc-900 dark:caret-white outline-none selection:bg-blue-500/40"
        />
      </div>
      {isOutputOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-transparent">
          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
            {uiOutput ? (
              "Rendered preview"
            ) : (
              <>
                <Terminal className="h-3.5 w-3.5" /> Console output
              </>
            )}
          </div>
          {uiOutput ? (
            <iframe
              title="Local React preview"
              sandbox="allow-scripts"
              srcDoc={`<!doctype html><html><body style="font-family:system-ui;padding:16px">${output}</body></html>`}
              className="h-48 w-full bg-white"
            />
          ) : (
            <pre className="min-h-32 whitespace-pre-wrap p-4 font-mono text-xs text-zinc-800 dark:text-zinc-200 bg-white dark:bg-transparent">
              {output}
            </pre>
          )}
        </div>
      )}
    </section>
  );
}
