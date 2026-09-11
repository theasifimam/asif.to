"use client";

import React, { useEffect, useState } from "react";
import LogoLoader from "@/components/ui/LogoLoader";
import {
  Code2,
  Copy,
  Download,
  Expand,
  Minimize2,
  Minus,
  Monitor,
  MoreHorizontal,
  Play,
  Plus,
  RotateCcw,
  Share2,
  Terminal,
  WandSparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MobileFloatingDock({
  isDark,
  handleRun,
  isRunning,
  executionEnabled,
  reset,
  panel,
  setPanel,
  consoleFirst,
  workspaceRef,
  formatting,
  formatActive,
  share,
  shareStatus,
  handleCopy,
  handleDownload,
  fontSize,
  setFontSize,
  fullscreen,
  toggleFullscreen,
}) {
  const [dropdownContainer, setDropdownContainer] = useState(null);

  useEffect(() => {
    if (workspaceRef?.current) {
      setDropdownContainer(workspaceRef.current);
    }
  }, [workspaceRef]);

  return (
    <div className="pointer-events-none absolute bottom-3 inset-x-0 z-30 flex justify-center items-center lg:hidden px-3">
      <div
        className={`pointer-events-auto flex items-center gap-1.5 p-1 rounded-full border shadow-2xl backdrop-blur-2xl transition-all ${
          isDark
            ? "bg-[#18181b]/95 border-zinc-700/80 text-white shadow-black/70"
            : "bg-white/95 border-zinc-200/90 text-zinc-900 shadow-zinc-400/40"
        }`}
      >
        {/* 1. Play / Run Button */}
        <button
          type="button"
          onClick={handleRun}
          disabled={isRunning || executionEnabled === false}
          className="h-8.5 w-8.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer shrink-0"
          title={
            executionEnabled === false
              ? "Execution is temporarily disabled"
              : "Run code (Ctrl + Enter)"
          }
          aria-label={
            executionEnabled === false
              ? "Execution temporarily disabled"
              : "Run code"
          }
        >
          {isRunning ? (
            <LogoLoader className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5 fill-current" />
          )}
        </button>

        {/* 2. Reset Starter Code Button */}
        <button
          type="button"
          onClick={reset}
          className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
            isDark
              ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
          }`}
          title="Reset starter code"
          aria-label="Reset starter code"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* 3. View Output / Back to Code Toggle Button (Icon only) */}
        <button
          type="button"
          onClick={() =>
            setPanel(
              panel === "code"
                ? consoleFirst
                  ? "console"
                  : "preview"
                : "code",
            )
          }
          className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
            panel !== "code"
              ? "bg-blue-600 text-white shadow-sm"
              : isDark
                ? "bg-zinc-800/90 text-blue-400 hover:bg-zinc-700 hover:text-blue-300"
                : "bg-zinc-100 text-blue-600 hover:bg-zinc-200 hover:text-blue-700"
          }`}
          title={panel === "code" ? "View Output" : "Back to Code"}
          aria-label={panel === "code" ? "View Output" : "Back to Code"}
        >
          {panel === "code" ? (
            consoleFirst ? (
              <Terminal className="h-4 w-4 text-amber-400" />
            ) : (
              <Monitor className="h-4 w-4" />
            )
          ) : (
            <Code2 className="h-4 w-4" />
          )}
        </button>

        {/* 4. More Options Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
                isDark
                  ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
              }`}
              title="Options & Settings"
              aria-label="Options & Settings"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            side="top"
            sideOffset={8}
            container={dropdownContainer || undefined}
            className={`w-52 p-1.5 shadow-2xl backdrop-blur-md rounded-2xl ${
              isDark
                ? "bg-[#18181b]! border-zinc-800! text-zinc-100! shadow-black/80"
                : "bg-white! border-zinc-200! text-zinc-900! shadow-zinc-400/40"
            }`}
          >
            <DropdownMenuLabel
              className={`text-[10px] font-black uppercase tracking-wider ${
                isDark ? "text-zinc-400!" : "text-zinc-500!"
              }`}
            >
              File Actions
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={formatting}
                onSelect={formatActive}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-200! hover:bg-zinc-800/80! hover:text-white! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                    : "text-zinc-800! hover:bg-zinc-100! hover:text-zinc-950! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                }`}
              >
                <WandSparkles
                  className={`h-4 w-4 shrink-0 ${
                    isDark ? "text-zinc-400!" : "text-zinc-500!"
                  }`}
                />
                <span>{formatting ? "Formatting..." : "Format Code"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={share}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-200! hover:bg-zinc-800/80! hover:text-white! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                    : "text-zinc-800! hover:bg-zinc-100! hover:text-zinc-950! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                }`}
              >
                <Share2
                  className={`h-4 w-4 shrink-0 ${
                    isDark ? "text-zinc-400!" : "text-zinc-500!"
                  }`}
                />
                <span>{shareStatus || "Share Snippet"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleCopy}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-200! hover:bg-zinc-800/80! hover:text-white! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                    : "text-zinc-800! hover:bg-zinc-100! hover:text-zinc-950! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                }`}
              >
                <Copy
                  className={`h-4 w-4 shrink-0 ${
                    isDark ? "text-zinc-400!" : "text-zinc-500!"
                  }`}
                />
                <span>Copy Code</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDownload}
                className={`flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition ${
                  isDark
                    ? "text-zinc-200! hover:bg-zinc-800/80! hover:text-white! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                    : "text-zinc-800! hover:bg-zinc-100! hover:text-zinc-950! data-highlighted:bg-blue-600! data-highlighted:text-white!"
                }`}
              >
                <Download
                  className={`h-4 w-4 shrink-0 ${
                    isDark ? "text-zinc-400!" : "text-zinc-500!"
                  }`}
                />
                <span>Download</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator
              className={isDark ? "bg-zinc-800!" : "bg-zinc-200!"}
            />
            <DropdownMenuLabel
              className={`text-[10px] font-black uppercase tracking-wider ${
                isDark ? "text-zinc-400!" : "text-zinc-500!"
              }`}
            >
              Text Size
            </DropdownMenuLabel>
            <div className="flex items-center justify-between px-2.5 py-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFontSize((v) => Math.max(11, v - 1))}
                className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  isDark
                    ? "bg-zinc-800! text-zinc-300! hover:bg-zinc-700! hover:text-white!"
                    : "bg-zinc-100! text-zinc-700! hover:bg-zinc-200! hover:text-zinc-900!"
                }`}
                aria-label="Decrease text size"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span
                className={`font-mono text-xs font-bold ${
                  isDark ? "text-zinc-200!" : "text-zinc-800!"
                }`}
              >
                {fontSize}px
              </span>
              <button
                type="button"
                onClick={() => setFontSize((v) => Math.min(20, v + 1))}
                className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                  isDark
                    ? "bg-zinc-800! text-zinc-300! hover:bg-zinc-700! hover:text-white!"
                    : "bg-zinc-100! text-zinc-700! hover:bg-zinc-200! hover:text-zinc-900!"
                }`}
                aria-label="Increase text size"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 5. Minimise / Maximise Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`h-8.5 w-8.5 rounded-full flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
            isDark
              ? "bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900"
          }`}
          title={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
          aria-label={fullscreen ? "Exit fullscreen" : "Open fullscreen"}
        >
          {fullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Expand className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
