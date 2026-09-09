"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, FileCheck2 } from "lucide-react";
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

  const load = async (page = 1) => {
    setLoading(true);
    const result = await jobsApi.applications({
      kind,
      status: status === "all" ? "" : status,
      page,
      limit: pagination.limit,
    });
    setLoading(false);
    if (!result.success) return toast.error(result.error || "Unable to load applications");
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
        if (!result.success) return toast.error(result.error || "Unable to load applications");
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
      <AdminFilters>
        <div className="flex flex-wrap gap-2">
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
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-colors ${
                kind === value
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {text}
            </button>
          ))}
        </div>

        {kind === "internal" && (
          <div className="w-44">
            <Select
              value={status}
              onValueChange={(val) => {
                setLoading(true);
                setStatus(val);
              }}
            >
              <SelectTrigger size="sm" className="h-10 rounded-full px-4">
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
      </AdminFilters>

      <AdminContent>
        {loading ? (
          <AdminLoading />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table min-w-225 w-full text-left text-xs">
              <thead>
                <tr>
                  {["Candidate", "Job", "Applied", "Contact", "Status", "CV"].map((value) => (
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
                      <b>{item.kind === "internal" ? item.fullName : item.user?.fullName}</b>
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
                          <a href={`mailto:${item.email}`} className="block text-blue-600 hover:underline">
                            {item.email}
                          </a>
                          <span>{item.phone}</span>
                        </>
                      ) : (
                        <span className="text-zinc-400">Click analytics only</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {item.kind === "internal" ? (
                        <div className="w-36">
                          <Select
                            value={item.status}
                            onValueChange={(val) => update(item._id, val)}
                          >
                            <SelectTrigger size="sm" className="h-8 rounded-full px-3 text-[11px] font-bold">
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
