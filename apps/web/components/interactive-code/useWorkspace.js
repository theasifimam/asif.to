import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";
import { executeCurrentFiles } from "./sandpackConfig";
import {
  decodeShareState,
  encodeShareState,
  explainError,
  formatSource,
  RECENT_PRACTICE_KEY,
  storageKey,
  unsupportedFeedback,
} from "@/lib/playground/client";

export function useWorkspace({
  language,
  title,
  editorTheme,
  playgroundId,
  starterFiles,
  testCases = [],
  runtimeAdapter = null,
  executionEnabled = true,
}) {
  const [panel, setPanel] = useState("code");
  const [split, setSplit] = useState(50);
  const [outputSplit, setOutputSplit] = useState(68);
  const [fontSize, setFontSize] = useState(14);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [isFloatingModal, setIsFloatingModal] = useState(false);
  const fullscreen = nativeFullscreen || isFloatingModal;
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [resizeAxis, setResizeAxis] = useState(null);
  const [runtimeIssue, setRuntimeIssue] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareStatus, setShareStatus] = useState("");
  const [device, setDevice] = useState("desktop");
  const [resetOpen, setResetOpen] = useState(false);
  const [tests, setTests] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [smartError, setSmartError] = useState(null);
  const [formatting, setFormatting] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [previewBusy, setPreviewBusy] = useState(false);

  const restoredRef = useRef(false);
  const restoreStartedRef = useRef(false);
  const saveTimerRef = useRef(null);
  const saveIdleRef = useRef(null);
  const previewTimerRef = useRef(null);
  const workspaceRef = useRef(null);
  const splitRef = useRef(null);
  const outputRef = useRef(null);
  const resizeRef = useRef(null);
  const resizeFrameRef = useRef(null);

  const { sandpack, listen } = useSandpack();
  const consoleFirst =
    Boolean(runtimeAdapter) || ["javascript", "typescript"].includes(language);
  const isDark = editorTheme === "dark";
  const unsupportedIssue = useMemo(
    () => unsupportedFeedback(sandpack.files),
    [sandpack.files],
  );

  useEffect(
    () =>
      listen((message) => {
        const raw =
          message?.error?.message || message?.message || message?.title;
        if (
          (message?.type === "action" && message?.action === "show-error") ||
          message?.type === "error"
        )
          setSmartError(
            explainError(raw || JSON.stringify(message.error || message)),
          );
        if (message?.type === "success" || message?.type === "done") {
          clearTimeout(previewTimerRef.current);
          setSmartError(null);
          setPreviewBusy(false);
        }
      }),
    [listen],
  );

  useEffect(() => {
    if (restoreStartedRef.current) return;
    restoreStartedRef.current = true;
    async function restore() {
      try {
        const shared = await decodeShareState(
          new URLSearchParams(window.location.search).get("share"),
        );
        const sharedFiles = shared?.language === language ? shared.files : null;
        Object.keys(sandpack.files).forEach((path) => {
          const saved = localStorage.getItem(
            storageKey(playgroundId, language, path),
          );
          const value = sharedFiles?.[path] ?? saved;
          if (value != null) sandpack.updateFile(path, value);
        });
      } catch {
      } finally {
        restoredRef.current = true;
        setRestoring(false);
      }
    }
    restore();
  }, [language, playgroundId, sandpack]);

  useEffect(() => {
    if (!restoredRef.current) return;
    setSaveStatus("Saving...");
    if (!["javascript", "typescript", "nextjs"].includes(language)) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = setTimeout(() => {
        setPreviewBusy(true);
        previewTimerRef.current = setTimeout(() => setPreviewBusy(false), 2500);
      }, 120);
    }
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const save = () => {
        Object.entries(sandpack.files).forEach(([path, file]) =>
          localStorage.setItem(
            storageKey(playgroundId, language, path),
            file.code,
          ),
        );
        if (playgroundId && playgroundId !== "scratch")
          localStorage.setItem(
            RECENT_PRACTICE_KEY,
            JSON.stringify({
              id: playgroundId,
              language,
              title,
              href: window.location.pathname,
              editedAt: Date.now(),
            }),
          );
        setSaveStatus("Saved");
      };
      saveIdleRef.current =
        "requestIdleCallback" in window
          ? window.requestIdleCallback(save, { timeout: 1000 })
          : window.setTimeout(save, 0);
    }, 500);
    return () => {
      clearTimeout(saveTimerRef.current);
      if (saveIdleRef.current != null) {
        if ("cancelIdleCallback" in window)
          window.cancelIdleCallback(saveIdleRef.current);
        else clearTimeout(saveIdleRef.current);
      }
    };
  }, [sandpack.files, language, playgroundId, title]);

  const formatActive = useCallback(async () => {
    if (formatting) return;
    const path = sandpack.activeFile || Object.keys(sandpack.files)[0];
    setFormatting(true);
    try {
      const formatted = await formatSource(
        sandpack.files[path]?.code || "",
        path,
      );
      sandpack.updateFile(path, formatted);
    } catch (error) {
      setSmartError(
        explainError(
          error?.message || "The active file could not be formatted.",
        ),
      );
    } finally {
      setFormatting(false);
    }
  }, [formatting, sandpack]);

  const share = async () => {
    try {
      const files = Object.fromEntries(
        Object.entries(sandpack.files).map(([path, file]) => [path, file.code]),
      );
      const encoded = await encodeShareState({ language, files, playgroundId });
      const url = new URL(window.location.href);
      url.searchParams.set("share", encoded);
      await navigator.clipboard.writeText(url.toString());
      setShareStatus("Link copied");
      setTimeout(() => setShareStatus(""), 2000);
    } catch {
      setShareStatus("Could not copy link");
    }
  };

  const hasSubstantialChanges = () =>
    Object.entries(sandpack.files).some(([path, file]) => {
      const original = starterFiles[path]?.code ?? starterFiles[path] ?? "";
      return (
        Math.abs(file.code.length - String(original).length) > 20 ||
        (file.code !== original && file.code.split("\\n").length > 3)
      );
    });

  const reset = () => {
    if (hasSubstantialChanges()) setResetOpen(true);
    else sandpack.resetAllFiles();
  };

  const confirmReset = () => {
    Object.keys(sandpack.files).forEach((path) =>
      localStorage.removeItem(storageKey(playgroundId, language, path)),
    );
    sandpack.resetAllFiles();
    setResetOpen(false);
  };

  const runTests = () => {
    if (!executionEnabled) return;
    const source = sandpack.files["/index.js"]?.code || "";
    const results = testCases.map((test) => {
      try {
        const fn = new Function(
          `${source}\n;return typeof ${test.functionName} === "function" ? ${test.functionName} : null;`,
        )();
        const received = fn ? fn(...test.args) : undefined;
        return {
          ...test,
          received,
          passed: JSON.stringify(received) === JSON.stringify(test.expected),
        };
      } catch (error) {
        return { ...test, received: error.message, passed: false };
      }
    });
    setTests(results);
    setPanel("tests");
  };

  const runCustom = () => {
    if (!executionEnabled) return;
    try {
      const source = sandpack.files["/index.js"]?.code || "";
      const first = testCases[0];
      const fn = new Function(`${source}\n;return ${first.functionName};`)();
      const input = JSON.parse(customInput);
      setCustomOutput(
        JSON.stringify(
          fn(...(Array.isArray(input) && first.spreadInput ? input : [input])),
        ),
      );
    } catch (error) {
      setCustomOutput(error.message);
    }
  };

  const activeFileName = (sandpack.activeFile || "")
    .split("/")
    .filter(Boolean)
    .pop();

  useEffect(() => {
    setIsFloatingModal(
      !!workspaceRef.current?.closest('[aria-label="Code playground"]'),
    );
    const handleFullscreen = () =>
      setNativeFullscreen(
        !!document.fullscreenElement &&
          document.fullscreenElement.contains(workspaceRef.current),
      );
    handleFullscreen();
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreen);
  }, []);

  useEffect(() => {
    const runShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        if (!executionEnabled) return;
        if (consoleFirst) {
          setConsoleOpen(true);
        }
        if (runtimeAdapter) runtimeAdapter.run();
        else executeCurrentFiles(sandpack);
        setPanel(consoleFirst ? "console" : "preview");
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "f"
      ) {
        event.preventDefault();
        formatActive();
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        setSaveStatus("Saving...");
      }
    };
    window.addEventListener("keydown", runShortcut);
    return () => window.removeEventListener("keydown", runShortcut);
  }, [consoleFirst, executionEnabled, formatActive, runtimeAdapter, sandpack]);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (isFloatingModal) {
      window.dispatchEvent(new CustomEvent("close-floating-playground"));
    } else {
      await workspaceRef.current?.requestFullscreen();
    }
  };

  const startResize = (axis, event) => {
    event.preventDefault();
    const bounds = (
      axis === "horizontal" ? splitRef.current : outputRef.current
    )?.getBoundingClientRect();
    if (!bounds) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = {
      axis,
      bounds,
      pointerId: event.pointerId,
      target: event.currentTarget,
    };
    setResizeAxis(axis);
    document.body.style.cursor =
      axis === "horizontal" ? "col-resize" : "row-resize";
    document.body.style.userSelect = "none";
  };

  const moveResize = (event) => {
    const drag = resizeRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    resizeFrameRef.current = requestAnimationFrame(() => {
      if (drag.axis === "horizontal") {
        setSplit(
          Math.min(
            75,
            Math.max(
              25,
              ((clientX - drag.bounds.left) / drag.bounds.width) * 100,
            ),
          ),
        );
      } else {
        setOutputSplit(
          Math.min(
            82,
            Math.max(
              30,
              ((clientY - drag.bounds.top) / drag.bounds.height) * 100,
            ),
          ),
        );
      }
    });
  };

  const stopResize = (event) => {
    const drag = resizeRef.current;
    if (
      !drag ||
      (event?.pointerId != null && drag.pointerId !== event.pointerId)
    )
      return;
    resizeRef.current = null;
    if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
    setResizeAxis(null);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // const formatActive = async () => {
  //   const active = sandpack.activeFile;
  //   const source = sandpack.files[active]?.code;
  //   if (!source) return;
  //   setFormatting(true);
  //   try {
  //     const formatted = await formatSource(active, source);
  //     if (formatted !== source) sandpack.updateFile(active, formatted);
  //   } finally {
  //     setFormatting(false);
  //   }
  // };

  useEffect(
    () => () => {
      if (resizeFrameRef.current) cancelAnimationFrame(resizeFrameRef.current);
      clearTimeout(previewTimerRef.current);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },
    [],
  );

  return {
    state: {
      panel,
      split,
      outputSplit,
      fontSize,
      fullscreen,
      explorerOpen,
      consoleOpen,
      resizeAxis,
      runtimeIssue,
      saveStatus,
      shareStatus,
      device,
      resetOpen,
      tests,
      customInput,
      customOutput,
      smartError,
      formatting,
      restoring,
      previewBusy,
    },
    setters: {
      setPanel,
      setSplit,
      setOutputSplit,
      setFontSize,
      setFullscreen: setNativeFullscreen,
      setExplorerOpen,
      setConsoleOpen,
      setResizeAxis,
      setRuntimeIssue,
      setSaveStatus,
      setShareStatus,
      setDevice,
      setResetOpen,
      setTests,
      setCustomInput,
      setCustomOutput,
      setSmartError,
      setFormatting,
      setRestoring,
      setPreviewBusy,
    },
    refs: { workspaceRef, splitRef, outputRef },
    computed: { consoleFirst, isDark, unsupportedIssue, activeFileName },
    handlers: {
      formatActive,
      share,
      reset,
      confirmReset,
      runTests,
      runCustom,
      toggleFullscreen,
      toggleConsole: () => setConsoleOpen((v) => !v),
      startResize,
      moveResize,
      stopResize,
    },
    sandpack,
    language,
    title,
    editorTheme,
    testCases,
    runtimeAdapter,
    executionEnabled,
  };
}
