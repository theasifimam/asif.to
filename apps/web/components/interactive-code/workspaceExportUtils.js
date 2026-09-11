export async function copyWorkspaceFiles(sandpack) {
  if (!sandpack?.files) return;
  const source = Object.entries(sandpack.files)
    .map(([name, file]) => `// ${name}\n${file.code}`)
    .join("\n\n");
  await navigator.clipboard.writeText(source);
}

export async function downloadWorkspaceFiles(sandpack, title) {
  if (!sandpack?.files) return;
  const entries = Object.entries(sandpack.files);

  if (entries.length > 1) {
    const { default: JSZip } = await import("jszip");
    const archive = new JSZip();
    entries.forEach(([path, file]) => {
      const projectPath = path.replace(/^\/+/, "");
      if (projectPath) archive.file(projectPath, file.code || "");
    });
    const blob = await archive.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      String(title || "project")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "project"
    }.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const activePath = sandpack.activeFile || Object.keys(sandpack.files)[0];
  const source = sandpack.files[activePath]?.code || "";
  const filename = activePath.split("/").filter(Boolean).pop() || "index.js";
  const extension = filename.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    jsx: "text/jsx",
    ts: "text/typescript",
    tsx: "text/tsx",
    json: "application/json",
  };
  const url = URL.createObjectURL(
    new Blob([source], { type: mimeTypes[extension] || "text/plain" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
