"use client";

import { useRef, useState } from "react";
import {
  File,
  LayoutGrid,
  Paperclip,
  Plus,
  Reply,
  Send,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { avatarUrl } from "./messaging-utils";
import ContentAttachModal from "./ContentAttachModal";
import ContentMessageCard from "./ContentMessageCard";

function MentionAvatar({ user }) {
  const source = avatarUrl(user?.avatar);
  return source ? (
    <img
      src={source}
      alt=""
      className="h-8 w-8 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {user?.fullName?.[0] || <UserRound size={14} />}
    </span>
  );
}

export default function MessageInput({
  content,
  setContent,
  attachments = [],
  setAttachments,
  attachedContent = [],
  setAttachedContent = () => {},
  replyTo,
  setReplyTo,
  editing,
  setEditing,
  uploadProgress,
  canPost,
  members = [],
  error,
  setError,
  onSend,
  onUpload,
  onTyping,
  compact = false,
}) {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const fileInputRef = useRef(null);

  const mentionMatches = content.match(/(?:^|\s)@([a-z0-9._-]*)$/i);
  const mentionOptions = mentionMatches
    ? members
        .filter((member) =>
          member.username
            ?.toLowerCase()
            .startsWith(mentionMatches[1].toLowerCase()),
        )
        .slice(0, 6)
    : [];

  const insertMention = (member) => {
    setContent((value) =>
      value.replace(/@([a-z0-9._-]*)$/i, `@${member.username} `),
    );
  };

  const handleSelectContent = (item) => {
    setAttachedContent((prev = []) => {
      if (
        prev.some(
          (p) =>
            (p.id || p._id || p.adminUrl) ===
            (item.id || item._id || item.adminUrl),
        )
      ) {
        return prev;
      }
      return [...prev, item];
    });
  };

  const removeContent = (indexToRemove) => {
    setAttachedContent((prev = []) =>
      prev.filter((_, idx) => idx !== indexToRemove),
    );
  };

  return (
    <div
      className={`relative shrink-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] ${
        compact ? "p-3" : "p-3.5 sm:p-4.5"
      }`}
    >
      {error && (
        <button
          onClick={() => setError("")}
          className="mb-2.5 flex w-full items-center justify-between rounded-xl bg-rose-50 px-3.5 py-2.5 text-left text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
        >
          <span>{error}</span>
          <X size={14} />
        </button>
      )}

      {/* Replying or Editing Banner */}
      {(replyTo || editing) && (
        <div className="mb-2.5 flex items-center gap-2.5 rounded-2xl border-l-3 border-blue-500 bg-blue-50/90 px-3.5 py-2 dark:bg-blue-500/15">
          <Reply size={15} className="text-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-blue-700 dark:text-blue-300">
              {editing
                ? "Editing message"
                : `Replying to ${replyTo.senderId?.fullName || "team member"}`}
            </p>
            <p className="truncate text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
              {editing?.content || replyTo.content || "Message deleted"}
            </p>
          </div>
          <button
            onClick={() => {
              setReplyTo(null);
              setEditing(null);
              if (editing) setContent("");
            }}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attached Content Cards Preview */}
      {attachedContent?.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2 max-h-44 overflow-y-auto">
          {attachedContent.map((item, idx) => (
            <div key={idx} className="relative group">
              <ContentMessageCard
                item={item}
                onRemove={() => removeContent(idx)}
                compact={compact}
              />
              <button
                type="button"
                onClick={() => removeContent(idx)}
                className="absolute top-1 right-1 z-10 rounded-full bg-zinc-900/80 text-white p-1 shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                title="Remove attached content"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attached Files Preview */}
      {attachments.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <span
              key={file._id}
              className="flex max-w-60 items-center gap-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-800"
            >
              <File size={14} className="shrink-0 text-blue-500" />
              <span className="truncate">{file.name}</span>
              <button
                onClick={() =>
                  setAttachments((items) =>
                    items.filter((item) => item._id !== file._id),
                  )
                }
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-1"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress > 0 && (
        <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {canPost ? (
        <div className="relative flex items-end gap-2.5">
          {/* Attachment Toggle Button & Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 text-zinc-500 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-400 cursor-pointer bg-zinc-50 dark:bg-zinc-900"
              title="Attach file or content"
            >
              <Plus
                size={18}
                className={`transition-transform duration-200 ${
                  showAttachMenu ? "rotate-45" : ""
                }`}
              />
            </button>

            {/* Hidden native file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,text/markdown,text/csv,application/json,.docx"
              onChange={(event) => {
                if (onUpload) onUpload(event.target.files);
                event.target.value = "";
              }}
            />

            {/* Attachment Options Menu */}
            {showAttachMenu && (
              <div className="absolute bottom-14 left-0 z-30 flex w-56 flex-col rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-zinc-800 dark:bg-[#121215] animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setShowContentModal(true);
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <LayoutGrid size={16} />
                  </span>
                  <div>
                    <span className="block text-sm font-bold">
                      Admin Content
                    </span>
                    <span className="block text-xs font-normal text-zinc-400">
                      Article, Course, Quiz…
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    fileInputRef.current?.click();
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Upload size={16} />
                  </span>
                  <div>
                    <span className="block text-sm font-bold">Upload File</span>
                    <span className="block text-xs font-normal text-zinc-400">
                      Images, PDFs, Docs
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <textarea
            value={content}
            onChange={(event) => {
              const text = event.target.value.slice(0, 4000);
              setContent(text);
              if (onTyping) onTyping(text.trim().length > 0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                if (onTyping) onTyping(false);
                onSend();
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder={editing ? "Edit message…" : "Write a message…"}
            className="max-h-32 min-h-11 sm:min-h-12 flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm sm:text-base outline-none focus:border-blue-500 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 placeholder:text-zinc-400 text-zinc-900 dark:text-zinc-100 transition-colors"
          />

          {/* Mentions dropdown */}
          {mentionOptions.length > 0 && (
            <div className="absolute bottom-14 left-14 z-20 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              {mentionOptions.map((member) => (
                <button
                  key={member._id}
                  onClick={() => insertMention(member)}
                  className="flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <MentionAvatar user={member} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-zinc-900 dark:text-white">
                      {member.fullName}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      @{member.username} · {member.role}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Send button */}
          <button
            onClick={() => onSend()}
            disabled={
              (!content.trim() &&
                !attachments.length &&
                !attachedContent?.length) ||
              uploadProgress > 0
            }
            className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Send size={17} />
          </button>
        </div>
      ) : (
        <p className="rounded-2xl bg-zinc-100 p-3.5 text-center text-sm font-medium text-zinc-500 dark:bg-zinc-900">
          This channel is read-only for your role.
        </p>
      )}

      {/* Modal for selecting admin content to attach */}
      <ContentAttachModal
        open={showContentModal}
        onClose={() => setShowContentModal(false)}
        onSelect={handleSelectContent}
      />
    </div>
  );
}
