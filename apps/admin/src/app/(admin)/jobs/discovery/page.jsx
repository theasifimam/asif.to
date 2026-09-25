"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Loader2,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { discoveryApi, jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLoading, AdminPage, AdminPageHeader } from "@/components/admin";

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
  "all", "greenhouse", "lever", "smartrecruiters", "workable", "ashby",
  "recruitee", "pinpoint", "teamtailor", "unknown",
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
  discovered: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  verifying: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  verified: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  created: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  no_uae_jobs: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  requires_review: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
  blocked: "bg-red-700/15 text-red-500 border-red-700/30",
  failed: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${style}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ score }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-white/50 tabular-nums w-6 text-right">{score}</span>
    </div>
  );
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "text-white" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-bold tabular-nums ${color}`}>{value ?? "—"}</span>
      {sub && <span className="text-xs text-white/40">{sub}</span>}
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
      if (!result.success) return toast.error(result.error || `${action} failed`);
      toast.success(successMsg);
      onAction();
    } catch {
      toast.error(`${action} failed`);
    } finally {
      setLoading(null);
    }
  };

  const busy = (a) => loading === a;

  const actionable = (id) => !["created", "rejected", "blocked"].includes(candidate.status) || id === "retry";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {["discovered", "failed", "no_uae_jobs", "requires_review", "verifying"].includes(candidate.status) && (
        <Button size="xs" variant="ghost" className="h-7 text-xs gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          disabled={!!loading}
          onClick={() => act("Verify", () => discoveryApi.verify(candidate._id), "Verification started")}
        >
          {busy("Verify") ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          Verify
        </Button>
      )}
      {["verified", "requires_review"].includes(candidate.status) && (
        <Button size="xs" variant="ghost" className="h-7 text-xs gap-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          disabled={!!loading}
          onClick={() => act("Approve", () => discoveryApi.approve(candidate._id), "Company & source created!")}
        >
          {busy("Approve") ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
          Approve
        </Button>
      )}
      {["failed", "no_uae_jobs", "requires_review", "blocked"].includes(candidate.status) && (
        <Button size="xs" variant="ghost" className="h-7 text-xs gap-1 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          disabled={!!loading}
          onClick={() => act("Retry", () => discoveryApi.retry(candidate._id), "Retry queued")}
        >
          {busy("Retry") ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
          Retry
        </Button>
      )}
      {!["rejected", "created"].includes(candidate.status) && (
        <Button size="xs" variant="ghost" className="h-7 text-xs gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          disabled={!!loading}
          onClick={() => act("Reject", () => discoveryApi.reject(candidate._id, ""), "Candidate rejected")}
        >
          {busy("Reject") ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
          Reject
        </Button>
      )}
      {candidate.createdJobSourceId && (
        <a href={`/jobs/sources/${candidate.createdJobSourceId._id || candidate.createdJobSourceId}`}
          className="inline-flex items-center gap-1 h-7 px-2 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded transition-colors">
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

  const load = useCallback(async ({ initial = false } = {}) => {
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
        setStats(dashRes.data.stats);
        setRecentRuns(dashRes.data.recentRuns || []);
      }
      if (candidatesRes.success) {
        setCandidates(candidatesRes.data.candidates || []);
        setPagination(candidatesRes.data.pagination || { page: 1, total: 0, pages: 1 });
      }
    } finally {
      if (initial) setLoading(false);
      else setRefreshing(false);
    }
  }, [status, provider, method, search, page]);

  useEffect(() => { load({ initial: true }); }, [load]);

  const triggerRun = async () => {
    setRunningDiscovery(true);
    const res = await discoveryApi.run();
    setRunningDiscovery(false);
    if (res.success) {
      toast.success("Discovery run started in the background. Refresh in a minute.");
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
        icon={<Zap className="w-5 h-5 text-amber-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => load()} disabled={refreshing} className="gap-2 text-white/70 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={triggerRun} disabled={runningDiscovery} className="gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold">
              {runningDiscovery ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Discovery Now
            </Button>
          </div>
        }
      />

      {/* ── Stats grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Discovered" value={byStatus.discovered} color="text-blue-400" />
        <StatCard label="Verified" value={byStatus.verified} color="text-emerald-400" />
        <StatCard label="Created" value={byStatus.created} color="text-violet-400" />
        <StatCard label="Needs Review" value={byStatus.requires_review} color="text-orange-400" />
        <StatCard label="Failed" value={(byStatus.failed || 0) + (byStatus.blocked || 0)} color="text-red-400" />
      </div>

      {/* ── Last run banner ──────────────────────────────────────────────────── */}
      {lastRun && (
        <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-white/70">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Last Discovery Run</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm sm:ml-auto">
            <span className="text-white/50">{new Date(lastRun.startedAt).toLocaleString()}</span>
            <span className="text-emerald-400">+{lastRun.candidatesDiscovered ?? 0} candidates</span>
            <span className="text-violet-400">+{lastRun.sourcesCreated ?? 0} sources</span>
            <span className="text-blue-400">+{lastRun.jobsImported ?? 0} jobs</span>
            <StatusBadge status={lastRun.status} />
          </div>
          {!stats?.config?.enabled && (
            <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-0.5">
              Discovery disabled via DISCOVERY_ENABLED=false
            </span>
          )}
        </div>
      )}

      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            placeholder="Search company, domain, ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-amber-500/50">
          {STATUSES.map((s) => <option key={s.value} value={s.value} className="bg-[#1a1a2e]">{s.label}</option>)}
        </select>
        <select value={provider} onChange={(e) => { setProvider(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-amber-500/50">
          {PROVIDERS.map((p) => <option key={p} value={p} className="bg-[#1a1a2e]">{p === "all" ? "All Providers" : p}</option>)}
        </select>
        <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-1 focus:ring-amber-500/50">
          {METHODS.map((m) => <option key={m.value} value={m.value} className="bg-[#1a1a2e]">{m.label}</option>)}
        </select>
      </div>

      {/* ── Results count ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">{pagination.total} candidates</span>
        {pagination.pages > 1 && (
          <div className="flex items-center gap-2">
            <Button size="xs" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 text-white/60">Prev</Button>
            <span className="text-xs text-white/40">{page} / {pagination.pages}</span>
            <Button size="xs" variant="ghost" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)} className="h-7 text-white/60">Next</Button>
          </div>
        )}
      </div>

      {/* ── Candidates table ─────────────────────────────────────────────────── */}
      {candidates.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-10 text-center">
          <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">
            {search || status !== "all" ? "No candidates match your filters." : "No discovery candidates yet. Click \"Run Discovery Now\" to start."}
          </p>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider w-32">Confidence</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">UAE Jobs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Discovered</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white/90 truncate max-w-48">{candidate.companyName}</div>
                      {candidate.domain && (
                        <div className="text-xs text-white/40 truncate">{candidate.domain}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white/70 text-xs font-mono">{candidate.detectedProvider}</div>
                      {candidate.providerOrganizationId && (
                        <div className="text-white/30 text-xs truncate max-w-32">{candidate.providerOrganizationId}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white/50 text-xs">{candidate.discoveryMethod?.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-4 py-3 w-32">
                      <ConfidenceBar score={candidate.confidenceScore || 0} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {candidate.verifiedUaeJobsFound > 0 ? (
                        <span className="text-emerald-400 font-semibold tabular-nums">{candidate.verifiedUaeJobsFound}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={candidate.status} />
                      {candidate.lastError && (
                        <div className="text-xs text-red-400/70 mt-1 truncate max-w-40" title={candidate.lastError}>
                          {candidate.lastError.slice(0, 60)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                      {candidate.verificationAttempts > 0 && (
                        <div className="text-white/25">{candidate.verificationAttempts} attempt{candidate.verificationAttempts !== 1 ? "s" : ""}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <CandidateActions candidate={candidate} onAction={() => load()} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Recent runs ─────────────────────────────────────────────────────── */}
      {recentRuns.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Recent Discovery Runs</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Run ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Started</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Discovered</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Sources</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Jobs</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentRuns.map((run) => (
                  <tr key={run._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-xs text-white/50 truncate max-w-48">{run.runId}</td>
                    <td className="px-4 py-2.5 text-xs text-white/60 whitespace-nowrap">{new Date(run.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={run.status} /></td>
                    <td className="px-4 py-2.5 text-right text-white/70 tabular-nums">{run.candidatesDiscovered ?? 0}</td>
                    <td className="px-4 py-2.5 text-right text-violet-400 tabular-nums">{run.sourcesCreated ?? 0}</td>
                    <td className="px-4 py-2.5 text-right text-blue-400 tabular-nums">{run.jobsImported ?? 0}</td>
                    <td className="px-4 py-2.5 text-right text-white/40 text-xs tabular-nums">
                      {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
