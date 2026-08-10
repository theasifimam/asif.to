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
    <div className="p-4 sm:p-8 md:p-12 flex flex-col gap-8 md:gap-10 max-w-[1600px] mx-auto text-zinc-900 dark:text-zinc-400 transition-colors duration-300">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-2 md:mt-0">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="w-8 md:w-12 h-1px bg-zinc-400 dark:bg-zinc-800" />
            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
              Support & Contact
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black font-outfit uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
            Messages.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-600 text-sm font-medium max-w-xl">
            View and manage contact form submissions from users and visitors.
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="p-3 md:p-4 rounded-xl md:rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 transition-all h-11 md:h-14"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col lg:flex-row gap-4 lg:items-center bg-white dark:bg-zinc-950/40 p-4 md:p-5 rounded-4xl border border-zinc-200 dark:border-zinc-800/60 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-48 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-xl md:rounded-3xl h-11 md:h-12 text-[10px] font-black uppercase tracking-widest">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:flex items-center px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">
            Total Messages:{" "}
            <span className="ml-2 text-zinc-900 dark:text-white">
              {pagination.total}
            </span>
          </div>
        </div>
      </section>

      {/* Messages List */}
      <section className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-zinc-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950/40 rounded-4xl p-12 text-center border border-zinc-200 dark:border-zinc-800/60">
            <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              No messages found
            </h3>
            <p className="text-zinc-500 mt-2">
              No contact form submissions match the current filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-white dark:bg-zinc-950/60 rounded-3xl p-6 border transition-all ${msg.status === "unread" ? "border-blue-500/50 shadow-md" : "border-zinc-200 dark:border-zinc-800/60"}`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${msg.status === "unread" ? "bg-blue-500" : msg.status === "read" ? "bg-emerald-500" : "bg-zinc-500"}`}
                      />
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                        {msg.subject}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        {msg.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} /> {msg.name} ({msg.email})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />{" "}
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center justify-end md:justify-start gap-2 shrink-0">
                    {msg.status !== "read" && msg.status !== "archived" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg._id, "read")}
                        className="w-full h-10 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                      >
                        <CheckCircle size={16} className="mr-2" /> Mark Read
                      </Button>
                    )}
                    {msg.status !== "archived" && (
                      <Button
                        variant="outline"
                        onClick={() => handleUpdateStatus(msg._id, "archived")}
                        className="w-full h-10 rounded-xl text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Archive size={16} className="mr-2" /> Archive
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
        <section className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-transparent border border-zinc-200 dark:border-zinc-800/50 rounded-2xl md:rounded-full shadow-sm dark:shadow-none">
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-600">
            {pagination.page} of {pagination.pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => setCurrentPage(pagination.page - 1)}
              className="p-2 h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-all"
            >
              <ChevronLeft size={14} />
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setCurrentPage(pagination.page + 1)}
              className="p-2 h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-40 transition-all"
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
