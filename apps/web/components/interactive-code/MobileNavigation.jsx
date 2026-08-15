import { Code2, Monitor, Terminal, FolderTree, Check } from "lucide-react";

const PANELS = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "preview", label: "Preview", icon: Monitor },
  { id: "console", label: "Console", icon: Terminal },
  { id: "files", label: "Files", icon: FolderTree },
];

export function MobileNavigation({ workspace }) {
  const {
    state: { panel },
    setters: { setPanel },
    computed: { isDark, consoleFirst, activeFileName },
    testCases,
  } = workspace;

  const activePanels = PANELS.filter(
    (item) => !(consoleFirst && item.id === "preview")
  );
  
  if (testCases.length && !activePanels.some((item) => item.id === "tests")) {
    activePanels.push({ id: "tests", label: "Tests", icon: Check });
  }

  return (
    <nav
      aria-label="Editor panels"
      className={`flex shrink-0 items-center justify-around border-b px-2 py-1.5 transition-colors lg:hidden ${
        isDark
          ? "border-zinc-800/80 bg-[#121214]"
          : "border-zinc-200/90 bg-zinc-50"
      }`}
    >
      <div
        className={`flex w-full items-center gap-1 p-1 rounded-2xl border transition-colors ${
          isDark
            ? "border-zinc-800 bg-[#18181b]"
            : "border-zinc-200/80 bg-white shadow-2xs"
        }`}
      >
        {activePanels.map(({ id, label, icon: Icon }) => {
          const isActive = panel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPanel(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-bold font-outfit transition-all cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : isDark
                    ? "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              {id === "code" && activeFileName && (
                <span className="hidden max-w-16.25 truncate text-[10px] font-normal opacity-80 xs:inline">
                  ({activeFileName})
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
