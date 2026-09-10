"use client";

import { useEffect, useState } from "react";
import {
  Download,
  ExternalLink,
  FileCheck2,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  User,
} from "lucide-react";
import { jobsApi } from "@/lib/api";
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
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";

const statuses = ["submitted", "reviewed", "shortlisted", "rejected", "hired"];

export default function JobApplicationsPage() {
  const [kind, setKind] = useState("internal");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");

  const load = async (page = 1) => {
    setLoading(true);
    const result = await jobsApi.applications({
      kind,
      status: status === "all" ? "" : status,
      page,
      limit: pagination.limit,
    });
    setLoading(false);
    if (!result.success)
      return toast.error(result.error || "Unable to load applications");
    setItems(result.data?.data || []);
    setPagination(result.data?.pagination || pagination);
  };

  useEffect(() => {
    let active = true;
    jobsApi
      .applications({
        kind,
        status: status === "all" ? "" : status,
        page: 1,
        limit: pagination.limit,
      })
      .then((result) => {
        if (!active) return;
        setLoading(false);
        if (!result.success)
          return toast.error(result.error || "Unable to load applications");
        setItems(result.data?.data || []);
        setPagination(result.data?.pagination || pagination);
      });
    return () => {
      active = false;
    };
  }, [kind, status, pagination.limit]);

  const update = async (id, nextStatus) => {
    const result = await jobsApi.updateApplication(id, nextStatus);
    if (!result.success) return toast.error(result.error || "Update failed");
    toast.success("Application status updated");
    load(pagination.page);
  };

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Applications"
        description="Direct applications and external apply clicks are deliberately separated. External clicks do not imply a completed application."
      />

      <AdminFilters className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            ["internal", "Direct applications", FileCheck2],
            ["external_click", "External clicks", ExternalLink],
          ].map(([value, text, Icon]) => (
            <button
              key={value}
              onClick={() => {
                setLoading(true);
                setKind(value);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-colors cursor-pointer ${
                kind === value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </button>
          ))}

          {kind === "internal" && (
            <div className="w-44">
              <Select
                value={status}
                onValueChange={(val) => {
                  setLoading(true);
                  setStatus(val);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="h-9 rounded-full px-4 text-xs font-bold"
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {statuses.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </AdminFilters>

      <AdminContent>
        {loading ? (
          <AdminLoading />
        ) : viewMode === "list" ? (
          /* List Table View */
          <div className="overflow-x-auto">
            <table className="admin-table min-w-225 w-full text-left text-xs">
              <thead>
                <tr>
                  {[
                    "Candidate",
                    "Job",
                    "Applied",
                    "Contact",
                    "Status",
                    "CV",
                  ].map((value) => (
                    <th key={value} className="px-5 py-4">
                      {value}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="px-5 py-4">
                      <b>
                        {item.kind === "internal"
                          ? item.fullName
                          : item.user?.fullName}
                      </b>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        @{item.user?.username || "user"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <b>{item.job?.title || "Deleted job"}</b>
                      <p className="mt-1 text-[10px] text-zinc-400">
                        {item.job?.companyName} · {item.job?.location}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {new Date(item.appliedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {item.kind === "internal" ? (
                        <>
                          <a
                            href={`mailto:${item.email}`}
                            className="block text-blue-600 hover:underline"
                          >
                            {item.email}
                          </a>
                          <span>{item.phone}</span>
                        </>
                      ) : (
                        <span className="text-zinc-400">
                          Click analytics only
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.kind === "internal" ? (
                        <div className="w-36">
                          <Select
                            value={item.status}
                            onValueChange={(val) => update(item._id, val)}
                          >
                            <SelectTrigger
                              size="sm"
                              className="h-8 rounded-full px-3 text-[11px] font-bold"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value.charAt(0).toUpperCase() +
                                    value.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                          REDIRECTED
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.kind === "internal" && item.resume?.downloadUrl ? (
                        <a
                          href={jobsApi.resumeUrl(item._id)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <div className="p-16 text-center text-sm text-zinc-500">
                No records match this view.
              </div>
            )}
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3 p-4 sm:p-5">
            {items.map((item) => (
              <article
                key={item._id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold shrink-0">
                        {item.kind === "internal"
                          ? (item.fullName || "C").charAt(0).toUpperCase()
                          : (item.user?.fullName || "U")
                              .charAt(0)
                              .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {item.kind === "internal"
                            ? item.fullName
                            : item.user?.fullName}
                        </h3>
                        <p className="text-[10px] text-zinc-400 truncate">
                          @{item.user?.username || "candidate"}
                        </p>
                      </div>
                    </div>

                    {item.kind === "internal" ? (
                      <div className="w-32 shrink-0">
                        <Select
                          value={item.status}
                          onValueChange={(val) => update(item._id, val)}
                        >
                          <SelectTrigger
                            size="sm"
                            className="h-7 rounded-full px-2.5 text-[10px] font-bold"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statuses.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[9px] font-black text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                        REDIRECTED
                      </span>
                    )}
                  </div>

                  {/* Target Job Info */}
                  <div className="rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Briefcase className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">
                        {item.job?.title || "Deleted Job"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 pl-5">
                      {item.job?.companyName} · {item.job?.location}
                    </p>
                  </div>

                  {/* Contact details */}
                  {item.kind === "internal" ? (
                    <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      {item.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <a
                            href={`mailto:${item.email}`}
                            className="text-blue-600 hover:underline truncate"
                          >
                            {item.email}
                          </a>
                        </div>
                      )}
                      {item.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400 italic">
                      External click record logged for outbound referral
                      tracking.
                    </p>
                  )}
                </div>

                {/* Footer & Resume Download */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{new Date(item.appliedAt).toLocaleDateString()}</span>
                  </div>

                  {item.kind === "internal" && item.resume?.downloadUrl ? (
                    <a
                      href={jobsApi.resumeUrl(item._id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 rounded-full text-[10px] px-2.5 font-bold"
                      >
                        <Download className="h-3 w-3" />
                        CV
                      </Button>
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
            {!items.length && (
              <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="font-bold text-zinc-500">
                  No records match this view.
                </p>
              </div>
            )}
          </div>
        )}

        <AdminPagination
          page={pagination.page}
          pages={pagination.totalPages}
          total={pagination.totalCount}
          limit={pagination.limit}
          itemLabel="records"
          onPageChange={load}
        />
      </AdminContent>
    </AdminPage>
  );
}
