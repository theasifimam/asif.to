"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, DatabaseZap, Save, Settings2, Sliders, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import { getModuleBackUrl } from "@/hooks/useModuleHistory";
import AdminFormShell, { formAsideClass, formSectionClass } from "@/components/forms/AdminFormShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogoLoader from "@/components/ui/LogoLoader";

const types = [
  { value: "manual", label: "Manual Data Entry" },
  { value: "employer-career-page", label: "Employer Career Page" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever", label: "Lever" },
  { value: "smartrecruiters", label: "SmartRecruiters" },
  { value: "workable", label: "Workable" },
  { value: "ashby", label: "Ashby" },
  { value: "api", label: "Custom JSON API" },
  { value: "other", label: "Other" },
];

const emptySource = {
  name: "",
  slug: "",
  type: "api",
  providerOrganizationId: "",
  providerRegion: "global",
  baseUrl: "",
  careersUrl: "",
  endpointUrl: "",
  jobsPath: "",
  credentialEnvKey: "",
  syncFrequency: "daily",
  syncIntervalHours: 12,
  qualityThreshold: 90,
  enabled: true,
  autoPublish: false,
  trusted: false,
  fieldMapping: "{}",
};

export default function SourceForm({ sourceId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getModuleBackUrl("/jobs/sources", searchParams.get("returnTo"));

  const [form, setForm] = useState(emptySource);
  const [loading, setLoading] = useState(Boolean(sourceId));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sourceId) return;

    let active = true;
    jobsApi.getSource(sourceId).then((res) => {
      if (!active) return;
      if (res.success && res.data?.data) {
        const item = res.data.data;
        setForm({
          ...emptySource,
          ...item,
          fieldMapping:
            typeof item.fieldMapping === "object"
              ? JSON.stringify(item.fieldMapping, null, 2)
              : item.fieldMapping || "{}",
        });
      } else {
        toast.error(res.error || "Source not found");
      }
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [sourceId]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();

    let fieldMappingObj;
    try {
      fieldMappingObj = JSON.parse(form.fieldMapping || "{}");
    } catch {
      return toast.error("Field mapping must be valid JSON");
    }

    setSaving(true);
    const payload = {
      ...form,
      syncIntervalHours: Number(form.syncIntervalHours) || 12,
      qualityThreshold: Number(form.qualityThreshold) || 90,
      fieldMapping: fieldMappingObj,
    };

    const res = sourceId
      ? await jobsApi.updateSource(sourceId, payload)
      : await jobsApi.createSource(payload);

    setSaving(false);

    if (res.success) {
      toast.success(sourceId ? "Source updated successfully" : "Source created successfully");
      router.push(returnTo);
    } else {
      toast.error(res.error || "Unable to save source");
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
      eyebrow="Jobs / Sources"
      title={sourceId ? `Edit Source: ${form.name || "Job Source"}` : "Add New Job Source"}
      description="Configure public ATS integrations, endpoint mappings, and scheduled sync parameters for job ingestion."
      back={
        <Link href={returnTo} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to job sources
        </Link>
      }
      actions={
        <Button form="source-form" type="submit" disabled={saving} className="rounded-full">
          {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : sourceId ? "Update Source" : "Create Source"}
        </Button>
      }
    >
      <form id="source-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Main Content Sections */}
        <section className="space-y-6">
          {/* General Information */}
          <div className={formSectionClass}>
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <DatabaseZap className="h-4 w-4 text-blue-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Source Information</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label required>Source / Company Name</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Careem, Deliveroo UAE"
                />
              </div>

              <div className="space-y-2">
                <Label required>Provider / Integration Type</Label>
                <Select value={form.type} onValueChange={(val) => update("type", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Provider Organization / Board ID</Label>
                <Input
                  value={form.providerOrganizationId}
                  onChange={(e) => update("providerOrganizationId", e.target.value)}
                  placeholder="e.g. careem, deliveroo (board token or slug)"
                />
                <p className="text-[11px] text-zinc-500">Board token, site ID, company slug, or ATS identifier.</p>
              </div>

              <div className="space-y-2">
                <Label>Provider Region</Label>
                <Select value={form.providerRegion} onValueChange={(val) => update("providerRegion", val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="eu">Europe (EU)</SelectItem>
                    <SelectItem value="us">United States (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* URLs & Endpoints */}
          <div className={formSectionClass}>
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <Sliders className="h-4 w-4 text-violet-600" />
              <h2 className="font-semibold text-zinc-900 dark:text-white">Endpoints & URLs</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  type="url"
                  value={form.baseUrl}
                  onChange={(e) => update("baseUrl", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Careers URL</Label>
                <Input
                  type="url"
                  value={form.careersUrl}
                  onChange={(e) => update("careersUrl", e.target.value)}
                  placeholder="https://careers.company.com"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Custom JSON Endpoint (Optional)</Label>
                <Input
                  type="url"
                  value={form.endpointUrl}
                  onChange={(e) => update("endpointUrl", e.target.value)}
                  placeholder="https://api.example.com/v1/jobs"
                />
                <p className="text-[11px] text-zinc-500">Overrides standard provider URL for custom API imports.</p>
              </div>

              <div className="space-y-2">
                <Label>Jobs Array JSON Path</Label>
                <Input
                  value={form.jobsPath}
                  onChange={(e) => update("jobsPath", e.target.value)}
                  placeholder="e.g. data.jobs or jobs"
                />
              </div>

              <div className="space-y-2">
                <Label>Credential Environment Variable</Label>
                <Input
                  value={form.credentialEnvKey}
                  onChange={(e) => update("credentialEnvKey", e.target.value.toUpperCase())}
                  placeholder="e.g. JOBS_VENDOR_API_TOKEN"
                />
              </div>
            </div>
          </div>

          {/* Advanced Field Mapping */}
          <div className={formSectionClass}>
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-amber-500" />
                <h2 className="font-semibold text-zinc-900 dark:text-white">Field Mapping JSON</h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">JSON</span>
            </div>

            <p className="text-xs leading-5 text-zinc-500">
              For generic public JSON APIs, map custom response fields (e.g. `externalId`, `title`, `location`, `url`, `publishedAt`) to the internal schema.
            </p>

            <textarea
              rows={6}
              value={form.fieldMapping}
              onChange={(e) => update("fieldMapping", e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs text-zinc-900 focus:border-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder='{\n  "title": "jobTitle",\n  "location": "officeLocation"\n}'
            />
          </div>
        </section>

        {/* Sidebar Settings */}
        <aside className={`${formAsideClass} self-start lg:sticky lg:top-24 space-y-5`}>
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs leading-5 text-zinc-600 dark:text-zinc-300">
            <strong className="block text-blue-600 dark:text-blue-400 font-bold mb-1">ATS Ingestion Adapter</strong>
            Supported adapters automatically sanitize, extract UAE location coordinates, verify company profiles, and score listing quality.
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Sync Schedule</Label>
              <Select value={form.syncFrequency} onValueChange={(val) => update("syncFrequency", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Only</SelectItem>
                  <SelectItem value="daily">Daily Sync</SelectItem>
                  <SelectItem value="weekly">Weekly Sync</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Interval in Hours (6–168)</Label>
              <Input
                type="number"
                min="6"
                max="168"
                value={form.syncIntervalHours}
                onChange={(e) => update("syncIntervalHours", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Auto-publish Quality Threshold (50-100)</Label>
              <Input
                type="number"
                min="50"
                max="100"
                value={form.qualityThreshold}
                onChange={(e) => update("qualityThreshold", e.target.value)}
              />
            </div>

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Enabled</span>
                  <p className="text-[10px] text-zinc-500">Allow background syncs</p>
                </div>
                <Switch
                  checked={form.enabled}
                  onCheckedChange={(checked) => update("enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Trusted Source</span>
                  <p className="text-[10px] text-zinc-500">High-reputation employer</p>
                </div>
                <Switch
                  checked={form.trusted}
                  onCheckedChange={(checked) => update("trusted", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/60">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Auto Publish</span>
                  <p className="text-[10px] text-zinc-500">Publish high-quality jobs</p>
                </div>
                <Switch
                  checked={form.autoPublish}
                  onCheckedChange={(checked) => update("autoPublish", checked)}
                />
              </div>
            </div>
          </div>
        </aside>
      </form>
    </AdminFormShell>
  );
}
