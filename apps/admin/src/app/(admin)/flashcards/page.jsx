"use client";

import { useState, useEffect, useCallback } from "react";
import { flashcardsApi } from "@/lib/api";
import { Layers, Plus, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { toast } from "sonner";

const TECH_IDS = [
  "reactjs",
  "nextjs",
  "nodejs",
  "expressjs",
  "mongodb",
  "tailwindcss",
  "javascript",
];
const DEFAULT_FORM = {
  techId: "",
  front: "",
  back: "",
  tag: "",
  difficulty: "medium",
  status: "published",
};

export default function FlashcardsAdminPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTech, setFilterTech] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [flipped, setFlipped] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await flashcardsApi.listAll(filterTech);
    if (res.success) setCards(res.data?.data || []);
    setLoading(false);
  }, [filterTech]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (card) => {
    setEditTarget(card);
    setForm({
      techId: card.techId,
      front: card.front,
      back: card.back,
      tag: card.tag || "",
      difficulty: card.difficulty,
      status: card.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = editTarget
      ? await flashcardsApi.update(editTarget._id, form)
      : await flashcardsApi.create(form);
    if (res.success) {
      toast.success(editTarget ? "Flashcard updated!" : "Flashcard created!");
      setShowForm(false);
      setEditTarget(null);
      setForm(DEFAULT_FORM);
      load();
    } else {
      toast.error(res.error || "Failed to save");
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this flashcard?")) return;
    setDeleting(id);
    const res = await flashcardsApi.delete(id);
    if (res.success) {
      toast.success("Deleted.");
      setCards((prev) => prev.filter((c) => c._id !== id));
    } else {
      toast.error(res.error || "Failed to delete");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-500" />
            Flashcard Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create revision flashcards for each technology track.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditTarget(null);
            setForm(DEFAULT_FORM);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Flashcard
        </button>
      </div>

      {/* Tech Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterTech("")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!filterTech ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-foreground"}`}
        >
          All
        </button>
        {TECH_IDS.map((t) => (
          <button
            key={t}
            onClick={() => setFilterTech(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filterTech === t ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        Click a card to flip and see the answer.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-10 col-span-2">
              No flashcards yet.
            </p>
          )}
          {cards.map((card) => (
            <div key={card._id} className="group relative">
              {/* Flip Card */}
              <div
                onClick={() =>
                  setFlipped((prev) => ({
                    ...prev,
                    [card._id]: !prev[card._id],
                  }))
                }
                className={`relative min-h-35 rounded-3xl cursor-pointer transition-all duration-500 p-5 flex flex-col justify-between ${flipped[card._id] ? "bg-blue-600 text-white" : "bg-white dark:bg-zinc-900"} shadow-sm hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                      {card.techId}
                    </span>
                    {card.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 opacity-70">
                        {card.tag}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flipped[card._id] ? "bg-white/20 text-white" : card.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-600" : card.difficulty === "hard" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}
                  >
                    {card.difficulty}
                  </span>
                </div>
                <p
                  className={`text-sm font-bold leading-snug ${flipped[card._id] ? "text-white" : "text-foreground"}`}
                >
                  {flipped[card._id] ? card.back : card.front}
                </p>
                <p
                  className={`text-[10px] font-medium mt-3 ${flipped[card._id] ? "text-blue-100" : "text-muted-foreground"}`}
                >
                  {flipped[card._id] ? "Answer" : "Question — tap to reveal"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(card);
                  }}
                  className="p-1.5 rounded-full bg-white dark:bg-zinc-800 shadow text-blue-500 hover:bg-blue-50"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(card._id);
                  }}
                  disabled={deleting === card._id}
                  className="p-1.5 rounded-full bg-white dark:bg-zinc-800 shadow text-zinc-400 hover:text-red-500"
                >
                  {deleting === card._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">
                {editTarget ? "Edit Flashcard" : "New Flashcard"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditTarget(null);
                }}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.techId}
                    onChange={(e) =>
                      setForm({ ...form, techId: e.target.value })
                    }
                  >
                    <option value="">Select...</option>
                    {TECH_IDS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Difficulty
                  </label>
                  <select
                    className="w-full px-3 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm({ ...form, difficulty: e.target.value })
                    }
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tag
                  </label>
                  <input
                    className="w-full px-3 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="e.g. Hooks"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Front (Question) *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                  value={form.front}
                  onChange={(e) => setForm({ ...form, front: e.target.value })}
                  placeholder="e.g. How do you correctly update state based on previous state?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Back (Answer) *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                  value={form.back}
                  onChange={(e) => setForm({ ...form, back: e.target.value })}
                  placeholder="e.g. Use a functional updater: setCount(prev => prev + 1)..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editTarget ? "Save Changes" : "Create Flashcard"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-foreground text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
