"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthModal from "@/components/auth/AuthModal";
import { useAppSelector } from "@/lib/store/hooks";
import {
  useGetMyLibraryQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useCreateBookmarkMutation,
  useCreateCollectionMutation,
} from "@/lib/api/libraryApi";
import {
  BookOpen,
  Code2,
  FolderPlus,
  Globe2,
  Link2,
  Lock,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

const TYPES = [
  ["note", "Note"],
  ["cheatsheet", "Cheatsheet"],
  ["code_snippet", "Code Snippet"],
  ["debug_fix", "Debug / Fix"],
  ["command", "Command"],
  ["setup_guide", "Setup Guide"],
  ["interview_note", "Interview Note"],
  ["template", "Template"],
  ["mini_article", "Mini Article"],
  ["tip", "Tip / TIL"],
];
const TEMPLATES = {
  note: "## What I want to remember\n\n## Details\n\n## References\n",
  code_snippet:
    "## What this solves\n\n## Language / Technology\n\n## Code\n```js\n\n```\n\n## How to use it\n\n## Notes\n",
  debug_fix:
    "## Problem\n\n## Error message\n\n## Cause\n\n## Solution\n\n## Fixed code\n```\n\n```\n\n## Things to remember\n",
  command:
    "## Command\n```bash\n\n```\n\n## Purpose\n\n## Example\n\n## Explanation\n\n## Warning / Notes\n",
  setup_guide:
    "## Goal\n\n## Prerequisites\n\n## Steps\n\n## Configuration\n\n## Common issues\n\n## Verification\n",
  interview_note:
    "## Question\n\n## Short answer\n\n## Detailed explanation\n\n## Example\n\n## Key points to remember\n",
  cheatsheet:
    "## Quick reference\n\n## Syntax / commands\n\n## Examples\n\n## Important notes\n",
  tip: "## What I learned\n\n## Example\n\n## Why it matters\n",
  template: "## Use this template for\n\n## Template\n\n## Notes\n",
  mini_article:
    "## Introduction\n\n## Main idea\n\n## Example\n\n## Takeaway\n",
};
const initial = {
  title: "",
  content: TEMPLATES.note,
  tags: "",
  visibility: "private",
  collectionId: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
};

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const { data, isLoading } = useGetMyLibraryQuery(undefined, {
    skip: !isAuthenticated,
  });
  const [createEntry] = useCreateEntryMutation();
  const [updateEntry] = useUpdateEntryMutation();
  const [createBookmark] = useCreateBookmarkMutation();
  const [createCollection] = useCreateCollectionMutation();
  const [modal, setModal] = useState(null),
    [type, setType] = useState("note"),
    [form, setForm] = useState(initial),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [seo, setSeo] = useState(false),
    [auth, setAuth] = useState(false);
  const library = data?.data || { entries: [], bookmarks: [], collections: [] };
  const entries = useMemo(
    () =>
      library.entries.filter(
        (e) =>
          (filter === "all" || e.type === filter) &&
          `${e.title} ${e.content} ${e.tags?.join(" ")}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [library.entries, filter, query],
  );
  const startEntry = (next = "note", entry = null) => {
    router.push(
      entry ? `/library/edit/${entry._id}` : `/library/new?type=${next}`,
    );
  };
  const submitEntry = async (e) => {
    e.preventDefault();
    try {
      if (modal === "edit")
        await updateEntry({
          id: form._id,
          ...form,
          visibility: "private",
          type,
          publishConfirmed: false,
        }).unwrap();
      else
        await createEntry({
          ...form,
          visibility: "private",
          type,
          publishConfirmed: false,
        }).unwrap();
      toast.success(
        modal === "edit"
          ? "Knowledge updated"
          : "Saved privately in your library",
      );
      setModal(null);
    } catch (err) {
      toast.error(err?.data?.message || "Unable to save");
    }
  };
  const submitOther = async (e) => {
    e.preventDefault();
    try {
      if (modal === "bookmark")
        await createBookmark({
          ...form,
          visibility: "private",
          publishConfirmed: false,
        }).unwrap();
      else
        await createCollection({
          ...form,
          visibility: "private",
          publishConfirmed: false,
        }).unwrap();
      toast.success(
        modal === "bookmark"
          ? "Bookmark saved privately"
          : "Collection created",
      );
      setModal(null);
    } catch (err) {
      toast.error(err?.data?.message || "Unable to save");
    }
  };
  if (!isAuthenticated)
    return (
      <>
        <Header />
        <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 pt-24 text-center">
          <BookOpen size={48} className="text-blue-600" />
          <h1 className="mt-5 text-3xl font-black">
            Your developer knowledge library
          </h1>
          <p className="mt-3 text-zinc-500">
            Save notes, code, fixes, commands, guides and useful resources so
            you never have to rediscover them again.
          </p>
          <button
            onClick={() => setAuth(true)}
            className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white"
          >
            Sign in to get started
          </button>
        </main>
        <AuthModal isOpen={auth} onOpenChange={setAuth} defaultTab="signin" />
        <Footer />
      </>
    );
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:px-6">
        <section className="relative overflow-hidden rounded-4xl sm:rounded-[2.5rem] border border-blue-200/80 bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-10 text-white shadow-xl shadow-blue-500/10 dark:border-white/8 dark:bg-linear-to-br dark:from-[#11141f] dark:via-[#131728] dark:to-[#0f111a] dark:text-zinc-100 dark:shadow-2xl dark:shadow-black/60">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 dark:bg-blue-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/15 dark:bg-indigo-600/10 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur-xs dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
                <Sparkles className="h-3 w-3 text-blue-200 dark:text-blue-400" />
                <span>My Library</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                Your developer second brain.
              </h1>
              <p className="mt-2 max-w-xl text-xs sm:text-sm font-medium leading-relaxed text-blue-100/90 dark:text-zinc-400">
                Save the code, fixes, commands and knowledge you know
                you&apos;ll need again.
              </p>
            </div>
            <button
              onClick={() => startEntry()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-5 py-3 text-xs sm:text-sm font-bold text-blue-700 shadow-md transition-all hover:bg-blue-50 hover:-translate-y-0.5 active:scale-95 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500 dark:shadow-blue-600/25 cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>New knowledge</span>
            </button>
          </div>

          <div className="relative z-10 mt-6 flex flex-wrap gap-2 pt-1">
            <button onClick={() => startEntry("note")} className="chip">
              New Note
            </button>
            <button onClick={() => startEntry("code_snippet")} className="chip">
              Add Code Snippet
            </button>
            <button onClick={() => startEntry("debug_fix")} className="chip">
              Save a Fix
            </button>
            <button
              onClick={() => {
                setForm({
                  title: "",
                  url: "",
                  description: "",
                  note: "",
                  tags: "",
                  visibility: "private",
                  collectionId: "",
                });
                setModal("bookmark");
              }}
              className="chip"
            >
              Add Bookmark
            </button>
            <button
              onClick={() => {
                setForm({
                  name: "",
                  description: "",
                  visibility: "private",
                });
                setModal("collection");
              }}
              className="chip"
            >
              Create Collection
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[210px_1fr]">
          <aside className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400">
              <FolderPlus size={15} />
              <span>Collections</span>
            </div>
            {library.collections.length ? (
              library.collections.map((c) => (
                <p key={c._id} className="mt-3 text-sm font-semibold">
                  {c.name}
                </p>
              ))
            ) : (
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Group your notes, links and saved learning content.
              </p>
            )}
          </aside>
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <Search size={16} className="text-zinc-400" />
                <input
                  className="w-full bg-transparent text-sm outline-none"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search your library"
                />
              </label>
              <select
                className="rounded-2xl bg-white px-4 py-3 text-sm dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All types</option>
                {TYPES.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <p className="p-10 text-center text-zinc-500">
                Loading your library…
              </p>
            ) : !entries.length && !library.bookmarks.length ? (
              <Empty onCreate={() => startEntry()} />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {entries.map((e) => (
                  <button
                    key={e._id}
                    onClick={() => startEntry(e.type, e)}
                    className="rounded-3xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 cursor-pointer"
                  >
                    <div className="flex justify-between">
                      <span className="rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-1 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                        {TYPES.find(([v]) => v === e.type)?.[1]}
                      </span>
                      {e.visibility === "public" ? (
                        <Globe2 size={15} />
                      ) : (
                        <Lock size={15} className="text-zinc-400" />
                      )}
                    </div>
                    <h2 className="mt-4 line-clamp-1 font-black">{e.title}</h2>
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
                      {e.content.replace(/[#`*]/g, "")}
                    </p>
                    <p className="mt-4 text-[10px] text-zinc-400">
                      {e.tags?.map((t) => `#${t}`).join(" ")}
                    </p>
                  </button>
                ))}
                {library.bookmarks.map((b) => (
                  <a
                    key={b._id}
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-3xl bg-white p-5 shadow-sm dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 hover:-translate-y-0.5 transition"
                  >
                    <Link2
                      size={15}
                      className="text-violet-600 dark:text-violet-400"
                    />
                    <h2 className="mt-4 line-clamp-1 font-black">{b.title}</h2>
                    <p className="mt-2 text-xs text-zinc-500">{b.domain}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      {modal && (
        <Modal
          {...{
            modal,
            type,
            setType,
            form,
            setForm,
            collections: library.collections,
            seo,
            setSeo,
            onClose: () => setModal(null),
            onSubmit:
              modal === "entry" || modal === "edit" ? submitEntry : submitOther,
          }}
        />
      )}
      <style jsx>{`
        .chip {
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.16);
          padding: 0.45rem 0.85rem;
          font-size: 11.5px;
          font-weight: 700;
          color: inherit;
          transition: all 0.15s ease;
          cursor: pointer;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-1px);
        }
        :global(.dark) .chip {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #d4d4d8;
        }
        :global(.dark) .chip:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.16);
          color: #ffffff;
        }
      `}</style>
    </div>
  );
}
function Empty({ onCreate }) {
  return (
    <div className="rounded-3xl bg-white p-12 text-center shadow-sm dark:bg-zinc-900">
      <Code2 className="mx-auto text-blue-500" />
      <h2 className="mt-4 text-lg font-black">Start with one useful thing</h2>
      <p className="mt-2 text-sm text-zinc-500">
        A command you always forget, a bug you fixed, or a link worth keeping.
      </p>
      <button
        onClick={onCreate}
        className="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white"
      >
        Create your first note
      </button>
    </div>
  );
}
function Modal({
  modal,
  type,
  setType,
  form,
  setForm,
  collections,
  seo,
  setSeo,
  onClose,
  onSubmit,
}) {
  const entry = modal === "entry" || modal === "edit";
  const put = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-black/50 p-3">
      <form
        onSubmit={onSubmit}
        className="mx-auto my-5 max-w-3xl rounded-4xl bg-white p-6 dark:bg-zinc-900"
      >
        <div className="flex justify-between">
          <h2 className="text-xl font-black">
            {modal === "bookmark"
              ? "Add bookmark"
              : modal === "collection"
                ? "Create collection"
                : modal === "edit"
                  ? "Edit knowledge"
                  : "New knowledge"}
          </h2>
          <button type="button" onClick={onClose}>
            <X />
          </button>
        </div>
        {entry && (
          <select
            className="field mt-5"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (!form.title) put("content", TEMPLATES[e.target.value]);
            }}
          >
            {TYPES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        )}
        <input
          required
          className="field mt-3"
          value={modal === "collection" ? form.name || "" : form.title || ""}
          onChange={(e) =>
            put(modal === "collection" ? "name" : "title", e.target.value)
          }
          placeholder={modal === "collection" ? "Collection name" : "Title"}
        />
        {modal === "bookmark" && (
          <input
            required
            type="url"
            className="field mt-3"
            value={form.url || ""}
            onChange={(e) => put("url", e.target.value)}
            placeholder="https://example.com"
          />
        )}
        {entry ? (
          <textarea
            required
            rows={14}
            className="field mt-3 font-mono"
            value={form.content || ""}
            onChange={(e) => put("content", e.target.value)}
          />
        ) : (
          <textarea
            rows={3}
            className="field mt-3"
            value={form.description || ""}
            onChange={(e) => put("description", e.target.value)}
            placeholder="Description or personal note (optional)"
          />
        )}
        {modal !== "collection" && (
          <input
            className="field mt-3"
            value={form.tags || ""}
            onChange={(e) => put("tags", e.target.value)}
            placeholder="Tags, separated by commas"
          />
        )}
        {entry && (
          <select
            className="field mt-3"
            value={form.collectionId || ""}
            onChange={(e) => put("collectionId", e.target.value)}
          >
            <option value="">No collection yet</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        {entry && (
          <div className="mt-4 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <label className="text-sm font-bold">Visibility</label>
            <select
              className="field mt-2"
              value={form.visibility || "private"}
              onChange={(e) => put("visibility", e.target.value)}
            >
              <option value="private">Private — only you can view it</option>
              <option value="unlisted">
                Unlisted — not searchable or indexed
              </option>
              <option value="public">
                Public — visible on your profile and may be indexed
              </option>
            </select>
          </div>
        )}
        {entry && (
          <>
            <button
              type="button"
              onClick={() => setSeo(!seo)}
              className="mt-4 text-sm font-bold text-blue-600"
            >
              {seo ? "Hide" : "Show"} optional SEO settings
            </button>
            {seo && (
              <div className="mt-3 space-y-3">
                <input
                  className="field"
                  value={form.seoTitle || ""}
                  onChange={(e) => put("seoTitle", e.target.value)}
                  placeholder="SEO title"
                />
                <textarea
                  className="field"
                  value={form.seoDescription || ""}
                  onChange={(e) => put("seoDescription", e.target.value)}
                  placeholder="Meta description"
                />
                <input
                  className="field"
                  value={form.canonicalUrl || ""}
                  onChange={(e) => put("canonicalUrl", e.target.value)}
                  placeholder="Canonical URL (optional)"
                />
              </div>
            )}
          </>
        )}
        <button className="mt-5 w-full rounded-full bg-blue-600 py-3 text-sm font-bold text-white">
          {modal === "edit" ? "Save changes" : "Save privately"}
        </button>
        <style jsx>{`
          .field {
            width: 100%;
            border: 1px solid #e4e4e7;
            border-radius: 0.75rem;
            background: transparent;
            padding: 0.75rem;
            font-size: 0.875rem;
          }
        `}</style>
      </form>
    </div>
  );
}
