"use client";

import { useEffect, useState } from "react";
import { Building2, Pencil, Plus, ShieldCheck, X } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AdminFilters,
  AdminLoading,
  AdminPage,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin";

const empty = {
  name: "",
  slug: "",
  logo: "",
  website: "",
  careersUrl: "",
  description: "",
  industry: "",
  size: "",
  headquarters: "",
  verified: false,
  active: true,
};

export default function CompaniesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const result = await jobsApi.companies({ search, limit: 100 });
    setLoading(false);
    if (!result.success) return toast.error(result.error || "Unable to load companies");
    setItems(result.data?.data || []);
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [search]);

  const open = (item = null) => {
    setEditing(item?._id || "new");
    setForm(item ? { ...empty, ...item } : empty);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result =
      editing === "new"
        ? await jobsApi.createCompany(form)
        : await jobsApi.updateCompany(editing, form);
    setSaving(false);
    if (!result.success) return toast.error(result.error || "Unable to save company");
    toast.success("Company saved");
    setEditing(null);
    load();
  };

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Companies"
        description="Reusable employer profiles power company pages and keep branding consistent across listings."
        actions={
          <Button onClick={() => open()}>
            <Plus className="h-4 w-4" />
            Add company
          </Button>
        }
      />
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search companies…"
        />
      </AdminFilters>

      {loading ? (
        <AdminLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="rounded-4xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-black text-zinc-900 dark:text-zinc-100">
                    {item.name}
                    {item.verified && (
                      <ShieldCheck className="ml-1 inline h-4 w-4 text-blue-600" />
                    )}
                  </h2>
                  <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">
                    {item.industry || "Industry not set"}
                  </p>
                  <p className="mt-1 text-[10px] font-bold text-blue-600">
                    {({ admin_created: "Admin Created", manual_import: "Manual Import", automated_import: "Automated Import", ats_import: "ATS Import", api_import: "API Import" })[item.creationOrigin] || "Admin Created"}
                    {item.sourceName ? ` · ${item.sourceName}` : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => open(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 line-clamp-3 text-xs leading-5 text-zinc-500">
                {item.description || "No company description yet."}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px] font-bold text-zinc-400 dark:border-zinc-800">
                <span>{item.openJobs} open jobs</span>
                <span className={item.active ? "text-emerald-600" : "text-zinc-400"}>
                  {item.active ? "Active" : "Inactive"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-100 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={save}
            className="my-8 w-full max-w-2xl rounded-4xl bg-white p-6 shadow-2xl dark:bg-zinc-950 sm:p-8"
          >
            <div className="flex justify-between">
              <h2 className="font-outfit text-2xl font-black">
                {editing === "new" ? "Add company" : "Edit company"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Company name", "text", true],
                ["slug", "Slug", "text", false],
                ["logo", "Logo URL", "url", false],
                ["website", "Website", "url", false],
                ["careersUrl", "Careers URL", "url", false],
                ["industry", "Industry", "text", false],
                ["size", "Company size", "text", false],
                ["headquarters", "Headquarters", "text", false],
              ].map(([key, labelText, type, req]) => (
                <div key={key} className="space-y-1.5">
                  <Label required={req}>{labelText}</Label>
                  <Input
                    type={type}
                    required={req}
                    value={form[key] || ""}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={labelText}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                rows={6}
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Overview of the company, mission, work culture..."
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                  Verified company
                </span>
                <Switch
                  checked={form.verified}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, verified: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                  Active status
                </span>
                <Switch
                  checked={form.active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, active: checked })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                {saving ? "Saving…" : "Save company"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminPage>
  );
}
