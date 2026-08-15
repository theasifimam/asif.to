"use client";

import { useEffect, useState } from "react";
import {
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { coursesApi, topicCategoriesApi } from "@/lib/api";

const emptyForm = { name: "", slug: "", description: "", order: 0 };

export default function CategoriesPage() {
  const [courses, setCourses] = useState([]);
  const [course, setCourse] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    coursesApi.listAll().then((response) => {
      const items = response.data?.data || [];
      setCourses(items);
      if (items[0]) setCourse(items[0]._id);
      setLoading(false);
    });
  }, []);

  const loadCategories = async () => {
    if (!course) return;
    const response = await topicCategoriesApi.list(course);
    if (response.success) setCategories(response.data?.data || []);
    else toast.error(response.error || "Unable to load categories");
  };

  useEffect(() => {
    loadCategories();
  }, [course]);

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return toast.error("Category name is required");
    setSaving(true);
    const payload = { ...form, course };
    const response = editing
      ? await topicCategoriesApi.update(editing._id, payload)
      : await topicCategoriesApi.create(payload);
    if (response.success) {
      toast.success(editing ? "Category updated" : "Category created");
      setForm(emptyForm);
      setEditing(null);
      loadCategories();
    } else toast.error(response.error || "Unable to save category");
    setSaving(false);
  };

  const startEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      order: category.order || 0,
    });
  };

  const remove = async () => {
    const response = await topicCategoriesApi.delete(deleteTarget._id);
    if (response.success) {
      toast.success("Category deleted");
      setDeleteTarget(null);
      loadCategories();
    } else toast.error(response.error || "Unable to delete category");
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Content / Categories
        </p>
        <h1 className="mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
          Topic categories
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Organize related topic pages within a course.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form
          onSubmit={save}
          className="h-fit space-y-4 rounded-4xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/60 dark:bg-zinc-950"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              {editing ? "Edit category" : "New category"}
            </h2>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-2">
            <Label>Course</Label>
            <Select
              value={course}
              onValueChange={setCourse}
              disabled={Boolean(editing)}
            >
              <SelectTrigger className="h-12 w-full rounded-2xl border-0 bg-zinc-100 px-4 shadow-none dark:bg-zinc-900">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Hooks"
            />
          </div>
          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(event) =>
                setForm((current) => ({ ...current, slug: event.target.value }))
              }
              placeholder="Generated from name"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={3}
              className="rounded-2xl border-0 bg-zinc-100 px-4 py-3 shadow-none dark:bg-zinc-900"
            />
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              min="0"
              value={form.order}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  order: Number(event.target.value),
                }))
              }
            />
          </div>
          <Button className="w-full" disabled={saving || !course}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : editing ? (
              <Save className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {editing ? "Save changes" : "Create category"}
          </Button>
        </form>
        <section className="overflow-hidden rounded-4xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-950">
          <div className="border-b border-zinc-200/60 px-5 py-4 dark:border-zinc-800/60">
            <h2 className="font-semibold text-zinc-900 dark:text-white">
              Course structure
            </h2>
          </div>
          {loading ? (
            <Loader2 className="mx-auto my-16 h-5 w-5 animate-spin" />
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">
              <FolderTree className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
              No categories in this course.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100/80 dark:divide-zinc-800/70">
              {categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                      {category.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      /{category.slug} · Order {category.order}
                    </p>
                    <p className="mt-2 text-sm text-zinc-500">
                      {category.description || "No description"}
                    </p>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit category"
                      onClick={() => startEdit(category)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete category"
                      onClick={() => setDeleteTarget(category)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        title="Delete category?"
        description="Categories containing topics cannot be deleted. Move or delete those topics first."
        confirmText="Delete"
        variant="destructive"
      />
    </main>
  );
}
