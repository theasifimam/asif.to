"use client";

import { useState } from "react";
import { Archive, Check, Copy, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CARD_TYPES, CONTENT_TYPES, PRIORITIES } from "./planner-constants";

const fieldClass = "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-950";
const Field = ({ label, children, wide = false }) => <label className={`block ${wide ? "md:col-span-2" : ""}`}><span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-500">{label}</span>{children}</label>;

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

  return <div className="fixed inset-0 z-[1200] flex justify-end bg-black/45 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <aside className="h-full w-full max-w-full sm:max-w-2xl overflow-y-auto border-l border-zinc-200 bg-zinc-50 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 sm:px-5 sm:py-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
        <div><p className="text-[10px] font-black uppercase tracking-[.25em] text-blue-600">Card details</p><p className="mt-0.5 text-xs text-zinc-500">Updated {new Date(draft.updatedAt).toLocaleString()}</p></div>
        <div className="flex items-center gap-2"><Button size="sm" onClick={save} disabled={saving}><Save size={15}/>{saving ? "Saving" : "Save"}</Button><button onClick={onClose} className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"><X size={20}/></button></div>
      </header>
      <div className="space-y-4 sm:space-y-6 p-3.5 sm:p-5 md:p-7">
        <section className="rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <Input value={draft.title} onChange={(e) => set("title", e.target.value)} className="h-auto border-0 bg-transparent px-0 text-lg sm:text-xl font-extrabold shadow-none focus-visible:ring-0" />
          <Textarea value={draft.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Add description or notes…" className="mt-2 min-h-24 sm:min-h-28 border-0 bg-zinc-50 shadow-none dark:bg-zinc-950 text-xs sm:text-sm" />
          <div className="mt-4 sm:mt-5 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <Field label="Status"><select className={fieldClass} value={typeof draft.column === "string" ? draft.column : draft.column?._id} onChange={(e) => set("column", e.target.value)}>{columns.map((column) => <option key={column._id} value={column._id}>{column.name}</option>)}</select></Field>
            <Field label="Type"><select className={fieldClass} value={draft.type} onChange={(e) => set("type", e.target.value)}>{CARD_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Priority"><select className={fieldClass} value={draft.priority} onChange={(e) => set("priority", e.target.value)}>{PRIORITIES.map((priority) => <option key={priority}>{priority}</option>)}</select></Field>
            <Field label="Due date"><input type="date" className={fieldClass} value={draft.dueDate ? String(draft.dueDate).slice(0, 10) : ""} onChange={(e) => set("dueDate", e.target.value || null)} /></Field>
            <Field label="Parent task"><select className={fieldClass} value={typeof draft.parentCard === "string" ? draft.parentCard : draft.parentCard?._id || ""} onChange={(e) => set("parentCard", e.target.value || null)}><option value="">No parent</option>{cards.filter((item) => item._id !== draft._id).map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></Field>
            <Field label="Related tasks"><select multiple className={`${fieldClass} h-20 sm:h-24 py-2`} value={relatedIds} onChange={(e) => set("relatedCards", Array.from(e.target.selectedOptions, (option) => option.value))}>{cards.filter((item) => item._id !== draft._id).map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}</select></Field>
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <h3 className="mb-3 text-sm font-extrabold">Labels</h3><div className="flex flex-wrap gap-2">{labels.map((label) => { const active = draft.labels?.some((item) => item._id === label._id); return <button key={label._id} onClick={() => toggleLabel(label)} className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: label.color, backgroundColor: active ? `${label.color}22` : "transparent", color: label.color }}>{active && <Check size={12}/>} {label.name}</button>; })}</div>
          <div className="mt-3 flex gap-2"><Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="New label" className="h-9"/><Button variant="outline" size="sm" onClick={async () => { if (!newLabel.trim()) return; const label = await onCreateLabel(newLabel.trim()); if (label) { set("labels", [...(draft.labels || []), label]); setNewLabel(""); } }}><Plus size={14}/> Add</Button></div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold">Checklist</h3><span className="text-xs font-bold text-zinc-500">{draft.checklist?.filter((item) => item.completed).length || 0}/{draft.checklist?.length || 0}</span></div>
          <div className="space-y-2">{draft.checklist?.map((item, index) => <div key={item._id || index} className="flex items-center gap-2"><input type="checkbox" checked={item.completed} onChange={() => set("checklist", draft.checklist.map((entry, i) => i === index ? { ...entry, completed: !entry.completed } : entry))} className="h-4 w-4 accent-blue-600"/><Input value={item.text} onChange={(e) => set("checklist", draft.checklist.map((entry, i) => i === index ? { ...entry, text: e.target.value } : entry))} className={`h-9 flex-1 ${item.completed ? "line-through opacity-60" : ""}`}/><button onClick={() => set("checklist", draft.checklist.filter((_, i) => i !== index))} className="text-zinc-400 hover:text-red-500"><X size={15}/></button></div>)}</div>
          <div className="mt-3 flex gap-2"><Input value={newItem} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChecklist(); } }} placeholder="Add checklist item" className="h-9"/><Button variant="outline" size="sm" onClick={addChecklist}><Plus size={14}/> Add</Button></div>
        </section>

        {CONTENT_TYPES.has(draft.type) && <section className="rounded-3xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20"><h3 className="mb-4 text-sm font-extrabold text-blue-900 dark:text-blue-200">Content & SEO</h3><div className="grid gap-4 md:grid-cols-2">
          <Field label="Parent course" wide><select className={fieldClass} value={typeof draft.parentCourse === "string" ? draft.parentCourse : draft.parentCourse?._id || ""} onChange={(e) => set("parentCourse", e.target.value || null)}><option value="">No course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></Field>
          <Field label="Primary keyword"><Input value={draft.seo?.primaryKeyword || ""} onChange={(e) => setSeo("primaryKeyword", e.target.value)}/></Field>
          <Field label="Search intent"><select className={fieldClass} value={draft.seo?.searchIntent || ""} onChange={(e) => setSeo("searchIntent", e.target.value)}><option value="">Not set</option><option>Informational</option><option>Navigational</option><option>Commercial</option><option>Transactional</option></select></Field>
          <Field label="Secondary keywords" wide><Input value={draft.seo?.secondaryKeywords?.join(", ") || ""} onChange={(e) => setSeo("secondaryKeywords", e.target.value.split(",").map((value) => value.trim()).filter(Boolean))} placeholder="react hooks, useEffect"/></Field>
          <Field label="Proposed slug / URL"><Input value={draft.seo?.proposedSlug || ""} onChange={(e) => setSeo("proposedSlug", e.target.value)}/></Field>
          <Field label="Content cluster"><Input value={draft.seo?.contentCluster || ""} onChange={(e) => setSeo("contentCluster", e.target.value)}/></Field>
          <Field label="Meta title" wide><Input value={draft.seo?.metaTitle || ""} onChange={(e) => setSeo("metaTitle", e.target.value)}/></Field>
          <Field label="Meta description" wide><Textarea value={draft.seo?.metaDescription || ""} onChange={(e) => setSeo("metaDescription", e.target.value)} /></Field>
          <Field label="Internal-link opportunities" wide><Textarea value={draft.seo?.internalLinks?.join("\n") || ""} onChange={(e) => setSeo("internalLinks", e.target.value.split("\n").filter(Boolean))} placeholder="One URL or idea per line"/></Field>
          <Field label="SEO / content notes" wide><Textarea value={draft.seo?.notes || ""} onChange={(e) => setSeo("notes", e.target.value)}/></Field>
        </div></section>}

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/40"><h3 className="mb-3 text-sm font-extrabold">Activity</h3><div className="space-y-3">{[...(draft.activity || [])].reverse().slice(0, 10).map((event, index) => <div key={`${event.at}-${index}`} className="flex gap-3 text-xs"><span className="mt-1 h-2 w-2 rounded-full bg-blue-500"/><div><p className="font-semibold text-zinc-700 dark:text-zinc-300">{event.detail || event.action}</p><p className="mt-0.5 text-zinc-400">{new Date(event.at).toLocaleString()}</p></div></div>)}</div><p className="mt-4 text-[11px] text-zinc-400">Created {new Date(draft.createdAt).toLocaleString()}</p></section>
        <div className="flex flex-wrap gap-2 border-t border-zinc-200 pt-5 dark:border-zinc-800"><Button variant="outline" onClick={() => onDuplicate(draft)}><Copy size={15}/> Duplicate</Button><Button variant="outline" onClick={() => onArchive(draft)}><Archive size={15}/> Archive</Button><Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => onDelete(draft)}><Trash2 size={15}/> Delete</Button></div>
      </div>
    </aside>
  </div>;
}
