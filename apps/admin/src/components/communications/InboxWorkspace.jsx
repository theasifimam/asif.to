"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Paperclip,
  RefreshCw,
  MessageSquare,
  Info,
  Search,
  X,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import MessageBubble from "@/components/messaging/MessageBubble";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import SelectField, { readable } from "./SelectField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMessaging } from "@/contexts/MessagingContext";
import { hasPermission } from "@/lib/permissions";
import { messagingApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import ContentAttachModal from "@/components/messaging/ContentAttachModal";
import DiscussButton from "@/components/messaging/DiscussButton";
import { communicationApi as api, errorMessage } from "./api";
const input =
  "w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const statuses = [
  "NEW",
  "OPEN",
  "WAITING_FOR_ADMIN",
  "WAITING_FOR_CUSTOMER",
  "RESOLVED",
  "CLOSED",
  "SPAM",
];
export default function InboxWorkspace() {
  const { user } = useAuth(),
    { socket } = useMessaging(),
    router = useRouter(),
    params = useSearchParams();
  const selected = params.get("conversation");
  const [list, setList] = useState([]),
    [total, setTotal] = useState(0),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("");
  const [thread, setThread] = useState(null),
    [users, setUsers] = useState([]),
    [templates, setTemplates] = useState([]),
    [teams, setTeams] = useState([]);
  const [body, setBody] = useState(""),
    [mode, setMode] = useState("reply"),
    [files, setFiles] = useState([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [picker, setPicker] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const timeline = useRef(null),
    replyTextareaRef = useRef(null);
  const request = useRef(null),
    lock = useRef(false),
    fileInput = useRef(null),
    generation = useRef(0);
  useEffect(() => {
    const el = replyTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, 135);
    el.style.height = `${newHeight}px`;
  }, [body, mode]);
  const loadList = useCallback(async () => {
    const data = await api(
      `/inbox?${new URLSearchParams({ page, search, status })}`,
    );
    setList(data.items);
    setTotal(data.total);
  }, [page, search, status]);
  const loadThread = useCallback(async () => {
    if (!selected) return;
    const revision = ++generation.current;
    const data = await api(`/inbox/${selected}`);
    if (revision === generation.current) setThread(data);
  }, [selected]);
  useEffect(() => {
    const timer = setTimeout(
      () => loadList().catch((e) => setError(errorMessage(e))),
      180,
    );
    return () => clearTimeout(timer);
  }, [loadList]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setThread(null);
      setBody("");
      setFiles([]);
      request.current = null;
      if (!selected) return;
      setLoading(true);
      loadThread()
        .then(() => api(`/inbox/${selected}/read`, { method: "PATCH" }))
        .then(loadList)
        .catch((e) => setError(errorMessage(e)))
        .finally(() => setLoading(false));
    }, 0);
    const invalidate = () => {
      generation.current++;
    };
    return () => {
      clearTimeout(timer);
      invalidate();
    };
    // The list refresh must not reset an unsent reply when filters change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, loadThread]);
  useEffect(() => {
    api("/inbox/users")
      .then(setUsers)
      .catch((e) => setError(errorMessage(e)));
    if (hasPermission(user, "communications.inbox.reply"))
      api("/templates")
        .then((data) => setTemplates(data.items))
        .catch(() => {});
    if (hasPermission(user, "messages.view"))
      messagingApi.conversations().then((result) => {
        if (result.success)
          setTeams(
            result.data.data.conversations.filter(
              (item) => item.type !== "discussion",
            ),
          );
      });
  }, [user]);
  useEffect(() => {
    const refresh = () => {
      loadList().catch(() => {});
      loadThread().catch(() => {});
    };
    socket?.on("communications:updated", refresh);
    return () => socket?.off("communications:updated", refresh);
  }, [socket, loadList, loadThread]);
  const perform = async (fn) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
      await Promise.all([loadList(), loadThread()]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const update = (changes) =>
    perform(() =>
      api(`/inbox/${selected}`, { method: "PATCH", body: changes }),
    );
  const submit = (resolve) =>
    perform(async () => {
      const signature = JSON.stringify({
        body,
        mode,
        files: files.map((file) => file._id),
        resolve,
      });
      if (request.current?.signature !== signature)
        request.current = { signature, id: crypto.randomUUID() };
      await api(`/inbox/${selected}/messages`, {
        method: "POST",
        body: {
          text: body,
          mode,
          resolve,
          attachments: files.map((file) => file._id),
          requestId: request.current.id,
        },
      });
      setBody("");
      setFiles([]);
      request.current = null;
    });
  const download = async (asset) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/communications/inbox/attachments/${asset._id}`,
        { headers: { Authorization: `Bearer ${getAuthToken()}` } },
      );
      if (!response.ok) throw new Error("Unable to download attachment.");
      const url = URL.createObjectURL(await response.blob()),
        link = document.createElement("a");
      link.href = url;
      link.download = asset.originalName || asset.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message);
    }
  };
  const canReply = hasPermission(user, "communications.inbox.reply"),
    conversation = thread?.conversation;
  useEffect(() => {
    const container = timeline.current;
    if (!container || !thread?.messages.length) return;
    if (
      container.scrollHeight - container.scrollTop - container.clientHeight <
        250 ||
      container.dataset.conversation !== selected
    ) {
      container.scrollTop = container.scrollHeight;
      container.dataset.conversation = selected;
    }
  }, [thread?.messages.length, selected]);
  return (
    <div className="flex h-full min-h-0 flex-col">
      {error && (
        <p
          role="alert"
          className="shrink-0 bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950"
        >
          {error}
        </p>
      )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={`${selected ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0c0e] md:w-80 lg:w-96`}
        >
          <div className="shrink-0 space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  aria-label="Back to dashboard"
                  className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100"
                >
                  <ArrowLeft size={17} />
                </Link>
                <h2 className="text-base font-bold sm:text-lg">
                  Inbox{" "}
                  <span className="ml-1 text-xs font-normal text-zinc-400">
                    {total}
                  </span>
                </h2>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Refresh inbox"
                onClick={() =>
                  loadList().catch((e) => setError(errorMessage(e)))
                }
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-zinc-400"
              />
              <input
                aria-label="Search enquiries"
                className={`${input} pl-9`}
                placeholder="Search people or enquiries"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <SelectField
              aria-label="Filter inbox"
              className="h-10 rounded-xl bg-zinc-50 text-sm font-medium dark:bg-zinc-900"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All enquiries</option>
              {statuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </SelectField>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {list.map((item) => (
              <button
                disabled={busy}
                key={item._id}
                onClick={() =>
                  router.push(`/communications/inbox?conversation=${item._id}`)
                }
                className={`flex w-full gap-3 rounded-2xl p-3 text-left transition-colors ${selected === item._id ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${selected === item._id ? "bg-blue-100 text-blue-600 dark:bg-blue-900" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}
                >
                  {item.name?.[0]?.toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="truncate text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {item.name}
                    </strong>
                    {item.unreadCount > 0 && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white shadow-xs">
                        {item.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {item.subject}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                    {readable(item.conversationStatus)}
                  </p>
                </div>
              </button>
            ))}
            {!list.length && (
              <div className="p-8 text-center text-sm text-zinc-400">
                <Inbox className="mx-auto mb-3 h-7 w-7" />
                No enquiries found.
              </div>
            )}
          </div>
          {total > 30 && (
            <div className="flex shrink-0 justify-between border-t p-3 dark:border-zinc-800">
              <Button
                size="sm"
                variant="ghost"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="self-center text-xs text-zinc-400">
                {page} / {Math.ceil(total / 30)}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={page * 30 >= total}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </aside>
        <section
          className={`${!selected ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-[#0c0c0e]`}
        >
          {!conversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50/60 p-8 text-center dark:bg-zinc-950/40">
              <span className="rounded-2xl bg-blue-50 p-4 text-blue-600 dark:bg-blue-950">
                <MessageSquare size={28} />
              </span>
              <h2 className="font-semibold text-base sm:text-lg">
                {loading
                  ? "Loading conversation..."
                  : "Your customer conversations"}
              </h2>
              <p className="max-w-xs text-sm leading-6 text-zinc-500">
                {loading
                  ? "Getting the latest messages."
                  : "Choose an enquiry to read messages and reply by email."}
              </p>
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Back to inbox"
                  onClick={() => router.push("/communications/inbox")}
                >
                  <ArrowLeft size={18} />
                </Button>
                <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950 sm:flex">
                  {conversation.name?.[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-base sm:text-lg font-bold text-zinc-950 dark:text-white">
                    {conversation.name}
                  </h2>
                  <p className="mt-0.5 truncate text-xs sm:text-sm font-medium text-zinc-500">
                    {conversation.subject}
                  </p>
                </div>
                <span className="hidden rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 sm:inline">
                  {readable(conversation.conversationStatus)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm font-semibold"
                  onClick={() => setDetailsOpen(true)}
                >
                  <Info size={17} />
                  <span className="hidden sm:inline">Details</span>
                </Button>
              </header>
              <div
                ref={timeline}
                className="min-h-0 flex-1 overflow-y-auto bg-zinc-50/60 px-4 py-5 dark:bg-zinc-950/40 sm:px-6"
                role="log"
                aria-label="Conversation messages"
              >
                {thread.hasMore && (
                  <div className="mb-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        api(`/inbox/${selected}?before=${thread.nextCursor}`)
                          .then((data) =>
                            setThread((current) => ({
                              ...current,
                              messages: [...data.messages, ...current.messages],
                              hasMore: data.hasMore,
                              nextCursor: data.nextCursor,
                            })),
                          )
                          .catch((e) => setError(errorMessage(e)))
                      }
                    >
                      Load earlier messages
                    </Button>
                  </div>
                )}
                {thread.messages.map((message, index) => {
                  const note = message.direction === "NOTE",
                    mine = message.direction !== "CUSTOMER";
                  const date = new Date(message.createdAt);
                  const previous = thread.messages[index - 1];
                  const next = thread.messages[index + 1];

                  const currTime = date.getTime();
                  const prevTime = previous
                    ? new Date(previous.createdAt).getTime()
                    : null;
                  const nextTime = next
                    ? new Date(next.createdAt).getTime()
                    : null;

                  const isSameSenderAsPrev = Boolean(
                    previous &&
                      previous.direction === message.direction &&
                      (!previous.sender ||
                        !message.sender ||
                        String(previous.sender._id || previous.sender) ===
                          String(message.sender._id || message.sender)) &&
                      (!prevTime ||
                        !currTime ||
                        Math.abs(currTime - prevTime) < 5 * 60 * 1000),
                  );

                  const isSameSenderAsNext = Boolean(
                    next &&
                      next.direction === message.direction &&
                      (!next.sender ||
                        !message.sender ||
                        String(next.sender._id || next.sender) ===
                          String(message.sender._id || message.sender)) &&
                      (!nextTime ||
                        !currTime ||
                        Math.abs(nextTime - currTime) < 5 * 60 * 1000),
                  );

                  const isFirst = !isSameSenderAsPrev && isSameSenderAsNext;
                  const isMiddle = isSameSenderAsPrev && isSameSenderAsNext;
                  const isLast = isSameSenderAsPrev && !isSameSenderAsNext;
                  const isSingle = !isSameSenderAsPrev && !isSameSenderAsNext;

                  const newDay =
                    !previous ||
                    new Date(previous.createdAt).toDateString() !==
                      date.toDateString();
                  return (
                    <div key={message._id}>
                      {newDay && (
                        <div className="my-4 text-center">
                          <span className="rounded-full bg-zinc-200/80 px-3.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {date.toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      <MessageBubble
                        message={{
                          ...message,
                          content: message.text,
                          senderId: message.sender || {
                            fullName: conversation.name,
                          },
                        }}
                        mine={mine}
                        isFirst={isFirst}
                        isMiddle={isMiddle}
                        isLast={isLast}
                        isSingle={isSingle}
                        isSameSenderAsPrev={isSameSenderAsPrev}
                        isSameSenderAsNext={isSameSenderAsNext}
                        readOnly
                        internalNote={note}
                        conversation={{ type: "direct" }}
                        footer={
                          <span
                            title={date.toLocaleString()}
                            className="text-[11px] font-medium opacity-80"
                          >
                            {date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {!note && mine && (
                              <> &middot; {readable(message.deliveryStatus)}</>
                            )}
                          </span>
                        }
                        renderAttachment={(asset) => (
                          <button
                            key={asset._id}
                            onClick={() => download(asset)}
                            className="flex items-center gap-1 rounded-lg bg-black/5 p-2 text-xs underline dark:bg-white/5"
                          >
                            <Paperclip size={13} />
                            {asset.originalName || asset.name}
                          </button>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
              {canReply && (
                <div
                  className={`shrink-0 border-t border-zinc-200 p-3 dark:border-zinc-800 sm:p-4 ${mode === "note" ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
                >
                  <div className="mb-2 flex items-center gap-3">
                    <SelectField
                      aria-label="Message type"
                      className="h-9 w-40 border-0 bg-transparent px-2 text-xs sm:text-sm font-semibold shadow-none"
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                    >
                      <option value="reply">Reply by email</option>
                      <option value="note">Internal note</option>
                    </SelectField>
                    <span className="min-w-0 truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {mode === "note"
                        ? "Only visible to your team"
                        : `To ${conversation.email}`}
                    </span>
                  </div>
                  <div
                    className={`overflow-hidden rounded-2xl border bg-white focus-within:border-blue-400 dark:bg-zinc-900 ${mode === "note" ? "border-amber-200 dark:border-amber-800" : "border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <textarea
                      ref={replyTextareaRef}
                      aria-label={
                        mode === "note" ? "Internal note" : "Email reply"
                      }
                      disabled={busy}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      maxLength={20000}
                      rows={1}
                      className="w-full resize-none overflow-y-auto bg-transparent px-3.5 py-2.5 text-sm sm:text-base leading-relaxed outline-none min-h-10.5 max-h-33.75"
                      placeholder={
                        mode === "note"
                          ? "Write a note, or mention someone with @username..."
                          : "Write a reply..."
                      }
                    />
                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2 px-3 pb-2">
                        {files.map((file) => (
                          <button
                            key={file._id}
                            disabled={busy}
                            onClick={() =>
                              setFiles(
                                files.filter((item) => item._id !== file._id),
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800"
                          >
                            {file.name}
                            <X size={12} />
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInput}
                      multiple
                      hidden
                      onChange={(e) =>
                        perform(async () => {
                          const form = new FormData();
                          for (const file of e.target.files)
                            form.append("files", file);
                          const uploaded = await api(
                            `/inbox/${selected}/attachments`,
                            { method: "POST", body: form },
                          );
                          setFiles((current) =>
                            [...current, ...uploaded].slice(0, 4),
                          );
                          e.target.value = "";
                        })
                      }
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-2">
                      <div className="flex min-w-0 items-center gap-1">
                        <Button
                          disabled={busy || files.length >= 4}
                          size="icon"
                          variant="ghost"
                          aria-label="Attach files"
                          title="Attach files"
                          onClick={() => fileInput.current.click()}
                        >
                          <Paperclip size={17} />
                        </Button>
                        {templates.length > 0 && (
                          <SelectField
                            aria-label="Insert saved reply"
                            className="h-9 w-36 border-0 bg-transparent px-2 text-xs sm:text-sm font-medium shadow-none"
                            value=""
                            onChange={(e) => {
                              const template = templates.find(
                                (item) => item._id === e.target.value,
                              );
                              if (template)
                                setBody(
                                  template.text
                                    .replace(
                                      /{{firstName}}/g,
                                      conversation.name.split(" ")[0],
                                    )
                                    .replace(
                                      /{{conversationNumber}}/g,
                                      conversation.conversationNumber,
                                    )
                                    .replace(/{{email}}/g, conversation.email),
                                );
                            }}
                          >
                            <option value="">Saved replies</option>
                            {templates.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name}
                              </option>
                            ))}
                          </SelectField>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {mode === "reply" && (
                          <Button
                            disabled={busy || !body.trim()}
                            size="sm"
                            variant="ghost"
                            className="text-xs sm:text-sm font-semibold"
                            onClick={() => submit(true)}
                          >
                            Send & resolve
                          </Button>
                        )}
                        <Button
                          disabled={busy || !body.trim()}
                          size="sm"
                          className="rounded-xl px-4 py-2 text-sm font-bold"
                          onClick={() => submit(false)}
                        >
                          <Send size={15} />
                          {busy
                            ? "Saving..."
                            : mode === "note"
                              ? "Add note"
                              : "Send"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation details</DialogTitle>
            <DialogDescription>
              {conversation?.conversationNumber}
            </DialogDescription>
          </DialogHeader>
          {conversation && (
            <div className="space-y-4">
              <p className="break-all text-sm">
                {conversation.name}
                <br />
                {conversation.email}
              </p>
              <p className="text-xs text-zinc-500">
                {readable(conversation.source)} · Created{" "}
                {new Date(conversation.createdAt).toLocaleDateString()}
              </p>
              <label className="block text-xs font-semibold">
                Status
                <SelectField
                  disabled={!canReply || busy}
                  value={conversation.conversationStatus}
                  onChange={(e) => update({ status: e.target.value })}
                  className={`${input} mt-1`}
                >
                  {statuses.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </SelectField>
              </label>
              <label className="block text-xs font-semibold">
                Priority
                <SelectField
                  disabled={!canReply || busy}
                  value={conversation.priority}
                  onChange={(e) => update({ priority: e.target.value })}
                  className={`${input} mt-1`}
                >
                  {["LOW", "NORMAL", "HIGH", "URGENT"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </SelectField>
              </label>
              <label className="block text-xs font-semibold">
                Assigned to
                <SelectField
                  disabled={
                    !hasPermission(user, "communications.inbox.assign") || busy
                  }
                  value={conversation.assignedTo || ""}
                  onChange={(e) => update({ assignedTo: e.target.value })}
                  className={`${input} mt-1`}
                >
                  <option value="">Unassigned</option>
                  {users.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.fullName}
                    </option>
                  ))}
                </SelectField>
              </label>
              <label className="block text-xs font-semibold">
                Tags
                <input
                  disabled={!canReply || busy}
                  key={`${conversation._id}:${conversation.tags?.join(",")}`}
                  defaultValue={conversation.tags?.join(", ")}
                  onBlur={(e) => {
                    const tags = e.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                    if (tags.join(",") !== conversation.tags?.join(","))
                      update({ tags });
                  }}
                  className={`${input} mt-1`}
                  placeholder="Comma-separated tags"
                />
              </label>
              {hasPermission(user, "messages.send") && (
                <>
                  <label className="block text-xs font-semibold">
                    Share with team
                    <SelectField
                      disabled={busy}
                      className={`${input} mt-1`}
                      value=""
                      onChange={(e) => {
                        const conversationId = e.target.value;
                        if (conversationId)
                          perform(() =>
                            api(`/inbox/${selected}/share`, {
                              method: "POST",
                              body: {
                                conversationId,
                                requestId: crypto.randomUUID(),
                              },
                            }),
                          );
                      }}
                    >
                      <option value="">Choose a team chat</option>
                      {teams.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name ||
                            item.members
                              ?.map((person) => person.fullName)
                              .join(", ")}
                        </option>
                      ))}
                    </SelectField>
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPicker(true)}
                  >
                    Link related content
                  </Button>
                  {conversation.relatedContent?.entityId && (
                    <div className="flex items-center gap-2 text-xs">
                      <MessageSquare className="h-4 w-4" />
                      Related discussion
                      <DiscussButton {...conversation.relatedContent} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ContentAttachModal
        open={picker}
        onClose={() => setPicker(false)}
        onSelect={(item) =>
          update({
            relatedContent: {
              entityType:
                item.type === "question" ? "interview_question" : item.type,
              entityId: String(item.id || item._id)
                .split(":")
                .at(-1),
            },
          })
        }
      />
    </div>
  );
}
