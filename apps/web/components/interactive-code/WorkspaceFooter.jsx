import { ShieldCheck } from "lucide-react";

export function WorkspaceFooter({ workspace }) {
  const {
    computed: { isDark, activeFileName },
    state: { saveStatus },
  } = workspace;

  return (
    <div
      className={`flex shrink-0 items-center justify-between gap-3 border-t px-3 py-1.5 text-[11px] transition-colors sm:px-4 ${
        isDark
          ? "border-zinc-800 bg-[#181818] text-zinc-400"
          : "border-zinc-200 bg-[#f8f8f8] text-zinc-600"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex shrink-0 items-center gap-1.5">
          <img
            src="/logo.png"
            alt="asif.to"
            className="h-3.5 w-3.5 rounded object-contain"
          />
          <span className="font-bold">asif.to</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="truncate">Isolated sandbox</span>
        </span>
        <span aria-live="polite">
          {activeFileName || "File"} · {saveStatus}
        </span>
      </div>
      <span className="hidden font-mono sm:inline">
        Ctrl/⌘ + Enter to run
      </span>
    </div>
  );
}
