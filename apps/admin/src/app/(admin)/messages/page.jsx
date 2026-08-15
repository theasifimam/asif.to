"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  CheckCircle,
  Archive,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input, Button } from "@/components/ui";
import {
  useGetContactMessagesQuery,
  useUpdateMessageStatusMutation,
} from "@/redux/services/contactApi";

export default function MessagesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  // RTK Query hooks
  const {
    data: response,
    isLoading: loading,
    refetch,
  } = useGetContactMessagesQuery({
    page: currentPage,
    limit: 10,
    ...(statusFilter !== "all" && { status: statusFilter }),
  });

  const [updateStatus] = useUpdateMessageStatusMutation();

  const messages = response?.data || [];
  const pagination = response?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Message marked as ${status}`);
    } catch (err) {
      toast.error(err.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 p-4 font-sans text-zinc-800 dark:text-zinc-300 sm:p-6 md:p-8 lg:p-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/90 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:border-blue-900/60 dark:bg-blue-500/10 dark:text-blue-300">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Inbound Inquiries</span>
          </div>
          <h1 className="font-outfit text-3xl sm:text-4xl font-black tracking-tight text-zinc-950 dark:text-white">
            Messages & Inquiries
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
            View and manage contact form submissions from users and visitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-10 w-10 rounded-full border-zinc-200/80 dark:border-zinc-800"
            title="Refresh messages"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-3xl border border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-[#121215]/90 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44 h-10 rounded-full border border-zinc-200/80 bg-zinc-50/80 px-4 text-xs font-semibold shadow-none dark:border-zinc-800/80 dark:bg-[#18181b]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-zinc-200/80 dark:border-zinc-800 dark:bg-[#18181b]">
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span className="text-xs font-semibold text-zinc-400 px-3">
          Total messages: <strong className="text-zinc-950 dark:text-white font-bold">{pagination.total}</strong>
        </span>
      </section>

      {/* Messages List */}
      <section className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="admin-surface rounded-3xl p-12 text-center flex flex-col items-center">
            <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No messages found
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              No contact form submissions match the current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`admin-surface rounded-3xl p-6 transition-all duration-200 ${
                  msg.status === "unread"
                    ? "border-blue-500/50 shadow-xs"
                    : ""
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          msg.status === "unread"
                            ? "bg-blue-600"
                            : msg.status === "read"
                              ? "bg-emerald-500"
                              : "bg-zinc-400"
                        }`}
                      />
                      <h3 className="font-bold text-base text-zinc-950 dark:text-white">
                        {msg.subject}
                      </h3>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          msg.status === "unread"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                            : msg.status === "read"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} /> {msg.name} ({msg.email})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={13} />{" "}
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-zinc-50/80 dark:bg-[#18181b]/80 p-4 rounded-2xl text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap border border-zinc-200/50 dark:border-zinc-800/50">
                      {msg.message}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center justify-end md:justify-start gap-2 shrink-0">
                    {msg.status !== "read" && msg.status !== "archived" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg._id, "read")}
                        className="h-9 rounded-full px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200/80 dark:border-emerald-500/20"
                      >
                        <CheckCircle size={14} className="mr-1.5" /> Mark Read
                      </Button>
                    )}
                    {msg.status !== "archived" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg._id, "archived")}
                        className="h-9 rounded-full px-4 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200/80 dark:border-zinc-800"
                      >
                        <Archive size={14} className="mr-1.5" /> Archive
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <section className="flex items-center justify-between px-6 py-4 admin-surface rounded-full">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            Page {pagination.page} of {pagination.pages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage(pagination.page - 1)}
              className="h-8 w-8 rounded-full border-zinc-200/80 dark:border-zinc-800"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setCurrentPage(pagination.page + 1)}
              className="h-8 w-8 rounded-full border-zinc-200/80 dark:border-zinc-800"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
