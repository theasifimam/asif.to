"use client";

import LogoLoader from "@/components/ui/LogoLoader";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, KanbanSquare, Plus, Trash2, ListTodo } from "lucide-react";
import { kanbanApi } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button, Input } from "@/components/ui";

const TASKS = {
  Development: {
    type: "Feature",
    priority: "Medium",
    checklist: [
      { text: "Define scope", completed: false },
      { text: "Implement", completed: false },
      { text: "Test", completed: false },
    ],
  },
  SEO: {
    type: "SEO",
    priority: "Medium",
    checklist: [
      { text: "Keyword research", completed: false },
      { text: "Optimize", completed: false },
      { text: "Measure", completed: false },
    ],
  },
  Content: {
    type: "Article",
    priority: "Medium",
    checklist: [
      { text: "Outline", completed: false },
      { text: "First draft", completed: false },
      { text: "SEO review", completed: false },
      { text: "Publish", completed: false },
    ],
  },
  Bug: {
    type: "Bug",
    priority: "High",
    checklist: [
      { text: "Reproduce issue", completed: false },
      { text: "Fix bug", completed: false },
      { text: "Verify fix", completed: false },
    ],
  },
  Feature: {
    type: "Feature",
    priority: "High",
    checklist: [
      { text: "Design UI", completed: false },
      { text: "Build backend", completed: false },
      { text: "Deploy", completed: false },
    ],
  },
};

const unwrap = (response) => response?.data?.data;

const typeColorMap = {
  Feature:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50",
  SEO: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50",
  Article:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50",
  Bug: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50",
};

export default function QuickPlannerAdd() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("Development");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Load target board & initial recent tasks
  const loadBoardData = async () => {
    try {
      setLoadingTasks(true);
      const boardsResult = await kanbanApi.boards();
      const board = (unwrap(boardsResult) || [])[0];
      if (!board?._id) {
        setLoadingTasks(false);
        return;
      }

      const boardResult = await kanbanApi.getBoard(board._id);
      const payload = unwrap(boardResult);
      if (payload?.columns?.[0]) {
        setTarget({
          boardId: board._id,
          columnId: payload.columns[0]._id,
        });
      }

      if (Array.isArray(payload?.cards)) {
        const sorted = [...payload.cards].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
        setTasks(sorted);
      }
    } catch (error) {
      console.error("Failed to load planner data:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, []);

  // Listen for external task updates
  useEffect(() => {
    const handleRefresh = () => {
      loadBoardData();
    };
    window.addEventListener("planner:task-created", handleRefresh);
    return () =>
      window.removeEventListener("planner:task-created", handleRefresh);
  }, []);

  async function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !target || submitting) return;

    setSubmitting(true);

    const result = await kanbanApi.createCard(target.boardId, {
      title: cleanTitle,
      column: target.columnId,
      ...TASKS[kind],
    });

    if (result.success) {
      setTitle("");
      const createdCard = unwrap(result) || {
        _id: Date.now().toString(),
        title: cleanTitle,
        ...TASKS[kind],
      };
      setTasks((prev) => [createdCard, ...prev]);
      window.dispatchEvent(new CustomEvent("planner:task-created"));
    }

    setSubmitting(false);
  }

  async function deleteTask(cardId) {
    if (!cardId || deletingId) return;
    setDeletingId(cardId);
    try {
      const result = await kanbanApi.deleteCard(cardId);
      if (result?.success) {
        setTasks((prev) => prev.filter((t) => t._id !== cardId));
        window.dispatchEvent(new CustomEvent("planner:task-created"));
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Quick Planner Shortcut"
          title="Quick Planner Shortcut"
          className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-all cursor-pointer md:h-10 md:w-10 ${
            open
              ? "border-blue-600 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-400"
              : "border-zinc-200/80 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          }`}
        >
          <KanbanSquare size={17} />
          {tasks.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-blue-600" />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-[#121215]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <KanbanSquare size={15} />
            </div>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
                Quick Planner
              </p>
              <p className="text-[10px] font-medium text-zinc-500">
                Fast task entry
              </p>
            </div>
          </div>
          <Link
            href="/planner"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Planner <ChevronRight size={12} />
          </Link>
        </div>

        {/* Quick Add Form using Shadcn Select, Input and Button */}
        <form onSubmit={submit} className="mt-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger size="sm" className="h-9 w-28 shrink-0 rounded-xl text-xs font-bold bg-zinc-50/80 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent align="start" className="z-2100">
                <SelectItem value="Development">Development</SelectItem>
                <SelectItem value="SEO">SEO</SelectItem>
                <SelectItem value="Content">Content</SelectItem>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add task title..."
              className="h-9 flex-1 rounded-xl text-xs bg-zinc-50/80 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />

            <Button
              type="submit"
              size="icon"
              disabled={!title.trim() || !target || submitting}
              className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              title="Add task"
            >
              {submitting ? (
                <LogoLoader size={14} className=""  />
              ) : (
                <Plus size={16} />
              )}
            </Button>
          </div>
        </form>

        {/* Recent Tasks List with proper overflow control */}
        <div className="mt-4 space-y-2 min-w-0">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Recent Tasks ({tasks.length})
            </span>
            {loadingTasks && (
              <LogoLoader size={11} className=" text-zinc-400"  />
            )}
          </div>

          <div className="max-h-52 overflow-y-auto overflow-x-hidden space-y-1.5 pr-1 min-w-0">
            {loadingTasks && tasks.length === 0 ? (
              <div className="flex h-20 items-center justify-center text-xs text-zinc-400">
                <LogoLoader size={16} className=" mr-2"  /> Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-6 text-center dark:border-zinc-800">
                <ListTodo size={20} className="mb-1.5 text-zinc-400" />
                <p className="text-xs font-medium text-zinc-500">No tasks added yet</p>
                <p className="text-[10px] text-zinc-400">Add a task above to see it here</p>
              </div>
            ) : (
              tasks.slice(0, 8).map((task) => {
                const typeLabel = task.type || "Task";
                const colorClass =
                  typeColorMap[typeLabel] ||
                  "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";

                return (
                  <div
                    key={task._id || task.id || task.title}
                    className="group flex items-center justify-between gap-2 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-2.5 transition hover:border-zinc-200 hover:bg-white dark:border-zinc-800/60 dark:bg-zinc-900/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 min-w-0"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${colorClass}`}
                        >
                          {typeLabel}
                        </span>
                        {task.priority && (
                          <span className="text-[9px] font-medium text-zinc-400">
                            • {task.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task._id)}
                      disabled={deletingId === task._id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer shrink-0"
                      title="Delete task"
                    >
                      {deletingId === task._id ? (
                        <LogoLoader size={13} className=""  />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
