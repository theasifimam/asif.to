import { useEffect, useState } from "react";

export const PLAYGROUND_DEFAULT_CONTROL = {
  editorEnabled: true, executionEnabled: true, maintenanceMessage: "",
  languages: {}, runtimes: { sandpack: true, python: true, clang: true, java: true, nextjs: true },
  limits: { executionTimeoutMs: 10000, maxOutputChars: 20000, maxSourceChars: 100000, runCooldownMs: 500 },
  features: { preview: true, console: true, testCases: true, sharing: true, download: true, persistence: true },
};

export function usePlaygroundControl() {
  const [control, setControl] = useState(PLAYGROUND_DEFAULT_CONTROL);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const load = () => fetch(`${base.replace(/\/$/, "")}/playground-settings/public`, { cache: "no-store", headers: { "ngrok-skip-browser-warning": "true", "Cache-Control": "no-cache" } })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => payload?.data && setControl({ ...PLAYGROUND_DEFAULT_CONTROL, ...payload.data }))
      .catch(() => {});
    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);
  return control;
}

export function languageAllowed(control, language) {
  const item = control.languages?.[language];
  return item ? item.enabled !== false : true;
}

export function runtimeAllowed(control, language) {
  const runtime = ["python", "c", "cpp", "java"].includes(language) ? (language === "python" ? "python" : language === "java" ? "java" : "clang") : language === "nextjs" ? "nextjs" : "sandpack";
  return control.runtimes?.[runtime] !== false;
}
