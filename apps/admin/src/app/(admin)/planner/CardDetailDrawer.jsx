"use client";

import { useState } from "react";
import { Archive, Check, Copy, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CARD_TYPES, CONTENT_TYPES, PRIORITIES } from "./planner-constants";

const fieldClass = "h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-xs outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/30 dark:[color-scheme:dark]";
const optionClass = "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1";

const Field = ({ label, children, wide = false }) => (
  <label className={`block ${wide ? "md:col-span-2" : ""}`}>
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      {label}
    </span>
    {children}
  </label>
);

export default function CardDetailDrawer({ card, columns, labels, courses, cards, onClose, onSave, onDuplicate, onArchive, onDelete, onCreateLabel }) {
  const [draft, setDraft] = useState(card);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const setSeo = (key, value) => setDraft((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));
  const save = async () => { setSaving(true); await onSave(draft); setSaving(false); };
  const toggleLabel = (label) => set("labels", draft.labels?.some((item) => item._id === label._id) ? draft.labels.filter((item) => item._id !== label._id) : [...(draft.labels || []), label]);
  const addChecklist = () => { if (!newItem.trim()) return; set("checklist", [...(draft.checklist || []), { text: newItem.trim(), completed: false, order: draft.checklist?.length || 0 }]); setNewItem(""); };
  const relatedIds = (draft.relatedCards || []).map((item) => typeof item === "string" ? item : item._id);

  return (
    <div className="fixed inset-0 z-[1200] flex justify-end bg-black/50 backdrop-blur-xs" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="h-full w-full max-w-full sm:max-w-2xl overflow-y-auto border-l border-zinc-200 bg-zinc-50/90 shadow-2xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200/80 bg-white/90 px-4 py-3.5 sm:px-6 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Card details</p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Updated {new Date(draft.updatedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              <Save size={15} />
              {saving ? "Saving..." : "Save"}
            </Button>
            <button onClick={onClose} className="rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <Input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className="h-auto border-transparent bg-transparent px-0 text-lg sm:text-xl font-extrabold shadow-none focus-visible:ring-0 focus-visible:border-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              placeholder="Card title..."
            />
            <Textarea
              value={draft.description || ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Add description or notes…"
              className="mt-3 min-h-24 sm:min-h-28 text-xs sm:text-sm bg-zinc-50/70 dark:bg-zinc-950/70 border-zinc-200/80 dark:border-zinc-800/80"
            />
            <div className="mt-5 grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Field label="Status">
                <select className={fieldClass} value={typeof draft.column === "string" ? draft.column : draft.column?._id} onChange={(e) => set("column", e.target.value)}>
                  {columns.map((column) => <option key={column._id} value={column._id} className={optionClass}>{column.name}</option>)}
                </select>
              </Field>
              <Field label="Type">
                <select className={fieldClass} value={draft.type} onChange={(e) => set("type", e.target.value)}>
                  {CARD_TYPES.map((type) => <option key={type} className={optionClass}>{type}</option>)}
                </select>
              </Field>
              <Field label="Priority">
                <select className={fieldClass} value={draft.priority} onChange={(e) => set("priority", e.target.value)}>
                  {PRIORITIES.map((priority) => <option key={priority} className={optionClass}>{priority}</option>)}
                </select>
              </Field>
              <Field label="Due date">
                <input type="date" className={fieldClass} value={draft.dueDate ? String(draft.dueDate).slice(0, 10) : ""} onChange={(e) => set("dueDate", e.target.value || null)} />
              </Field>
              <Field label="Parent task">
                <select className={fieldClass} value={typeof draft.parentCard === "string" ? draft.parentCard : draft.parentCard?._id || ""} onChange={(e) => set("parentCard", e.target.value || null)}>
                  <option value="" className={optionClass}>No parent</option>
                  {cards.filter((item) => item._id !== draft._id).map((item) => <option key={item._id} value={item._id} className={optionClass}>{item.title}</option>)}
                </select>
              </Field>
              <Field label="Related tasks">
                <select multiple className={`${fieldClass} h-24 py-2`} value={relatedIds} onChange={(e) => set("relatedCards", Array.from(e.target.selectedOptions, (option) => option.value))}>
                  {cards.filter((item) => item._id !== draft._id).map((item) => <option key={item._id} value={item._id} className={optionClass}>{item.title}</option>)}
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Labels</h3>
            <div className="flex flex-wrap gap-2">
              {labels.map((label) => {
                const active = draft.labels?.some((item) => item._id === label._id);
                return (
                  <button
                    key={label._id}
                    onClick={() => toggleLabel(label)}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                    style={{ borderColor: label.color, backgroundColor: active ? `${label.color}22` : "transparent", color: label.color }}
                  >
                    {active && <Check size={12} />} {label.name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3.5 flex gap-2">
              <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New label name..." className="h-9 text-xs" />
              <Button variant="outline" size="sm" onClick={async () => { if (!newLabel.trim()) return; const label = await onCreateLabel(newLabel.trim()); if (label) { set("labels", [...(draft.labels || []), label]); setNewLabel(""); } }}>
                <Plus size={14} /> Add
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <div className="mb-3.5 flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Checklist</h3>
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{draft.checklist?.filter((item) => item.completed).length || 0}/{draft.checklist?.length || 0}</span>
            </div>
            <div className="space-y-2.5">
              {draft.checklist?.map((item, index) => (
                <div key={item._id || index} className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => set("checklist", draft.checklist.map((entry, i) => i === index ? { ...entry, completed: !entry.completed } : entry))}
                    className="h-4 w-4 rounded border-zinc-300 accent-blue-600 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <Input
                    value={item.text}
                    onChange={(e) => set("checklist", draft.checklist.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry))}
                    className={`h-9 flex-1 text-xs ${item.completed ? "line-through opacity-50" : ""}`}
                  />
                  <button onClick={() => set("checklist", draft.checklist.filter((_, i) => i !== index))} className="p-1 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3.5 flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklist(); } }}
                placeholder="Add checklist item..."
                className="h-9 text-xs"
              />
              <Button variant="outline" size="sm" onClick={addChecklist}>
                <Plus size={14} /> Add
              </Button>
            </div>
          </section>

          {CONTENT_TYPES.has(draft.type) && (
            <section className="rounded-2xl border border-blue-200/70 bg-blue-50/40 p-5 shadow-xs dark:border-blue-900/40 dark:bg-blue-950/20">
              <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-blue-900 dark:text-blue-300">Content & SEO</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Parent course" wide>
                  <select className={fieldClass} value={typeof draft.parentCourse === "string" ? draft.parentCourse : draft.parentCourse?._id || ""} onChange={(e) => set("parentCourse", e.target.value || null)}>
                    <option value="" className={optionClass}>No course</option>
                    {courses.map((course) => <option key={course._id} value={course._id} className={optionClass}>{course.title}</option>)}
                  </select>
                </Field>
                <Field label="Primary keyword">
                  <Input value={draft.seo?.primaryKeyword || ""} onChange={(e) => setSeo("primaryKeyword", e.target.value)} placeholder="e.g. react tutorial" />
                </Field>
                <Field label="Search intent">
                  <select className={fieldClass} value={draft.seo?.searchIntent || ""} onChange={(e) => setSeo("searchIntent", e.target.value)}>
                    <option value="" className={optionClass}>Not set</option>
                    <option className={optionClass}>Informational</option>
                    <option className={optionClass}>Navigational</option>
                    <option className={optionClass}>Commercial</option>
                    <option className={optionClass}>Transactional</option>
                  </select>
                </Field>
                <Field label="Secondary keywords" wide>
                  <Input value={draft.seo?.secondaryKeywords?.join(", ") || ""} onChange={(e) => setSeo("secondaryKeywords", e.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="react hooks, useEffect" />
                </Field>
                <Field label="Proposed slug / URL">
                  <Input value={draft.seo?.proposedSlug || ""} onChange={(e) => setSeo("proposedSlug", e.target.value)} placeholder="e.g. /blog/react-guide" />
                </Field>
                <Field label="Content cluster">
                  <Input value={draft.seo?.contentCluster || ""} onChange={(e) => setSeo("contentCluster", e.target.value)} placeholder="e.g. React Core" />
                </Field>
                <Field label="Meta title" wide>
                  <Input value={draft.seo?.metaTitle || ""} onChange={(e) => setSeo("metaTitle", e.target.value)} placeholder="Page meta title..." />
                </Field>
                <Field label="Meta description" wide>
                  <Textarea value={draft.seo?.metaDescription || ""} onChange={(e) => setSeo("metaDescription", e.target.value)} placeholder="Write meta description..." />
                </Field>
                <Field label="Internal-link opportunities" wide>
                  <Textarea value={draft.seo?.internalLinks?.join("\n") || ""} onChange={(e) => setSeo("internalLinks", e.target.value.split("\n").filter(Boolean))} placeholder="One URL or idea per line" />
                </Field>
                <Field label="SEO / content notes" wide>
                  <Textarea value={draft.seo?.notes || ""} onChange={(e) => setSeo("notes", e.target.value)} placeholder="Additional SEO or content notes..." />
                </Field>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800/80 dark:bg-zinc-900/60">
            <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">Activity</h3>
            <div className="space-y-3">
              {[...(draft.activity || [])].reverse().slice(0, 10).map((event, index) => (
                <div key={`${event.at}-${index}`} className="flex gap-3 text-xs">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  <div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200">{event.detail || event.action}</p>
                    <p className="mt-0.5 text-zinc-400 dark:text-zinc-500">{new Date(event.at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-zinc-400 dark:text-zinc-500">Created {new Date(draft.createdAt).toLocaleString()}</p>
          </section>

          <div className="flex flex-wrap gap-2.5 border-t border-zinc-200/80 pt-5 dark:border-zinc-800/80">
            <Button variant="outline" onClick={() => onDuplicate(draft)}>
              <Copy size={15} /> Duplicate
            </Button>
            <Button variant="outline" onClick={() => onArchive(draft)}>
              <Archive size={15} /> Archive
            </Button>
            <Button variant="outline" className="border-red-200/80 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:border-red-800" onClick={() => onDelete(draft)}>
              <Trash2 size={15} /> Delete
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
