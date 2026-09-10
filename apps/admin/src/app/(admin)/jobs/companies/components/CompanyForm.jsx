"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Building2, Globe, Save, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import AdminFormShell, { formAsideClass, formSectionClass } from "@/components/forms/AdminFormShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import LogoLoader from "@/components/ui/LogoLoader";

const emptyCompany = {
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

export default function CompanyForm({ companyId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl("/jobs/companies", searchParams.get("returnTo"));

  const [form, setForm] = useState(emptyCompany);
  const [loading, setLoading] = useState(Boolean(companyId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;

    let active = true;
    jobsApi.getCompany(companyId).then((res) => {
      if (!active) return;
      if (res.success && res.data?.data) {
        setForm({
          ...emptyCompany,
          ...res.data.data,
        });
      } else {
        toast.error(res.error || "Company not found");
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [companyId]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const res = companyId
      ? await jobsApi.updateCompany(companyId, form)
      : await jobsApi.createCompany(form);

    setSaving(false);

    if (res.success) {
      toast.success(companyId ? "Company profile saved" : "Company profile created");
      router.push(returnTo);
    } else {
      toast.error(res.error || "Unable to save company");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LogoLoader className="h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <AdminFormShell
      eyebrow="Jobs / Companies"
      title={companyId ? `Edit Company: ${form.name || "Company"}` : "Create Company Profile"}
      description="Reusable employer profiles standardize company branding, metadata, and verified badges across job listings."
      back={
        <Link href={returnTo} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to companies
        </Link>
      }
      actions={
        <Button form="company-form" type="submit" disabled={saving} className="rounded-full">
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : companyId ? "Save Company" : "Create Company"}
        </Button>
      }
    >
      <form id="company-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Section */}
        <section className="space-y-6">
          {/* General Info */}
          <div className={formSectionClass}>
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label required>Company Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Careem"
                />
              </div>

              <div className="space-y-2">
                <Label>Slug (Optional URL identifier)</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => update("slug", e.target.value)}
                  placeholder="careem"
                />
              </div>

              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="e.g. Technology, FinTech, E-Commerce"
                />
              </div>

              <div className="space-y-2">
                <Label>Company Size</Label>
                <Input
                  value={form.size}
                  onChange={(e) => update("size", e.target.value)}
                  placeholder="e.g. 1,000–5,000 employees"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Headquarters Location</Label>
                <Input
                  value={form.headquarters}
                  onChange={(e) => update("headquarters", e.target.value)}
                  placeholder="e.g. Dubai, United Arab Emirates"
                />
              </div>
            </div>
          </div>

          {/* Links & Branding */}
          <div className={formSectionClass}>
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <Globe className="h-4 w-4 text-emerald-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Web Links & Branding</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://careem.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Careers Page URL</Label>
                <Input
                  type="url"
                  value={form.careersUrl}
                  onChange={(e) => update("careersUrl", e.target.value)}
                  placeholder="https://careem.com/careers"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Logo Image URL</Label>
                <Input
                  type="url"
                  value={form.logo}
                  onChange={(e) => update("logo", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* About / Description */}
          <div className={formSectionClass}>
            <div className="space-y-2">
              <Label>Company Description</Label>
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Overview of the company, mission, work culture, engineering values..."
              />
            </div>
          </div>
        </section>

        {/* Sidebar Settings & Preview */}
        <aside className={`${formAsideClass} self-start lg:sticky lg:top-24 space-y-5`}>
          {/* Logo preview */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-center dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
              Logo Preview
            </span>
            <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 p-2">
              {form.logo ? (
                <img
                  src={form.logo}
                  alt={form.name || "Company logo"}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              )}
            </div>
            <h3 className="mt-3 font-bold text-sm text-zinc-900 dark:text-white truncate">
              {form.name || "Company Name"}
              {form.verified && <ShieldCheck className="ml-1 inline h-4 w-4 text-blue-600" />}
            </h3>
            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
              {form.industry || "Industry not set"}
            </p>
          </div>

          {/* Status Switches */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-950 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Verified Company
                </span>
                <p className="text-[10px] text-zinc-500">Official verified badge</p>
              </div>
              <Switch
                checked={form.verified}
                onCheckedChange={(checked) => update("verified", checked)}
              />
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Active Status
                </span>
                <p className="text-[10px] text-zinc-500">Visible across job listings</p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(checked) => update("active", checked)}
              />
            </div>
          </div>
        </aside>
      </form>
    </AdminFormShell>
  );
}
