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
      className={`flex shrink-0 items-center justify-around border-b p-1 transition-colors lg:hidden ${
        isDark
          ? "border-zinc-800 bg-[#161616]"
          : "border-zinc-200 bg-[#f8f8f8]"
      }`}
    >
      {activePanels.map(({ id, label, icon: Icon }) => {
        const isActive = panel === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : isDark
                  ? "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
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
    </nav>
  );
}
