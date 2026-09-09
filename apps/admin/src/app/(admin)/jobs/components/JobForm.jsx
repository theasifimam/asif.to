"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";
import { jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminLoading, AdminPage, AdminPageHeader } from "@/components/admin";

const locations = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
  "Al Ain",
  "United Arab Emirates",
];
const categories = [
  "Software Development",
  "IT",
  "Engineering",
  "Sales",
  "Marketing",
  "Finance",
  "Accounting",
  "Administration",
  "Document Control",
  "Operations",
  "Customer Service",
  "HR",
  "Hospitality",
  "Healthcare",
  "Construction",
  "Logistics",
];
const initial = {
  title: "",
  slug: "",
  company: "",
  companyLogo: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  skills: "",
  category: "Software Development",
  location: "Dubai",
  emirate: "Dubai",
  employmentType: "full-time",
  workMode: "on-site",
  experienceLevel: "mid",
  minimumExperience: "",
  maximumExperience: "",
  minimumSalary: "",
  maximumSalary: "",
  salaryPeriod: "month",
  salaryVisible: false,
  applicationType: "external",
  applicationUrl: "",
  source: "",
  sourceUrl: "",
  sourceJobId: "",
  postedAt: "",
  expiresAt: "",
  status: "draft",
  featured: false,
  verified: false,
  isDemo: false,
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
};
const toInputDate = (value) =>
  value
    ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16)
    : "";
const arrays = ["responsibilities", "requirements", "benefits", "skills"];

function Field({ label, children, hint, required }) {
  return (
    <div className="space-y-1.5">
      <Label required={required}>{label}</Label>
      {children}
      {hint && <p className="text-[10px] leading-4 text-zinc-400">{hint}</p>}
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-4xl border border-zinc-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
      <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{title}</h2>
      {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4 transition-colors hover:bg-zinc-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-900/80">
      <span>
        <span className="block text-xs font-black text-zinc-900 dark:text-zinc-100">{label}</span>
        {hint && <span className="mt-1 block text-[10px] text-zinc-400">{hint}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export default function JobForm({ jobId = null }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [companies, setCompanies] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(Boolean(jobId));
  const [saving, setSaving] = useState(false);
  const [imported, setImported] = useState(false);
  const [overrides, setOverrides] = useState([]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    Promise.all([
      jobsApi.companies({ limit: 100 }),
      jobsApi.sources(),
      jobId ? jobsApi.get(jobId) : Promise.resolve(null),
    ]).then(([companyResult, sourceResult, jobResult]) => {
      if (companyResult.success) setCompanies(companyResult.data?.data || []);
      if (sourceResult.success) setSources(sourceResult.data?.data || []);
      if (jobId) {
        if (!jobResult?.success) {
          toast.error(jobResult?.error || "Unable to load job");
          router.push("/jobs");
          return;
        }
        const job = jobResult.data?.data;
        const next = {
          ...initial,
          ...job,
          company: job.company?._id || job.company || "",
          source: job.source?._id || job.source || "manual",
          postedAt: toInputDate(job.postedAt),
          expiresAt: toInputDate(job.expiresAt),
        };
        arrays.forEach((key) => {
          next[key] = (job[key] || []).join("\n");
        });
        setForm(next);
        setImported(Boolean(job.importedAt));
        setOverrides(job.overrideFields || []);
      }
      setLoading(false);
    });
  }, [jobId, router]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.company) {
      return toast.error("Please select a company");
    }
    setSaving(true);
    const payload = {
      ...form,
      postedAt: form.postedAt
        ? new Date(form.postedAt).toISOString()
        : new Date().toISOString(),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    };
    arrays.forEach((key) => {
      payload[key] = form[key]
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);
    });
    if (!payload.source || payload.source === "manual") delete payload.source;
    const result = jobId
      ? await jobsApi.update(jobId, payload)
      : await jobsApi.create(payload);
    setSaving(false);
    if (!result.success) return toast.error(result.error || "Unable to save job");
    toast.success(jobId ? "Job updated" : "Job created");
    router.push("/jobs");
  };

  if (loading)
    return (
      <AdminPage className="py-8">
        <AdminLoading label="Loading job" />
      </AdminPage>
    );

  return (
    <AdminPage className="space-y-6 py-5" size="lg">
      <AdminPageHeader
        eyebrow={jobId ? "Edit job" : "New job"}
        title={jobId ? form.title || "Edit job" : "Create UAE job"}
        description="All public fields remain editable even when a listing came from an importer."
        back={
          <Link
            href="/jobs"
            className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-blue-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to jobs
          </Link>
        }
        actions={
          <Button type="submit" form="job-editor" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save job"}
          </Button>
        }
      />

      {imported && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          <div className="flex gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              <b>Importer-safe editing.</b> Fields changed here are added to the override list
              and will not be overwritten on future syncs. {form.creationOrigin === "ats_import" ? "ATS Import" : form.creationOrigin === "api_import" ? "API Import" : "Automated Import"} · {form.sourceName || form.sourceProvider} · {form.importStatus || "imported"} · quality {form.importQualityScore ?? "not scored"}/100.{" "}
              {overrides.length
                ? `Currently protected: ${overrides.join(", ")}.`
                : "No fields are protected yet."}
            </span>
          </div>
        </div>
      )}

      <form id="job-editor" onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <main className="space-y-6">
          <Section title="Core listing">
            <Field label="Job title" required>
              <Input
                required
                maxLength={220}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </Field>

            <Field
              label="Slug"
              hint="Leave blank on new jobs to generate a unique SEO slug."
            >
              <Input
                maxLength={220}
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="e.g. senior-frontend-engineer-dubai"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company" required>
                <Select
                  value={form.company || "none"}
                  onValueChange={(val) => set("company", val === "none" ? "" : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" disabled>
                      Select company
                    </SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Link
                  href="/jobs/companies"
                  className="mt-1 inline-block text-[10px] font-bold text-blue-600 hover:underline"
                >
                  Manage companies
                </Link>
              </Field>

              <Field label="Company logo override (URL)">
                <Input
                  type="url"
                  value={form.companyLogo || ""}
                  onChange={(e) => set("companyLogo", e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field label="Description" required>
              <Textarea
                required
                rows={12}
                maxLength={30000}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Full job description and context..."
              />
            </Field>
          </Section>

          <Section
            title="Role details"
            description="Use one responsibility, requirement, benefit, or skill per line."
          >
            {arrays.map((key) => (
              <Field
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                <Textarea
                  rows={key === "skills" ? 3 : 6}
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={`Add ${key} (one per line)...`}
                />
              </Field>
            ))}
          </Section>

          <Section title="Taxonomy and conditions">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <Select
                  value={form.category}
                  onValueChange={(val) => set("category", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Location">
                <Select
                  value={form.location}
                  onValueChange={(val) => {
                    set("location", val);
                    set("emirate", val === "Al Ain" ? "Abu Dhabi" : val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Emirate" required>
                <Input
                  required
                  value={form.emirate}
                  onChange={(e) => set("emirate", e.target.value)}
                />
              </Field>

              <Field label="Country">
                <Input disabled value="United Arab Emirates (AE)" />
              </Field>

              <Field label="Employment type">
                <Select
                  value={form.employmentType}
                  onValueChange={(val) => set("employmentType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "full-time",
                      "part-time",
                      "contract",
                      "temporary",
                      "internship",
                      "freelance",
                      "not-specified",
                    ].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Work mode">
                <Select
                  value={form.workMode}
                  onValueChange={(val) => set("workMode", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {["on-site", "hybrid", "remote", "not-specified"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Experience level">
                <Select
                  value={form.experienceLevel}
                  onValueChange={(val) => set("experienceLevel", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "entry",
                      "junior",
                      "mid",
                      "senior",
                      "lead",
                      "manager",
                      "director",
                      "executive",
                      "not-specified",
                    ].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-2">
                <Field label="Min years">
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={form.minimumExperience ?? ""}
                    onChange={(e) => set("minimumExperience", e.target.value)}
                    placeholder="e.g. 3"
                  />
                </Field>
                <Field label="Max years">
                  <Input
                    type="number"
                    min="0"
                    max="60"
                    value={form.maximumExperience ?? ""}
                    onChange={(e) => set("maximumExperience", e.target.value)}
                    placeholder="e.g. 6"
                  />
                </Field>
              </div>
            </div>
          </Section>

          <Section title="Salary">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Minimum AED">
                <Input
                  type="number"
                  min="0"
                  value={form.minimumSalary ?? ""}
                  onChange={(e) => set("minimumSalary", e.target.value)}
                  placeholder="Min salary"
                />
              </Field>
              <Field label="Maximum AED">
                <Input
                  type="number"
                  min="0"
                  value={form.maximumSalary ?? ""}
                  onChange={(e) => set("maximumSalary", e.target.value)}
                  placeholder="Max salary"
                />
              </Field>
              <Field label="Period">
                <Select
                  value={form.salaryPeriod}
                  onValueChange={(val) => set("salaryPeriod", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    {["hour", "day", "month", "year"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Toggle
              label="Show salary publicly"
              checked={form.salaryVisible}
              onChange={(value) => set("salaryVisible", value)}
              hint="Structured data only includes salary when this is on and values exist."
            />
          </Section>

          <Section title="Application">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Application type">
                <Select
                  value={form.applicationType}
                  onValueChange={(val) => set("applicationType", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External company/ATS</SelectItem>
                    <SelectItem value="internal">Direct through asif.to</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {form.applicationType === "external" && (
                <Field label="External application URL" required>
                  <Input
                    required
                    type="url"
                    value={form.applicationUrl}
                    onChange={(e) => set("applicationUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </Field>
              )}
            </div>
            <p className="text-[10px] text-zinc-400">
              External URLs are not sent in public API responses. They are returned only after an
              authenticated apply click is recorded.
            </p>
          </Section>

          <Section title="SEO">
            <Field label="SEO title">
              <Input
                maxLength={180}
                value={form.seoTitle || ""}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder="Custom meta title (optional)"
              />
            </Field>
            <Field label="SEO description">
              <Textarea
                rows={3}
                maxLength={500}
                value={form.seoDescription || ""}
                onChange={(e) => set("seoDescription", e.target.value)}
                placeholder="Custom meta description (optional)"
              />
            </Field>
            <Field label="Canonical URL">
              <Input
                type="url"
                value={form.canonicalUrl || ""}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder="Leave empty for default job URL"
              />
            </Field>
          </Section>
        </main>

        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Section title="Publishing">
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(val) => set("status", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "draft",
                    "pending",
                    "published",
                    "hidden",
                    "expired",
                    "rejected",
                    "archived",
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Posted date">
              <Input
                type="datetime-local"
                value={form.postedAt}
                onChange={(e) => set("postedAt", e.target.value)}
              />
            </Field>

            <Field label="Application deadline">
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
              />
            </Field>

            <Toggle
              label="Featured job"
              checked={form.featured}
              onChange={(value) => set("featured", value)}
            />
            <Toggle
              label="Verified listing"
              checked={form.verified}
              onChange={(value) => set("verified", value)}
            />
            <Toggle
              label="Demo/test listing"
              checked={form.isDemo}
              onChange={(value) => set("isDemo", value)}
              hint="Demo jobs are visibly labeled and noindexed."
            />
          </Section>

          <Section title="Source attribution">
            <Field label="Source">
              <Select
                value={form.source || "manual"}
                onValueChange={(val) => set("source", val === "manual" ? "" : val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source._id} value={source._id}>
                      {source.name} ({source.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Source job ID">
              <Input
                value={form.sourceJobId || ""}
                onChange={(e) => set("sourceJobId", e.target.value)}
                placeholder="External reference ID"
              />
            </Field>

            <Field label="Original source URL">
              <Input
                type="url"
                value={form.sourceUrl || ""}
                onChange={(e) => set("sourceUrl", e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </Section>
        </aside>
      </form>
    </AdminPage>
  );
}
