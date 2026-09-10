"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  DatabaseZap,
  ExternalLink,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLoading, AdminPage, AdminPageHeader } from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";

const types = [
  "manual",
  "employer-career-page",
  "greenhouse",
  "lever",
  "smartrecruiters",
  "workable",
  "ashby",
  "api",
  "other",
];

export default function JobSourcesPage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState({});
  const [logs, setLogs] = useState({});
  const [loadingLogs, setLoadingLogs] = useState({});
  const [search, setSearch] = useState("");
  const [provider, setProvider] = useState("all");
  const [sourceState, setSourceState] = useState("all");
  const [viewMode, setViewMode] = useState("card");

  const load = async ({ initial = false } = {}) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    const result = await jobsApi.sources();
    if (initial) setLoading(false);
    else setRefreshing(false);
    if (!result.success)
      return toast.error(result.error || "Unable to load sources");
    setSources(result.data?.data || []);
  };

  useEffect(() => {
    let active = true;
    jobsApi.sources().then((result) => {
      if (!active) return;
      setLoading(false);
      if (!result.success)
        return toast.error(result.error || "Unable to load sources");
      setSources(result.data?.data || []);
    });
    return () => {
      active = false;
    };
  }, []);

  const patchSource = (source) => {
    if (!source?._id) return;
    setSources((current) =>
      current.map((item) => (item._id === source._id ? source : item)),
    );
  };

  const refreshSource = async (id) => {
    const result = await jobsApi.sources();
    if (!result.success) return;
    const source = (result.data?.data || []).find((item) => item._id === id);
    patchSource(source);
  };

  const setSourceBusy = (id, action = null) => {
    setBusy((current) => {
      const next = { ...current };
      if (action) next[id] = action;
      else delete next[id];
      return next;
    });
  };

  const counts = useMemo(
    () => ({
      total: sources.length,
      enabled: sources.filter((source) => source.enabled).length,
      verified: sources.filter(
        (source) => source.verificationStatus === "Verified",
      ).length,
      attention: sources.filter(
        (source) => source.syncStatus === "failed" || source.lastError,
      ).length,
      uaeJobs: sources.reduce(
        (total, source) => total + (source.verifiedUaeJobsFound || 0),
        0,
      ),
    }),
    [sources],
  );

  const visibleSources = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sources
      .filter((source) => {
        if (provider !== "all" && source.type !== provider) return false;
        if (sourceState === "enabled" && !source.enabled) return false;
        if (sourceState === "disabled" && source.enabled) return false;
        if (
          sourceState === "attention" &&
          source.syncStatus !== "failed" &&
          !source.lastError
        )
          return false;
        if (
          sourceState === "unverified" &&
          source.verificationStatus === "Verified"
        )
          return false;
        return (
          !term ||
          [
            source.name,
            source.type,
            source.providerOrganizationId,
            source.verificationStatus,
          ].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(term),
          )
        );
      })
      .sort(
        (left, right) =>
          Number(right.enabled) - Number(left.enabled) ||
          left.name.localeCompare(right.name),
      );
  }, [provider, search, sourceState, sources]);

  const sync = async (source) => {
    setSourceBusy(source._id, "sync");
    const result = await jobsApi.syncSource(source._id);
    setSourceBusy(source._id);
    if (!result.success) {
      toast.error(result.error || "Synchronization failed");
      await refreshSource(source._id);
      return;
    }
    const stats = result.data?.data || {};
    patchSource(stats.source);
    toast.success(
      `Sync: ${stats.imported || 0} new, ${stats.updated || 0} updated, ${stats.duplicates || 0} duplicates`,
    );
    if (logs[source._id]) {
      const history = await jobsApi.sourceLogs(source._id);
      if (history.success)
        setLogs((current) => ({
          ...current,
          [source._id]: history.data?.data || [],
        }));
    }
  };

  const test = async (source) => {
    setSourceBusy(source._id, "test");
    const result = await jobsApi.testSource(source._id);
    setSourceBusy(source._id);
    if (!result.success)
      return toast.error(result.error || "Source verification failed");
    const details = result.data?.data || {};
    patchSource(details.source);
    toast.success(
      `${details.verificationStatus}: ${details.uaeJobsFound || 0} UAE jobs found`,
    );
  };

  const toggleEnabled = async (source) => {
    setSourceBusy(source._id, source.enabled ? "disable" : "enable");
    const result = await jobsApi.updateSource(source._id, {
      enabled: !source.enabled,
    });
    setSourceBusy(source._id);
    if (!result.success)
      return toast.error(result.error || "Unable to update source");
    const updated = result.data?.data;
    patchSource(updated);
    toast.success(
      source.enabled
        ? "Source disabled"
        : updated?.enabled
          ? "Source enabled after verification"
          : "Source remains disabled because verification did not pass",
    );
  };

  const toggleLogs = async (source) => {
    if (logs[source._id])
      return setLogs((current) => ({ ...current, [source._id]: null }));
    setLoadingLogs((current) => ({ ...current, [source._id]: true }));
    const result = await jobsApi.sourceLogs(source._id);
    setLoadingLogs((current) => ({ ...current, [source._id]: false }));
    if (!result.success)
      return toast.error(result.error || "Unable to load sync history");
    setLogs((current) => ({
      ...current,
      [source._id]: result.data?.data || [],
    }));
  };

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="Jobs ingestion"
        title="Job Sources"
        description="Configure public ATS feeds, auto-publish rules, synchronization intervals, and inspect each import run."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => load()}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing" : "Refresh"}
            </Button>
            <Link href="/jobs/sources/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add source
              </Button>
            </Link>
          </div>
        }
      />

      <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
        <b>Supported adapters:</b> Greenhouse, Lever, SmartRecruiters, Workable,
        Ashby, and mapped public JSON APIs. Provider credentials remain
        server-side; this page shows configuration state only.
      </div>

      {!loading && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Summary label="Total sources" value={counts.total} />
            <Summary label="Enabled" value={counts.enabled} tone="emerald" />
            <Summary label="Verified" value={counts.verified} tone="blue" />
            <Summary
              label="UAE jobs found"
              value={counts.uaeJobs}
              tone="violet"
            />
            <Summary
              label="Needs attention"
              value={counts.attention}
              tone={counts.attention ? "rose" : "zinc"}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company, provider, or board ID"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-40 sm:w-44">
                <Select
                  value={provider}
                  onChange={setProvider}
                  values={["all", ...types]}
                  labels={{ all: "All providers" }}
                />
              </div>
              <div className="w-40 sm:w-44">
                <Select
                  value={sourceState}
                  onChange={setSourceState}
                  values={[
                    "all",
                    "enabled",
                    "disabled",
                    "attention",
                    "unverified",
                  ]}
                  labels={{
                    all: "All states",
                    enabled: "Enabled",
                    disabled: "Disabled",
                    attention: "Needs attention",
                    unverified: "Not verified",
                  }}
                />
              </div>
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>
              Showing {visibleSources.length} of {sources.length} sources.
            </span>
          </div>
        </>
      )}

      {loading ? (
        <AdminLoading />
      ) : viewMode === "list" ? (
        /* List Table View */
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-225 text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Source / Company
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Adapter & Board
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Status & Trust
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Jobs Ingested
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Sync Health
                  </th>
                  <th className="px-5 py-3.5 text-right font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {visibleSources.map((source) => (
                  <tr
                    key={source._id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
                          <DatabaseZap className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/jobs/sources/${source._id}/edit`}
                            className="font-bold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 truncate block"
                          >
                            {source.name}
                          </Link>
                          <span className="text-[10px] text-zinc-400 uppercase font-mono">
                            {source.providerRegion || "global"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 capitalize">
                        {source.type}
                      </span>
                      <p className="mt-0.5 text-[11px] font-mono text-zinc-400 truncate max-w-45">
                        {source.providerOrganizationId || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Pill
                          text={source.enabled ? "Enabled" : "Disabled"}
                          good={source.enabled}
                        />
                        <Pill
                          text={source.verificationStatus || "Requires Review"}
                          good={source.verificationStatus === "Verified"}
                        />
                        {source.autoPublish && (
                          <Pill text="Auto" good={source.trusted} />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-zinc-900 dark:text-zinc-100">
                        {source.verifiedUaeJobsFound || 0} UAE
                      </span>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {source.numberImported || 0} imported ·{" "}
                        {source.numberUpdated || 0} updated
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold">
                        {source.syncStatus === "failed" ? (
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="capitalize">{source.syncStatus}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {source.lastSyncAt
                          ? `Last: ${new Date(source.lastSyncAt).toLocaleDateString()}`
                          : "Never synced"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => test(source)}
                          disabled={
                            source.type === "manual" ||
                            Boolean(busy[source._id])
                          }
                          title="Test public source"
                          className="h-8 px-2.5 text-xs"
                        >
                          {busy[source._id] === "test" ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : null}
                          {busy[source._id] === "test" ? "Testing" : "Test"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => sync(source)}
                          disabled={
                            !source.enabled ||
                            source.type === "manual" ||
                            source.syncStatus === "running" ||
                            Boolean(busy[source._id])
                          }
                          title="Sync now"
                          className="h-8 w-8"
                        >
                          {busy[source._id] === "sync" ||
                          source.syncStatus === "running" ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Link href={`/jobs/sources/${source._id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            className="h-8 w-8"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleSources.length && (
              <div className="p-16 text-center text-sm text-zinc-500">
                No sources match these filters.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid gap-1 lg:grid-cols-2">
          {visibleSources.map((source) => (
            <article
              key={source._id}
              className="rounded-4xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <DatabaseZap className="h-4 w-4 text-blue-600" />
                    <Link
                      href={`/jobs/sources/${source._id}/edit`}
                      className="font-black text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400"
                    >
                      {source.name}
                    </Link>
                    <Pill
                      text={source.enabled ? "Enabled" : "Disabled"}
                      good={source.enabled}
                    />
                    <Pill
                      text={source.verificationStatus || "Requires Review"}
                      good={source.verificationStatus === "Verified"}
                    />
                    <Pill
                      text={
                        source.autoPublish ? "Auto publish" : "Review first"
                      }
                      good={source.autoPublish && source.trusted}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                    {source.type} · every {source.syncIntervalHours || 12} hours
                    · quality {source.qualityThreshold || 90}+
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => test(source)}
                    disabled={
                      source.type === "manual" || Boolean(busy[source._id])
                    }
                    title="Test public source"
                  >
                    {busy[source._id] === "test" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : null}
                    {busy[source._id] === "test" ? "Testing" : "Test"}
                  </Button>
                  <Link href={`/jobs/sources/${source._id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={Boolean(busy[source._id])}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => sync(source)}
                    disabled={
                      !source.enabled ||
                      source.type === "manual" ||
                      source.syncStatus === "running" ||
                      Boolean(busy[source._id])
                    }
                    title="Sync now"
                  >
                    {busy[source._id] === "sync" ||
                    source.syncStatus === "running" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/70">
                <div className="min-w-0 text-[10px] text-zinc-500">
                  <span className="font-bold text-zinc-700 dark:text-zinc-200">
                    Board ID:
                  </span>{" "}
                  <span className="break-all font-mono">
                    {source.providerOrganizationId || "Not configured"}
                  </span>
                </div>
                {source.type !== "manual" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleEnabled(source)}
                    disabled={Boolean(busy[source._id])}
                  >
                    {busy[source._id] === "enable" ||
                    busy[source._id] === "disable" ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : null}
                    {source.enabled ? "Disable" : "Enable"}
                  </Button>
                )}
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <Stat
                  label="UAE jobs found"
                  value={source.verifiedUaeJobsFound || 0}
                />
                <Stat
                  label="Created / updated"
                  value={`${source.numberImported || 0} / ${source.numberUpdated || 0}`}
                />
                <Stat label="Rejected" value={source.numberRejected || 0} />
                <Stat label="Duplicates" value={source.numberDuplicates || 0} />
                <Stat
                  label="Last sync"
                  value={
                    source.lastSyncAt
                      ? new Date(source.lastSyncAt).toLocaleString()
                      : "Never"
                  }
                />
                <Stat
                  label="Last successful"
                  value={
                    source.lastSuccessfulSyncAt
                      ? new Date(source.lastSuccessfulSyncAt).toLocaleString()
                      : "Never"
                  }
                />
                <Stat
                  label="Next sync"
                  value={
                    source.nextSyncAt
                      ? new Date(source.nextSyncAt).toLocaleString()
                      : "Manual"
                  }
                />
                <Stat
                  label="Errors"
                  value={source.lastError ? "Review" : "0"}
                />
              </dl>
              <div className="mt-4 flex items-center gap-2 text-xs font-bold">
                {source.syncStatus === "failed" ? (
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                <span>{source.syncStatus}</span>
                <span className="text-zinc-400">
                  · {source.availabilityStatus || "available"}
                </span>
                {source.credentialEnvKey && (
                  <span className="ml-auto text-[10px] text-zinc-400">
                    Credential:{" "}
                    {source.credentialConfigured ? "configured" : "missing"}
                  </span>
                )}
              </div>
              {source.lastError && (
                <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-[10px] leading-4 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
                  {source.lastError}
                </p>
              )}
              {source.verificationNotes && (
                <p className="mt-3 rounded-2xl bg-zinc-50 p-3 text-[10px] leading-4 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  {source.verificationNotes}
                  {source.lastVerifiedAt
                    ? ` Verified ${new Date(source.lastVerifiedAt).toLocaleString()}.`
                    : ""}
                </p>
              )}
              <button
                onClick={() => toggleLogs(source)}
                disabled={loadingLogs[source._id]}
                className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-blue-600 hover:underline cursor-pointer"
              >
                {loadingLogs[source._id] ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${logs[source._id] ? "rotate-180" : ""}`}
                  />
                )}
                {loadingLogs[source._id]
                  ? "Loading history"
                  : "Recent sync history"}
              </button>
              {logs[source._id] && (
                <div className="mt-3 space-y-2">
                  {logs[source._id].map((log) => (
                    <div
                      key={log._id}
                      className="rounded-2xl bg-zinc-50 p-3 text-[10px] dark:bg-zinc-900"
                    >
                      <div className="flex justify-between">
                        <b className="uppercase">
                          {log.status} · {log.trigger}
                        </b>
                        <span className="text-zinc-400">
                          {new Date(log.startedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-zinc-500">
                        Fetched {log.counts?.fetched || 0} · created{" "}
                        {log.counts?.created || 0} · updated{" "}
                        {log.counts?.updated || 0} · unchanged{" "}
                        {log.counts?.unchanged || 0} · rejected{" "}
                        {log.counts?.rejected || 0} · duplicates{" "}
                        {log.counts?.duplicates || 0}
                      </p>
                      {log.errors?.length > 0 && (
                        <p className="mt-1 text-rose-600">
                          {log.errors[0].message}
                          {log.errors.length > 1
                            ? ` (+${log.errors.length - 1} more)`
                            : ""}
                        </p>
                      )}
                    </div>
                  ))}
                  {!logs[source._id].length && (
                    <p className="text-xs text-zinc-400">No sync runs yet.</p>
                  )}
                </div>
              )}
            </article>
          ))}
          {!visibleSources.length && (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <DatabaseZap className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-3 font-bold">No sources match these filters.</p>
              <button
                className="mt-2 text-xs font-bold text-blue-600"
                onClick={() => {
                  setSearch("");
                  setProvider("all");
                  setSourceState("all");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      )}
    </AdminPage>
  );
}

function Pill({ text, good }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${good ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}
    >
      {text}
    </span>
  );
}

function Summary({ label, value, tone = "zinc" }) {
  const tones = {
    zinc: "border-zinc-200 bg-white text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    blue: "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100",
    violet:
      "border-violet-200 bg-violet-50 text-violet-950 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100",
    rose: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-100",
  };
  return (
    <div
      className={`rounded-3xl border p-4 shadow-xs ${tones[tone] || tones.zinc}`}
    >
      <p className="text-[10px] font-black uppercase tracking-wide opacity-60">
        {label}
      </p>
      <p className="mt-1 font-outfit text-2xl font-black">{value}</p>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="mt-1 font-black">{value}</dd>
    </div>
  );
}

function Select({ value, onChange, values, labels = {} }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-zinc-800 dark:bg-zinc-900"
    >
      {values.map((item) => (
        <option key={item} value={item}>
          {labels[item] || item}
        </option>
      ))}
    </select>
  );
}
