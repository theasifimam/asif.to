"use client";

import { useState, useEffect, useCallback } from "react";
import { quizApi } from "@/lib/api";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Save,
  CheckCircle,
} from "lucide-react";
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
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
  difficulty: "medium",
  status: "published",
};

export default function QuizAdminPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTech, setFilterTech] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await quizApi.listAll(filterTech);
    if (res.success) setQuestions(res.data?.data || []);
    setLoading(false);
  }, [filterTech]);

  useEffect(() => {
    load();
  }, [load]);

  const openEdit = (q) => {
    setEditTarget(q);
    setForm({
      techId: q.techId,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      explanation: q.explanation || "",
      difficulty: q.difficulty,
      status: q.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = editTarget
      ? await quizApi.update(editTarget._id, form)
      : await quizApi.create(form);
    if (res.success) {
      toast.success(editTarget ? "Question updated!" : "Question created!");
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
    if (!confirm("Delete this question?")) return;
    setDeleting(id);
    const res = await quizApi.delete(id);
    if (res.success) {
      toast.success("Deleted.");
      setQuestions((prev) => prev.filter((q) => q._id !== id));
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
            <HelpCircle className="w-6 h-6 text-blue-500" />
            Quiz Builder
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add multiple-choice quiz questions per technology track.
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
          New Question
        </button>
      </div>

      {/* Filter */}
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {questions.length === 0 && (
            <p className="text-sm text-center text-muted-foreground py-10">
              No questions yet.
            </p>
          )}
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className={`p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors space-y-3 ${
                idx === 0 ? "rounded-t-[2.5rem]" : ""
              } ${idx === questions.length - 1 ? "rounded-b-[2.5rem]" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {q.techId}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${q.difficulty === "easy" ? "bg-emerald-500/10 text-emerald-600" : q.difficulty === "hard" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    {q.question}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(q)}
                    className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q._id)}
                    disabled={deleting === q._id}
                    className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500"
                  >
                    {deleting === q._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium ${i === q.correctIndex ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold" : "bg-zinc-50 dark:bg-zinc-950 text-muted-foreground"}`}
                  >
                    {i === q.correctIndex && (
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-blue-500/30 pl-3">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-foreground">
                {editTarget ? "Edit Question" : "New Question"}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech ID *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
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
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Question *
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  placeholder="Type your question..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Answer Options (select correct)
                </label>
                {form.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, correctIndex: i })}
                      className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${form.correctIndex === i ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-300 dark:border-zinc-600"}`}
                    >
                      {form.correctIndex === i && (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <input
                      required
                      className="flex-1 px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none"
                      value={opt}
                      onChange={(e) => {
                        const o = [...form.options];
                        o[i] = e.target.value;
                        setForm({ ...form, options: o });
                      }}
                      placeholder={`Option ${i + 1}`}
                    />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Click the circle to mark the correct answer.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Explanation
                </label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium border-0 outline-none resize-none"
                  value={form.explanation}
                  onChange={(e) =>
                    setForm({ ...form, explanation: e.target.value })
                  }
                  placeholder="Why is this the correct answer?"
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
                  {editTarget ? "Save Changes" : "Create Question"}
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
