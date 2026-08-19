"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { kanbanApi } from "@/lib/api";

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
};

const unwrap = (response) => response?.data?.data;

export default function QuickPlannerAdd() {
  const [kind, setKind] = useState("Development");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      const boardsResult = await kanbanApi.boards();
      const board = (unwrap(boardsResult) || [])[0];
      if (!active || !board?._id) return;

      const boardResult = await kanbanApi.getBoard(board._id);
      const payload = unwrap(boardResult);
      if (!active || !payload?.columns?.[0]) return;

      setTarget({
        boardId: board._id,
        columnId: payload.columns[0]._id,
      });
    })();

    return () => {
      active = false;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !target || loading) return;

    setLoading(true);
    setDone(false);

    const result = await kanbanApi.createCard(target.boardId, {
      title: cleanTitle,
      column: target.columnId,
      ...TASKS[kind],
    });

    if (result.success) {
      setTitle("");
      setDone(true);
      window.dispatchEvent(new CustomEvent("planner:task-created"));
      window.setTimeout(() => setDone(false), 1200);
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={submit}
      className="hidden h-10 items-center overflow-hidden rounded-full border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950 xl:flex"
      title="Quick add to Planner"
    >
      <select
        value={kind}
        onChange={(event) => setKind(event.target.value)}
        className="h-full border-r border-zinc-200 bg-transparent pl-3 pr-2 text-[10px] font-bold outline-none dark:border-zinc-800"
      >
        <option>Development</option>
        <option>SEO</option>
        <option>Content</option>
      </select>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add task…"
        className="h-full w-32 bg-transparent px-2.5 text-[11px] outline-none 2xl:w-44"
      />

      <button
        type="submit"
        disabled={!title.trim() || !target || loading}
        className="mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
        aria-label="Add planner task"
      >
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : done ? (
          <Check size={13} />
        ) : (
          <Plus size={13} />
        )}
      </button>
    </form>
  );
}
