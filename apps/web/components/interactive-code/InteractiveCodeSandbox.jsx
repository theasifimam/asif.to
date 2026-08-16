"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { usePlaygroundControl, languageAllowed, runtimeAllowed } from "@/lib/playground/control";

const SandpackCodeEditor = dynamic(() => import("./SandpackCodeEditor"), { ssr: false, loading: RuntimeLoading });
const BrowserRuntimeEditor = dynamic(() => import("./runtime/BrowserRuntimeEditor"), { ssr: false, loading: RuntimeLoading });
const BROWSER_LANGUAGES = new Set(["python", "c", "cpp", "java"]);

function RuntimeLoading() {
  return <div className="flex min-h-115 items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 text-sm font-bold text-zinc-300" role="status"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading editor...</div>;
}

export default function InteractiveCodeSandbox(props) {
  const control = usePlaygroundControl();
  useEffect(() => {
    // A short-lived self-hosted Sandpack experiment registered its worker at
    // the application origin. Removing the files is not enough: an active
    // worker can keep intercepting iframe/runtime requests until explicitly
    // unregistered and the page is reloaded.
    if (!("serviceWorker" in navigator)) return;
    let active = true;
    navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      const localRegistrations = registrations.filter((registration) => {
        try {
          return new URL(registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL || "").origin === window.location.origin;
        } catch {
          return false;
        }
      });
      if (!localRegistrations.length) return;
      await Promise.all(localRegistrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter((key) => /sandpack|sandbox|codesandbox/i.test(key)).map((key) => caches.delete(key)));
      }
      if (active && !sessionStorage.getItem("asif-sandpack-worker-cleaned")) {
        sessionStorage.setItem("asif-sandpack-worker-cleaned", "1");
        window.location.reload();
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  if (!control.editorEnabled) return <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center text-sm font-bold text-amber-200">{control.maintenanceMessage || "The interactive editor is temporarily unavailable."}</div>;
  if (!languageAllowed(control, props.language)) return <div className="rounded-3xl border border-zinc-700 bg-zinc-900 p-8 text-center text-sm font-bold text-zinc-300">This language is temporarily unavailable.</div>;
  if (!runtimeAllowed(control, props.language)) return <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-center text-sm font-bold text-amber-200">This code runtime is temporarily unavailable.</div>;
  
  const languageOptions = (props.languageOptions || []).filter((option) => languageAllowed(control, option.value) && control.languages?.[option.value]?.selectable !== false);
  
  const adminInitialCode = control.languages?.[props.language]?.initialCode;
  const nextProps = { ...props, languageOptions, executionEnabled: control.executionEnabled && control.languages?.[props.language]?.executionEnabled !== false, playgroundControl: control };
  
  if (adminInitialCode) {
    nextProps.code = adminInitialCode;
    delete nextProps.files;
  }
  
  return BROWSER_LANGUAGES.has(props.language)
    ? <BrowserRuntimeEditor key={props.language} {...nextProps} />
    : <SandpackCodeEditor {...nextProps} />;
}
