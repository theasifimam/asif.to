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
          ? "border-zinc-800/80 bg-[#121214] text-zinc-400"
          : "border-zinc-200/90 bg-zinc-50 text-zinc-600"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <span className="flex shrink-0 items-center gap-1.5">
          <img
            src="/logo.png"
            alt="asif.to"
            className="h-3.5 w-3.5 rounded object-contain"
          />
          <span className="font-outfit font-bold">asif.to</span>
        </span>
        <span className="opacity-40">•</span>
        <span className="flex items-center gap-1.5 truncate">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <span className="truncate font-medium">Isolated browser runtime</span>
        </span>
        <span className="opacity-40">•</span>
        <span aria-live="polite" className="font-medium">
          {activeFileName || "main"} · {saveStatus}
        </span>
      </div>
      <span className="hidden font-mono text-[10px] opacity-70 sm:inline">
        Ctrl + Enter to run
      </span>
    </div>
  );
}
