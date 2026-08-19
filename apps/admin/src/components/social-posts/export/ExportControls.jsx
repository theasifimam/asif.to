"use client";

import { useState } from "react";
import { Download, Images, Loader2 } from "lucide-react";
import { downloadAllNodes, downloadNode } from "./ExportEngine";
import { Button } from "@/components/ui";

export default function ExportControls({
  name,
  activeIndex,
  previewRef,
  exportRefs,
}) {
  const [busy, setBusy] = useState("");

  const exportOne = async (type) => {
    try {
      setBusy(type);
      await downloadNode(previewRef.current, {
        type,
        name,
        index: activeIndex,
      });
    } finally {
      setBusy("");
    }
  };

  const exportAll = async (type) => {
    try {
      setBusy(`all-${type}`);
      const nodes = exportRefs.current.filter(Boolean);
      await downloadAllNodes(nodes, { type, name });
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => exportOne("png")}>
        {busy === "png" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        PNG
      </Button>

      <Button variant="outline" onClick={() => exportOne("jpeg")}>
        {busy === "jpeg" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Download size={15} />
        )}
        JPEG
      </Button>

      <Button variant="default" onClick={() => exportAll("png")}>
        {busy === "all-png" ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Images size={15} />
        )}
        Download all
      </Button>
    </div>
  );
}
