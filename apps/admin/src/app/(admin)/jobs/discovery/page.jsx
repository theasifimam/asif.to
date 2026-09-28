"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { discoveryApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminContent,
  AdminFilters,
  AdminLoading,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "discovered", label: "Discovered" },
  { value: "verifying", label: "Verifying" },
  { value: "verified", label: "Verified" },
  { value: "created", label: "Created" },
  { value: "no_uae_jobs", label: "No UAE Jobs" },
  { value: "requires_review", label: "Requires Review" },
  { value: "rejected", label: "Rejected" },
  { value: "blocked", label: "Blocked" },
  { value: "failed", label: "Failed" },
];

const PROVIDERS = [
  "all",
  "greenhouse",
  "lever",
  "smartrecruiters",
  "workable",
  "ashby",
  "recruitee",
  "pinpoint",
  "teamtailor",
  "unknown",
];

const METHODS = [
  { value: "all", label: "All Methods" },
  { value: "existing_job", label: "Existing Job" },
  { value: "ats_discovery", label: "ATS Discovery" },
  { value: "career_page", label: "Career Page" },
  { value: "existing_source", label: "Existing Source" },
  { value: "other", label: "Other" },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  discovered:
    "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  verifying:
    "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  verified:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  created:
    "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  no_uae_jobs: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  requires_review:
    "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  blocked: "bg-red-700/15 text-red-500 border-red-700/30",
  failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status] ||
    "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${style}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ score }) {
  const color =
    score >= 80
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 dark:text-white/50 tabular-nums w-6 text-right">
        {score}
      </span>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-zinc-500 dark:text-white/50 font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>
        {value ?? "—"}
      </span>
      {sub && (
        <span className="text-xs text-zinc-500 dark:text-white/40">{sub}</span>
      )}
    </div>
  );
}

// ─── Candidate row actions ────────────────────────────────────────────────────

function CandidateActions({ candidate, onAction }) {
  const [loading, setLoading] = useState(null);

  const act = async (action, fn, successMsg) => {
    setLoading(action);
    try {
      const result = await fn();
      if (!result.success)
        return toast.error(result.error || `${action} failed`);
      toast.success(successMsg);
      onAction();
    } catch {
      toast.error(`${action} failed`);
    } finally {
      setLoading(null);
    }
  };

  const busy = (a) => loading === a;

  const actionable = (id) =>
    !["created", "rejected", "blocked"].includes(candidate.status) ||
    id === "retry";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {[
        "discovered",
        "failed",
        "no_uae_jobs",
        "requires_review",
        "verifying",
      ].includes(candidate.status) && (
        <Button
          size="xs"
          variant="ghost"
          className="h-7 text-xs gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          disabled={!!loading}
          onClick={() =>
            act(
              "Verify",
              () => discoveryApi.verify(candidate._id),
              "Verification started",
            )
          }
        >
          {busy("Verify") ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          Verify
        </Button>
      )}
      {["verified", "requires_review"].includes(candidate.status) && (
        <Button
          size="xs"
          variant="ghost"
          className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          disabled={!!loading}
          onClick={() =>
            act(
              "Approve",
              () => discoveryApi.approve(candidate._id),
              "Company & source created!",
            )
          }
        >
          {busy("Approve") ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3" />
          )}
          Approve
        </Button>
      )}
      {["failed", "no_uae_jobs", "requires_review", "blocked"].includes(
        candidate.status,
      ) && (
        <Button
          size="xs"
          variant="ghost"
          className="h-7 text-xs gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          disabled={!!loading}
          onClick={() =>
            act(
              "Retry",
              () => discoveryApi.retry(candidate._id),
              "Retry queued",
            )
          }
        >
          {busy("Retry") ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RotateCcw className="w-3 h-3" />
          )}
          Retry
        </Button>
      )}
      {!["rejected", "created"].includes(candidate.status) && (
        <Button
          size="xs"
          variant="ghost"
          className="h-7 text-xs gap-1 text-red-600 dark:text-red-400 hover:text-red-300 hover:bg-red-500/10"
          disabled={!!loading}
          onClick={() =>
            act(
              "Reject",
              () => discoveryApi.reject(candidate._id, ""),
              "Candidate rejected",
            )
          }
        >
          {busy("Reject") ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Ban className="w-3 h-3" />
          )}
          Reject
        </Button>
      )}
      {candidate.createdJobSourceId && (
        <a
          href={`/jobs/sources/${candidate.createdJobSourceId._id || candidate.createdJobSourceId}`}
          className="inline-flex items-center gap-1 h-7 px-2 text-xs text-violet-600 dark:text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View Source
        </a>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DiscoveryPage() {
  const [stats, setStats] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [recentRuns, setRecentRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningDiscovery, setRunningDiscovery] = useState(false);

  // Filters
  const [status, setStatus] = useState("all");
  const [provider, setProvider] = useState("all");
  const [method, setMethod] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(
    async ({ initial = false } = {}) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      try {
        const params = { page, limit: 50 };
        if (status !== "all") params.status = status;
        if (provider !== "all") params.provider = provider;
        if (method !== "all") params.method = method;
        if (search) params.search = search;

        const [dashRes, candidatesRes] = await Promise.all([
          discoveryApi.dashboard(),
          discoveryApi.candidates(params),
        ]);
        if (dashRes.success) {
          setStats(dashRes.data?.data?.stats);
          setRecentRuns(dashRes.data?.data?.recentRuns || []);
        }
        if (candidatesRes.success) {
          setCandidates(candidatesRes.data?.data?.candidates || []);
          setPagination(
            candidatesRes.data?.data?.pagination || {
              page: 1,
              total: 0,
              pages: 1,
            },
          );
        }
      } finally {
        if (initial) setLoading(false);
        else setRefreshing(false);
      }
    },
    [status, provider, method, search, page],
  );

  useEffect(() => {
    load({ initial: true });
  }, [load]);

  const triggerRun = async () => {
    setRunningDiscovery(true);
    const res = await discoveryApi.run();
    setRunningDiscovery(false);
    if (res.success) {
      toast.success(
        "Discovery run started in the background. Refresh in a minute.",
      );
      setTimeout(() => load(), 5000);
    } else {
      toast.error(res.error || "Could not start discovery run");
    }
  };

  const byStatus = stats?.byStatus || {};
  const lastRun = stats?.lastRun;

  if (loading) return <AdminLoading />;

  return (
    <AdminPage>
      <AdminPageHeader
        title="Auto Discovery"
        description="Continuously discovers new UAE companies and their public ATS job sources"
        icon={<Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
        actions={
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load()}
              disabled={refreshing}
              className="gap-2 text-zinc-600 dark:text-white/70 hover:text-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={triggerRun}
              disabled={runningDiscovery}
              className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {runningDiscovery ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run Discovery Now
            </Button>
          </div>
        }
      />

      {/* ── Stats grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 mb-1">
        <StatCard
          label="Discovered"
          value={byStatus.discovered}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Verified"
          value={byStatus.verified}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Created"
          value={byStatus.created}
          color="text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Needs Review"
          value={byStatus.requires_review}
          color="text-orange-600 dark:text-orange-400"
        />
        <StatCard
          label="Failed"
          value={(byStatus.failed || 0) + (byStatus.blocked || 0)}
          color="text-red-600 dark:text-red-400"
        />
      </div>

      {/* ── Last run banner ──────────────────────────────────────────────────── */}
      {lastRun && (
        <div className="mb-1 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-white/70">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Last Discovery Run</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm sm:ml-auto">
            <span className="text-zinc-500 dark:text-white/50">
              {new Date(lastRun.startedAt).toLocaleString()}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              +{lastRun.candidatesDiscovered ?? 0} candidates
            </span>
            <span className="text-violet-600 dark:text-violet-400">
              +{lastRun.sourcesCreated ?? 0} sources
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              +{lastRun.jobsImported ?? 0} jobs
            </span>
            <StatusBadge status={lastRun.status} />
          </div>
          {!stats?.config?.enabled && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-0.5">
              Discovery disabled via DISCOVERY_ENABLED=false
            </span>
          )}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <AdminFilters>
        <AdminSearch
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search company, domain, ID..."
        />
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provider}
          onValueChange={(val) => {
            setProvider(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue placeholder="All Providers" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            {PROVIDERS.map((p) => (
              <SelectItem key={p} value={p}>
                {p === "all" ? "All Providers" : p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={method}
          onValueChange={(val) => {
            setMethod(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-full border border-zinc-200/80 bg-white/90 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b] md:w-44">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
            {METHODS.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminFilters>

      <AdminContent plain={false}>
        {/* ── Candidates table ─────────────────────────────────────────────────── */}
        {candidates.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 rounded-3xl sm:rounded-4xl border border-zinc-200/60 bg-white text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-950">
            <Sparkles className="w-10 h-10 text-zinc-300 dark:text-white/20 mx-auto mb-3" />
            <p className="text-sm font-medium">
              {search || status !== "all"
                ? "No candidates match your filters."
                : 'No discovery candidates yet. Click "Run Discovery Now" to start.'}
            </p>
          </div>
        ) : (
          <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-left text-sm">
                <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="px-6 py-4.5">Company</th>
                    <th className="px-6 py-4.5">Provider</th>
                    <th className="px-6 py-4.5">Method</th>
                    <th className="px-6 py-4.5 w-32">Confidence</th>
                    <th className="px-6 py-4.5 text-center">UAE Jobs</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5">Discovered</th>
                    <th className="px-6 py-4.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {candidates.map((candidate) => (
                    <tr
                      key={candidate._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4.5">
                        <div className="font-bold text-zinc-950 dark:text-white transition-colors truncate max-w-48">
                          {candidate.companyName}
                        </div>
                        {candidate.domain && (
                          <div className="mt-0.5 text-xs text-zinc-400 truncate">
                            {candidate.domain}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="text-zinc-600 dark:text-zinc-300 text-xs font-mono">
                          {candidate.detectedProvider}
                        </div>
                        {candidate.providerOrganizationId && (
                          <div className="text-zinc-400 dark:text-zinc-500 text-xs truncate max-w-32">
                            {candidate.providerOrganizationId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                          {candidate.discoveryMethod?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 w-32">
                        <ConfidenceBar score={candidate.confidenceScore || 0} />
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        {candidate.verifiedUaeJobsFound > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                            {candidate.verifiedUaeJobsFound}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-600">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <StatusBadge status={candidate.status} />
                        {candidate.lastError && (
                          <div
                            className="text-[10px] text-red-600 dark:text-red-400 mt-1 truncate max-w-40"
                            title={candidate.lastError}
                          >
                            {candidate.lastError.slice(0, 60)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-zinc-500 dark:text-zinc-400 text-xs whitespace-nowrap">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                        {candidate.verificationAttempts > 0 && (
                          <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase mt-0.5 font-bold tracking-wider">
                            {candidate.verificationAttempts} attempt
                            {candidate.verificationAttempts !== 1 ? "s" : ""}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <CandidateActions
                          candidate={candidate}
                          onAction={() => load()}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && candidates.length > 0 && (
              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total || 0}
                limit={50}
                itemLabel="candidates"
                onPageChange={(p) => setPage(p)}
                onLimitChange={() => {}} // static limit for now
              />
            )}
          </div>
        )}

        {/* ── Recent runs ─────────────────────────────────────────────────────── */}
        {recentRuns.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 px-8">
              Recent Discovery Runs
            </h3>
            <div className="admin-surface w-full rounded-[28px] sm:rounded-4xl overflow-hidden mb-6">
              <table className="admin-table w-full text-left text-sm">
                <thead className="border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/75 dark:bg-[#18181b]/60 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.16em] text-zinc-400 dark:text-zinc-500">
                  <tr>
                    <th className="px-6 py-4.5">Run ID</th>
                    <th className="px-6 py-4.5">Started</th>
                    <th className="px-6 py-4.5">Status</th>
                    <th className="px-6 py-4.5 text-right">Discovered</th>
                    <th className="px-6 py-4.5 text-right">Sources</th>
                    <th className="px-6 py-4.5 text-right">Jobs</th>
                    <th className="px-6 py-4.5 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {recentRuns.map((run) => (
                    <tr
                      key={run._id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-6 py-4.5 font-mono text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-48">
                        {run.runId}
                      </td>
                      <td className="px-6 py-4.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(run.startedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4.5">
                        <StatusBadge status={run.status} />
                      </td>
                      <td className="px-6 py-4.5 text-right text-zinc-600 dark:text-zinc-300 font-medium tabular-nums">
                        {run.candidatesDiscovered ?? 0}
                      </td>
                      <td className="px-6 py-4.5 text-right text-violet-600 dark:text-violet-400 font-medium tabular-nums">
                        {run.sourcesCreated ?? 0}
                      </td>
                      <td className="px-6 py-4.5 text-right text-blue-600 dark:text-blue-400 font-medium tabular-nums">
                        {run.jobsImported ?? 0}
                      </td>
                      <td className="px-6 py-4.5 text-right text-zinc-500 dark:text-zinc-400 text-xs tabular-nums">
                        {run.durationMs
                          ? `${(run.durationMs / 1000).toFixed(1)}s`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminContent>
    </AdminPage>
  );
}
