"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const SandpackCodeEditor = dynamic(() => import("./SandpackCodeEditor"), { ssr: false, loading: RuntimeLoading });
const BrowserRuntimeEditor = dynamic(() => import("./runtime/BrowserRuntimeEditor"), { ssr: false, loading: RuntimeLoading });
const BROWSER_LANGUAGES = new Set(["python", "c", "cpp", "java"]);

function RuntimeLoading() {
  return <div className="flex min-h-115 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-300" role="status"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading editor...</div>;
}

export default function InteractiveCodeSandbox(props) {
  return BROWSER_LANGUAGES.has(props.language)
    ? <BrowserRuntimeEditor key={props.language} {...props} />
    : <SandpackCodeEditor {...props} />;
}
