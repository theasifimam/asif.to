"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  CalendarDays,
  Check,
  CheckSquare2,
  ChevronDown,
  Clock,
  Copy,
  Edit3,
  Eye,
  FolderGit2,
  Globe,
  Layers,
  Link2,
  Pencil,
  FileText,
  Plus,
  RotateCcw,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CARD_TYPES,
  CONTENT_TYPES,
  PRIORITIES,
  PRIORITY_STYLE,
} from "./planner-constants";
import Editor, { MarkdownPreview } from "@/components/editor/Editor";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/lib/permissions";

const fieldClass =
  "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-xs outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:[color-scheme:dark]";

const Field = ({ label, children, wide = false }) => (
  <label className={`block ${wide ? "md:col-span-2" : ""}`}>
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {label}
    </span>
    {children}
  </label>
);

const CATEGORIES = [
  {
    id: "Development",
    label: "Development",
    icon: FolderGit2,
    defaultType: "Feature",
  },
  { id: "SEO", label: "SEO", icon: Globe, defaultType: "SEO" },
  { id: "Content", label: "Content", icon: FileText, defaultType: "Article" },
];

function getCategoryFromType(type) {
  if (type === "SEO") return "SEO";
  if (["Article", "Course", "Chapter", "Tutorial"].includes(type))
    return "Content";
  return "Development";
}

export default function CardDetailDrawer({
  card,
  initialMode = "view",
  columns = [],
  labels = [],
  courses = [],
  cards = [],
  onClose,
  onSave,
  onDuplicate,
  onArchive,
  onDelete,
  onCreateLabel,
  onModeChange,
}) {
  const { user } = useAuth();
  const canManage =
    hasPermission(user, "planner.manage") ||
    hasPermission(user, "planner.edit") ||
    ["admin", "super_admin", "editor"].includes(user?.role);

  const [mode, setMode] = useState(initialMode || "view");
  const [draft, setDraft] = useState(card || {});
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    setDraft(card || {});
  }, [card]);

  useEffect(() => {
    setMode(initialMode || "view");
  }, [initialMode]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    onModeChange?.(nextMode);
  };

  const set = (key, value) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const setSeo = (key, value) =>
    setDraft((current) => ({
      ...current,
      seo: { ...current?.seo, [key]: value },
    }));

  const save = async () => {
    if (!draft.title?.trim()) return;
    setSaving(true);
    try {
      const saved = await onSave(draft);
      if (saved) {
        setDraft(saved);
        switchMode("view");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryChange = async (catId) => {
    const catObj = CATEGORIES.find((c) => c.id === catId);
    if (!catObj) return;
    const nextType = catObj.defaultType;
    set("type", nextType);
    if (draft._id) {
      const updatedDraft = { ...draft, type: nextType };
      setDraft(updatedDraft);
      await onSave(updatedDraft);
    }
  };

  const toggleLabel = (label) =>
    set(
      "labels",
      draft.labels?.some((item) => item._id === label._id)
        ? draft.labels.filter((item) => item._id !== label._id)
        : [...(draft.labels || []), label],
    );

  const addChecklist = () => {
    if (!newItem.trim()) return;
    set("checklist", [
      ...(draft.checklist || []),
      {
        text: newItem.trim(),
        completed: false,
        order: draft.checklist?.length || 0,
      },
    ]);
    setNewItem("");
  };

  const relatedIds = (draft.relatedCards || []).map((item) =>
    typeof item === "string" ? item : item._id,
  );

  const currentColumn = columns.find(
    (col) =>
      col._id ===
      (typeof draft.column === "string" ? draft.column : draft.column?._id),
  );

  const currentCategory = getCategoryFromType(draft.type);

  return (
    <div
      className="fixed inset-0 z-500 flex justify-end bg-black/50 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <aside className="h-full w-full max-w-full sm:max-w-2xl overflow-y-auto border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Sticky Header Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 py-3 sm:px-6 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/95">
          <div className="flex items-center gap-2">
            {/* Category Selector Tabs */}
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/70 dark:border-zinc-800">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = currentCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? "bg-white text-blue-600 shadow-xs dark:bg-zinc-800 dark:text-blue-400"
                        : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    }`}
                    title={`Change task category to ${cat.label}`}
                  >
                    <Icon size={13} />
                    <span className="hidden sm:inline">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mode === "view" ? (
              canManage && (
                <Button
                  size="sm"
                  onClick={() => switchMode("edit")}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-3.5 text-xs rounded-xl shadow-xs"
                >
                  <Edit3 size={14} className="mr-1.5" />
                  Update Task
                </Button>
              )
            ) : mode === "edit" ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(card || {});
                    switchMode("view");
                  }}
                  className="h-9 text-xs rounded-xl"
                >
                  <RotateCcw size={14} className="mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={saving || !draft.title?.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-3.5 text-xs rounded-xl shadow-xs"
                >
                  <Save size={14} className="mr-1.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={save}
                disabled={saving || !draft.title?.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-3.5 text-xs rounded-xl shadow-xs"
              >
                <Plus size={14} className="mr-1.5" />
                {saving ? "Creating..." : "Create Task"}
              </Button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
              aria-label="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Modal Main Body */}
        {mode === "view" ? (
          /* CLEAN DOCUMENT VIEW MODE (No boxy forms/cards) */
          <div className="p-5 sm:p-8 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {currentCategory}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  {draft.type || "Task"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                {draft.title || "Untitled Task"}
              </h1>
            </div>

            {/* Linear-Style Minimal Property Bar */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 py-3 border-y border-zinc-100 dark:border-zinc-800/80 text-xs">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-400 dark:text-zinc-500">
                  Status:
                </span>
                <span className="flex items-center gap-1.5 font-extrabold text-zinc-800 dark:text-zinc-200">
                  {currentColumn?.color && (
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: currentColumn.color }}
                    />
                  )}
                  {currentColumn?.name || "Unassigned"}
                </span>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-400 dark:text-zinc-500">
                  Priority:
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    PRIORITY_STYLE[draft.priority] ||
                    "text-zinc-600 bg-zinc-200"
                  }`}
                >
                  {draft.priority || "None"}
                </span>
              </div>

              {/* Due Date */}
              {draft.dueDate && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-400 dark:text-zinc-500">
                    Due:
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                    <CalendarDays size={13} className="text-zinc-400" />
                    {new Date(draft.dueDate).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Description Body */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Description
                </h3>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => switchMode("edit")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400 cursor-pointer"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                )}
              </div>
              <div className="text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed">
                <MarkdownPreview
                  source={draft.description}
                  placeholder="No description added yet. Tap 'Update Task' to write details."
                />
              </div>
            </div>

            {/* Checklist */}
            {draft.checklist?.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                    Checklist
                  </h3>
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {draft.checklist.filter((item) => item.completed).length}/
                    {draft.checklist.length} Completed
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${
                        (draft.checklist.filter((i) => i.completed).length /
                          draft.checklist.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div className="space-y-2">
                  {draft.checklist.map((item, index) => (
                    <label
                      key={item._id || index}
                      className="flex items-center gap-3 py-1 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={async () => {
                          const nextChecklist = draft.checklist.map(
                            (entry, i) =>
                              i === index
                                ? { ...entry, completed: !entry.completed }
                                : entry,
                          );
                          set("checklist", nextChecklist);
                          if (draft._id) {
                            await onSave({
                              ...draft,
                              checklist: nextChecklist,
                            });
                          }
                        }}
                        className="h-4 w-4 rounded border-zinc-300 accent-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer"
                      />
                      <span
                        className={`text-xs font-medium ${
                          item.completed
                            ? "line-through text-zinc-400 dark:text-zinc-500"
                            : "text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Labels */}
            {draft.labels?.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Labels
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {draft.labels.map((label) => (
                    <span
                      key={label._id}
                      className="rounded-full px-3 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: `${label.color}18`,
                        color: label.color,
                        border: `1px solid ${label.color}40`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Content & SEO details (if applicable) */}
            {CONTENT_TYPES.has(draft.type) && draft.seo?.primaryKeyword && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  SEO Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                  <div>
                    <span className="block font-bold text-zinc-400">
                      Primary Keyword:
                    </span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {draft.seo.primaryKeyword}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold text-zinc-400">
                      Intent:
                    </span>
                    <span className="font-extrabold text-zinc-800 dark:text-zinc-200">
                      {draft.seo.searchIntent || "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-6 dark:border-zinc-800/80">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(draft)}
                >
                  <Copy size={14} /> Duplicate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onArchive(draft)}
                >
                  <Archive size={14} /> Archive
                </Button>
              </div>

              {canManage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200/80 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
                  onClick={() => onDelete(draft)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* EDIT / CREATE MODE (Structured Form Layout) */
          <div className="space-y-6 p-5 sm:p-6">
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
              <Field label="Task Title">
                <Input
                  value={draft.title || ""}
                  onChange={(e) => set("title", e.target.value)}
                  className="h-11 border-zinc-200 bg-zinc-50/70 px-3.5 text-base font-extrabold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder="Enter task title..."
                />
              </Field>

              <div className="mt-4">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Description (Rich Text / Markdown Editor)
                </span>
                <Editor
                  value={draft.description || ""}
                  onChange={(val) => set("description", val)}
                  placeholder="Write detailed task notes, instructions, or documentation in rich text..."
                />
              </div>

              <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
                <Field label="Status">
                  <Select
                    value={
                      typeof draft.column === "string"
                        ? draft.column
                        : draft.column?._id || ""
                    }
                    onValueChange={(value) => set("column", value)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {columns.map((column) => (
                        <SelectItem key={column._id} value={column._id}>
                          {column.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Type / Subcategory">
                  <Select
                    value={draft.type || "Feature"}
                    onValueChange={(value) => set("type", value)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {CARD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Priority">
                  <Select
                    value={draft.priority || "Medium"}
                    onValueChange={(value) => set("priority", value)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Due date">
                  <input
                    type="date"
                    className={fieldClass}
                    value={
                      draft.dueDate ? String(draft.dueDate).slice(0, 10) : ""
                    }
                    onChange={(e) => set("dueDate", e.target.value || null)}
                  />
                </Field>

                <Field label="Parent task">
                  <Select
                    value={
                      typeof draft.parentCard === "string"
                        ? draft.parentCard
                        : draft.parentCard?._id || "none"
                    }
                    onValueChange={(value) =>
                      set("parentCard", value === "none" ? null : value)
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <SelectValue placeholder="No parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent</SelectItem>
                      {cards
                        .filter((item) => item._id !== draft._id)
                        .map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field label="Related tasks">
                  <div className="max-h-28 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900 space-y-1">
                    {cards
                      .filter((item) => item._id !== draft._id)
                      .map((item) => {
                        const selected = relatedIds.includes(item._id);
                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => {
                              const next = selected
                                ? relatedIds.filter((id) => id !== item._id)
                                : [...relatedIds, item._id];
                              set("relatedCards", next);
                            }}
                            className={`flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition cursor-pointer ${
                              selected
                                ? "bg-blue-600 text-white shadow-xs"
                                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                            {selected && <Check className="h-3 w-3 shrink-0" />}
                          </button>
                        );
                      })}
                  </div>
                </Field>
              </div>
            </section>

            {/* Labels Section */}
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
              <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                Labels
              </h3>
              <div className="flex flex-wrap gap-2">
                {labels.map((label) => {
                  const active = draft.labels?.some(
                    (item) => item._id === label._id,
                  );
                  return (
                    <button
                      key={label._id}
                      type="button"
                      onClick={() => toggleLabel(label)}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                      style={{
                        borderColor: label.color,
                        backgroundColor: active
                          ? `${label.color}22`
                          : "transparent",
                        color: label.color,
                      }}
                    >
                      {active && <Check size={12} />} {label.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3.5 flex gap-2">
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="New label name..."
                  className="h-9 text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!newLabel.trim()) return;
                    const label = await onCreateLabel(newLabel.trim());
                    if (label) {
                      set("labels", [...(draft.labels || []), label]);
                      setNewLabel("");
                    }
                  }}
                >
                  <Plus size={14} /> Add
                </Button>
              </div>
            </section>

            {/* Checklist Section */}
            <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
              <div className="mb-3.5 flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Checklist
                </h3>
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {draft.checklist?.filter((item) => item.completed).length ||
                    0}
                  /{draft.checklist?.length || 0}
                </span>
              </div>
              <div className="space-y-2.5">
                {draft.checklist?.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="flex items-center gap-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() =>
                        set(
                          "checklist",
                          draft.checklist.map((entry, i) =>
                            i === index
                              ? { ...entry, completed: !entry.completed }
                              : entry,
                          ),
                        )
                      }
                      className="h-4 w-4 rounded border-zinc-300 accent-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 cursor-pointer"
                    />
                    <Input
                      value={item.text}
                      onChange={(e) =>
                        set(
                          "checklist",
                          draft.checklist.map((entry, i) =>
                            i === index
                              ? { ...entry, text: e.target.value }
                              : entry,
                          ),
                        )
                      }
                      className={`h-9 flex-1 text-xs ${
                        item.completed ? "line-through opacity-50" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "checklist",
                          draft.checklist.filter((_, i) => i !== index),
                        )
                      }
                      className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addChecklist();
                    }
                  }}
                  placeholder="Add checklist item..."
                  className="h-9 text-xs"
                />
                <Button variant="outline" size="sm" onClick={addChecklist}>
                  <Plus size={14} /> Add
                </Button>
              </div>
            </section>

            {/* Content & SEO fields (if applicable) */}
            {CONTENT_TYPES.has(draft.type) && (
              <section className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
                <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Content & SEO
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Parent course" wide>
                    <Select
                      value={
                        typeof draft.parentCourse === "string"
                          ? draft.parentCourse
                          : draft.parentCourse?._id || "none"
                      }
                      onValueChange={(value) =>
                        set("parentCourse", value === "none" ? null : value)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <SelectValue placeholder="No course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Primary keyword">
                    <Input
                      value={draft.seo?.primaryKeyword || ""}
                      onChange={(e) => setSeo("primaryKeyword", e.target.value)}
                      placeholder="e.g. react tutorial"
                    />
                  </Field>
                  <Field label="Search intent">
                    <Select
                      value={draft.seo?.searchIntent || "none"}
                      onValueChange={(value) =>
                        setSeo("searchIntent", value === "none" ? "" : value)
                      }
                    >
                      <SelectTrigger className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <SelectValue placeholder="Not set" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        <SelectItem value="Informational">
                          Informational
                        </SelectItem>
                        <SelectItem value="Navigational">
                          Navigational
                        </SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Transactional">
                          Transactional
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Secondary keywords" wide>
                    <Input
                      value={draft.seo?.secondaryKeywords?.join(", ") || ""}
                      onChange={(e) =>
                        setSeo(
                          "secondaryKeywords",
                          e.target.value
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="react hooks, useEffect"
                    />
                  </Field>
                  <Field label="Proposed slug / URL">
                    <Input
                      value={draft.seo?.proposedSlug || ""}
                      onChange={(e) => setSeo("proposedSlug", e.target.value)}
                      placeholder="e.g. /blog/react-guide"
                    />
                  </Field>
                  <Field label="Content cluster">
                    <Input
                      value={draft.seo?.contentCluster || ""}
                      onChange={(e) => setSeo("contentCluster", e.target.value)}
                      placeholder="e.g. React Core"
                    />
                  </Field>
                  <Field label="Meta title" wide>
                    <Input
                      value={draft.seo?.metaTitle || ""}
                      onChange={(e) => setSeo("metaTitle", e.target.value)}
                      placeholder="Page meta title..."
                    />
                  </Field>
                  <Field label="Meta description" wide>
                    <Textarea
                      value={draft.seo?.metaDescription || ""}
                      onChange={(e) =>
                        setSeo("metaDescription", e.target.value)
                      }
                      placeholder="Write meta description..."
                    />
                  </Field>
                </div>
              </section>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
