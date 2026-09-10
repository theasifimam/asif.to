"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  ExternalLink,
  Globe,
  MapPin,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { jobsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  AdminFilters,
  AdminLoading,
  AdminPage,
  AdminPageHeader,
  AdminSearch,
} from "@/components/admin";
import { ViewToggle } from "@/components/ui/ViewToggle";

const ORIGIN_LABELS = {
  admin_created: "Admin Created",
  manual_import: "Manual Import",
  automated_import: "Automated Import",
  ats_import: "ATS Import",
  api_import: "API Import",
};

export default function CompaniesPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card");

  const load = async () => {
    setLoading(true);
    const result = await jobsApi.companies({ search, limit: 100 });
    setLoading(false);
    if (!result.success)
      return toast.error(result.error || "Unable to load companies");
    setItems(result.data?.data || []);
  };

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="Jobs"
        title="Companies"
        description="Reusable employer profiles power company pages and keep branding consistent across listings."
        actions={
          <Link href="/jobs/companies/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add company
            </Button>
          </Link>
        }
      />

      <AdminFilters className="flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <AdminSearch
          value={search}
          onChange={setSearch}
          placeholder="Search companies…"
          className="w-full sm:max-w-md shrink-0"
        />
        <div className="flex items-center justify-end">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </AdminFilters>

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
                    Company
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Industry & Size
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Location & Links
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Origin
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Open Jobs
                  </th>
                  <th className="px-5 py-3.5 font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-right font-bold text-zinc-500 uppercase tracking-wider text-[11px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                          {item.logo ? (
                            <img
                              src={item.logo}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/jobs/companies/${item._id}/edit`}
                            className="font-bold text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 flex items-center gap-1"
                          >
                            <span className="truncate">{item.name}</span>
                            {item.verified && (
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            )}
                          </Link>
                          {item.slug && (
                            <p className="text-[10px] text-zinc-400 font-mono">
                              /{item.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-zinc-700 dark:text-zinc-300">
                        {item.industry || "—"}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {item.size || "Size not set"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {item.headquarters ? (
                          <div className="flex items-center gap-1 text-[11px] text-zinc-600 dark:text-zinc-400">
                            <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                            <span className="truncate max-w-40">
                              {item.headquarters}
                            </span>
                          </div>
                        ) : null}
                        {item.website ? (
                          <a
                            href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                          >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-35">
                              {item.website.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        ) : null}
                        {!item.headquarters && !item.website && (
                          <span className="text-zinc-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                        {ORIGIN_LABELS[item.creationOrigin] || "Admin Created"}
                      </span>
                      {item.sourceName && (
                        <p className="mt-1 text-[10px] text-zinc-400 truncate max-w-30">
                          {item.sourceName}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-zinc-900 dark:text-zinc-100">
                        {item.openJobs || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                          item.active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/jobs/companies/${item._id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit company"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!items.length && (
              <div className="p-16 text-center text-sm text-zinc-500">
                No companies found.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="rounded-4xl border border-zinc-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-black text-zinc-900 dark:text-zinc-100">
                      <Link
                        href={`/jobs/companies/${item._id}/edit`}
                        className="hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {item.name}
                      </Link>
                      {item.verified && (
                        <ShieldCheck className="ml-1 inline h-4 w-4 text-blue-600" />
                      )}
                    </h2>
                    <p className="mt-1 text-[10px] font-bold uppercase text-zinc-400">
                      {item.industry || "Industry not set"}
                    </p>
                    <p className="mt-1 text-[10px] font-bold text-blue-600">
                      {ORIGIN_LABELS[item.creationOrigin] || "Admin Created"}
                      {item.sourceName ? ` · ${item.sourceName}` : ""}
                    </p>
                  </div>
                  <Link href={`/jobs/companies/${item._id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit company">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="mt-4 line-clamp-3 text-xs leading-5 text-zinc-500">
                  {item.description || "No company description yet."}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-[10px] font-bold text-zinc-400 dark:border-zinc-800">
                <span>{item.openJobs || 0} open jobs</span>
                <span
                  className={item.active ? "text-emerald-600" : "text-zinc-400"}
                >
                  {item.active ? "Active" : "Inactive"}
                </span>
              </div>
            </article>
          ))}
          {!items.length && (
            <div className="col-span-full rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
              <Building2 className="mx-auto h-8 w-8 text-zinc-300" />
              <p className="mt-3 font-bold text-zinc-600 dark:text-zinc-400">
                No companies match your search.
              </p>
            </div>
          )}
        </div>
      )}
    </AdminPage>
  );
}
