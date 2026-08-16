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
      className="h-7 w-7 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-black text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
      {user?.fullName?.[0] || <UserRound size={12} />}
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
      if (prev.some((p) => (p.id || p._id || p.adminUrl) === (item.id || item._id || item.adminUrl))) {
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
      className={`relative shrink-0 border-t border-zinc-200 dark:border-zinc-800 ${
        compact ? "p-2.5" : "p-3 sm:p-4"
      }`}
    >
      {error && (
        <button
          onClick={() => setError("")}
          className="mb-2 flex w-full items-center justify-between rounded-lg bg-rose-50 px-3 py-2 text-left text-[10px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
        >
          {error}
          <X size={12} />
        </button>
      )}

      {/* Replying or Editing Banner */}
      {(replyTo || editing) && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border-l-2 border-blue-500 bg-blue-50 px-3 py-1.5 dark:bg-blue-500/10">
          <Reply size={13} className="text-blue-600 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-blue-700">
              {editing
                ? "Editing message"
                : `Replying to ${replyTo.senderId?.fullName || "team member"}`}
            </p>
            <p className="truncate text-[10px] text-zinc-500">
              {editing?.content || replyTo.content || "Message deleted"}
            </p>
          </div>
          <button
            onClick={() => {
              setReplyTo(null);
              setEditing(null);
              if (editing) setContent("");
            }}
            className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attached Content Cards Preview */}
      {attachedContent?.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {attachedContent.map((item, idx) => (
            <div key={idx} className="relative group">
              <ContentMessageCard item={item} onRemove={() => removeContent(idx)} compact={compact} />
              <button
                type="button"
                onClick={() => removeContent(idx)}
                className="absolute top-0 right-0 z-10 rounded-full bg-zinc-900/80 text-white p-1 shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                title="Remove attached content"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attached Files Preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <span
              key={file._id}
              className="flex max-w-52 items-center gap-2 rounded-lg bg-zinc-100 px-2.5 py-1.5 text-[10px] dark:bg-zinc-900"
            >
              <File size={12} />
              <span className="truncate">{file.name}</span>
              <button
                onClick={() =>
                  setAttachments((items) =>
                    items.filter((item) => item._id !== file._id),
                  )
                }
                className="cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress > 0 && (
        <div className="mb-2 h-1 overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-blue-600 transition-all duration-150"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {canPost ? (
        <div className="relative flex items-end gap-2">
          {/* Attachment Toggle Button & Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className={`flex ${
                compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11"
              } shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:border-blue-500 hover:text-blue-600 dark:border-zinc-800 dark:hover:border-blue-400 dark:hover:text-blue-400 cursor-pointer`}
              title="Attach file or content"
            >
              <Plus
                size={16}
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
              <div className="absolute bottom-12 left-0 z-30 flex w-52 flex-col rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-zinc-800 dark:bg-[#121215] animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowAttachMenu(false);
                    setShowContentModal(true);
                  }}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                    <LayoutGrid size={14} />
                  </span>
                  <div>
                    <span className="block text-xs font-bold">Admin Content</span>
                    <span className="block text-[9px] font-normal text-zinc-400">
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
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    <Upload size={14} />
                  </span>
                  <div>
                    <span className="block text-xs font-bold">Upload File</span>
                    <span className="block text-[9px] font-normal text-zinc-400">
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
            className={`max-h-28 min-h-9 sm:min-h-11 flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-blue-500 dark:border-zinc-800 dark:bg-zinc-900 ${
              compact ? "py-2 text-xs" : ""
            }`}
          />

          {/* Mentions dropdown */}
          {mentionOptions.length > 0 && (
            <div className="absolute bottom-13 left-12 z-20 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
              {mentionOptions.map((member) => (
                <button
                  key={member._id}
                  onClick={() => insertMention(member)}
                  className="flex w-full items-center gap-2 rounded-lg p-2 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <MentionAvatar user={member} />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold">
                      {member.fullName}
                    </span>
                    <span className="block text-[9px] text-zinc-500">
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
              (!content.trim() && !attachments.length && !attachedContent?.length) ||
              uploadProgress > 0
            }
            className={`flex ${
              compact ? "h-9 w-9" : "h-10 w-10 sm:h-11 sm:w-11"
            } shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer`}
          >
            <Send size={15} />
          </button>
        </div>
      ) : (
        <p className="rounded-xl bg-zinc-100 p-3 text-center text-xs text-zinc-500 dark:bg-zinc-900">
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
