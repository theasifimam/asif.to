"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MailOpen,
  Archive,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { contactApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ViewToggle } from "@/components/ui/ViewToggle";
import {
  AdminContent,
  AdminFilters,
  AdminLoading,
  AdminPage,
  AdminPageHeader,
  AdminPagination,
  AdminSearch,
} from "@/components/admin";

const getCategoryColor = (subject) => {
  if (subject?.includes("Feedback"))
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
  if (subject?.includes("Bug") || subject?.includes("Technical"))
    return "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
  if (subject?.includes("Partnership"))
    return "text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400 border-violet-200 dark:border-violet-500/20";
  return "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "unread":
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
          <Mail className="mr-1 h-3 w-3" /> Unread
        </span>
      );
    case "read":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
          <MailOpen className="mr-1 h-3 w-3" /> Read
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          <Archive className="mr-1 h-3 w-3" /> Archived
        </span>
      );
    default:
      return null;
  }
};

export default function ContactInquiriesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({ status: "all", search: "" });
  const [view, setView] = useState("card");

  const load = async (page = pagination.page) => {
    setLoading(true);
    const queryParams = {
      status: filters.status === "all" ? "" : filters.status,
      search: filters.search,
      page,
      limit: pagination.limit,
    };

    const result = await contactApi.list(queryParams);
    setLoading(false);

    if (!result.success) {
      return toast.error(result.error || "Unable to load contact messages");
    }

    setMessages(result.data?.data || []);
    setPagination(result.data?.pagination || pagination);
  };

  useEffect(() => {
    const timer = setTimeout(() => load(1), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search]);

  const updateStatus = async (id, status) => {
    const result = await contactApi.updateStatus(id, status);
    if (!result.success) {
      return toast.error(result.error || "Failed to update status");
    }
    toast.success(`Message marked as ${status}`);
    setMessages((prev) =>
      prev.map((msg) => (msg._id === id ? { ...msg, status } : msg)),
    );
  };

  const handleReply = (msg) => {
    const template = `Hi ${msg.name.split(" ")[0]},\n\nThank you for reaching out to asif.to regarding "${msg.subject}".\n\n`;
    window.location.href = `mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(template)}`;
    if (msg.status === "unread") {
      updateStatus(msg._id, "read");
    }
  };

  return (
    <AdminPage className="space-y-6 py-5">
      <AdminPageHeader
        eyebrow="Support & Inquiries"
        title="Contact Messages"
        description="View and respond to messages submitted via the public contact form."
        actions={
          <Button variant="outline" onClick={() => load()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <AdminFilters className="flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <AdminSearch
            value={filters.search}
            onChange={(value) =>
              setFilters((curr) => ({ ...curr, search: value }))
            }
            placeholder="Search by name, email, or subject..."
            className="w-full sm:w-72"
          />
          <div className="w-40">
            <Select
              value={filters.status}
              onValueChange={(val) =>
                setFilters((curr) => ({ ...curr, status: val }))
              }
            >
              <SelectTrigger className="h-10 rounded-2xl bg-white dark:bg-zinc-950">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ViewToggle view={view} onViewChange={setView} />
      </AdminFilters>

      <AdminContent>
        {loading ? (
          <AdminLoading text="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="flex min-h-100 flex-col items-center justify-center rounded-4xl border border-zinc-200/80 border-dashed bg-zinc-50/50 p-12 text-center dark:border-zinc-800/80 dark:bg-zinc-950/50">
            <div className="mb-4 rounded-3xl bg-blue-50 p-5 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-black text-zinc-950 dark:text-white">
              No messages found
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              No contact inquiries match your current filters.
            </p>
          </div>
        ) : (
          <div className={view === "list" ? "space-y-2" : "grid gap-4"}>
            {messages.map((msg) =>
              view === "list" ? (
                <div
                  key={msg._id}
                  className="group relative flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:hover:border-zinc-700"
                >
                  {msg.status === "unread" && (
                    <div className="absolute left-0 top-1/2 -ml-0.5 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
                  )}

                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-12 sm:col-span-3">
                      <h3 className="text-sm font-black text-zinc-950 dark:text-white truncate">
                        {msg.name}
                      </h3>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
                      >
                        {msg.email}
                      </a>
                    </div>

                    <div className="col-span-12 sm:col-span-4 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${getCategoryColor(msg.subject)}`}
                      >
                        {msg.subject}
                      </span>
                      {getStatusBadge(msg.status)}
                    </div>

                    <div className="col-span-12 sm:col-span-5 flex items-center gap-3 justify-end">
                      <span className="text-[10px] font-bold text-zinc-400 whitespace-nowrap hidden lg:block">
                        {new Date(msg.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          onClick={() => handleReply(msg)}
                          title="Reply"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>

                        {msg.status !== "read" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            onClick={() => updateStatus(msg._id, "read")}
                            title="Mark Read"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}

                        {msg.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
                            onClick={() => updateStatus(msg._id, "archived")}
                            title="Archive"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={msg._id}
                  className="group relative flex flex-col gap-4 rounded-4xl border border-zinc-200/80 bg-white p-6 shadow-xs transition-all hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:hover:border-zinc-700 md:flex-row md:items-start"
                >
                  {msg.status === "unread" && (
                    <div className="absolute left-0 top-1/2 -ml-0.5 h-12 w-1 -translate-y-1/2 rounded-r-full bg-blue-500" />
                  )}

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${getCategoryColor(msg.subject)}`}
                      >
                        {msg.subject}
                      </span>
                      {getStatusBadge(msg.status)}
                      <span className="text-[11px] font-bold text-zinc-400">
                        {new Date(msg.createdAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-zinc-950 dark:text-white truncate">
                        {msg.name}
                      </h3>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs font-semibold text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {msg.email}
                      </a>
                    </div>

                    <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/50">
                      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {msg.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-row gap-2 md:flex-col md:w-32">
                    <Button
                      variant="default"
                      className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                      onClick={() => handleReply(msg)}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Reply
                    </Button>

                    {msg.status !== "read" && (
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl"
                        onClick={() => updateStatus(msg._id, "read")}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                        Mark Read
                      </Button>
                    )}

                    {msg.status !== "archived" && (
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl"
                        onClick={() => updateStatus(msg._id, "archived")}
                      >
                        <Archive className="mr-2 h-4 w-4 text-zinc-500" />
                        Archive
                      </Button>
                    )}

                    {msg.status === "archived" && (
                      <Button
                        variant="outline"
                        className="w-full rounded-2xl text-blue-600 hover:text-blue-700"
                        onClick={() => updateStatus(msg._id, "unread")}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Mark Unread
                      </Button>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </AdminContent>

      <AdminPagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        totalItems={pagination.total}
        itemsPerPage={pagination.limit}
        onPageChange={(p) => load(p)}
      />
    </AdminPage>
  );
}
