"use client";

import { useEffect, useState } from "react";
import { Download, File } from "lucide-react";
import { messagingApi } from "@/lib/api";
import { formatBytes } from "./messaging-utils";

export default function AttachmentView({ file }) {
  const [url, setUrl] = useState("");
  const attachmentId = file.attachmentId || file._id;

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    messagingApi
      .attachmentBlob(attachmentId)
      .then((blob) => {
        if (active) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachmentId]);

  if (file.mimeType?.startsWith("image/") && url) {
    return (
      <a href={url} target="_blank" rel="noreferrer">
        <img
          src={url}
          alt={file.name}
          className="max-h-48 max-w-full rounded-xl object-cover shadow-xs border border-white/20"
        />
      </a>
    );
  }

  return (
    <a
      href={url || undefined}
      download={file.name}
      className="flex max-w-60 items-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-[10px] transition hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/15"
    >
      <File size={15} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{file.name}</span>
        <span className="opacity-70">{formatBytes(file.size)}</span>
      </span>
      <Download size={13} />
    </a>
  );
}
