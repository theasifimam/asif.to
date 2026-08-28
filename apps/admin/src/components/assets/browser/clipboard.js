export function isEditablePasteTarget(target) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      'input, textarea, select, [contenteditable=""], [contenteditable="true"], [role="textbox"]',
    ),
  );
}

function fallbackClipboardFileName(type, index) {
  const knownExtensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  const extension = knownExtensions[type] || type.split("/")[1]?.split("+")[0] || "bin";
  return `clipboard-${Date.now()}-${index + 1}.${extension}`;
}

export async function sourcesFromClipboardData(clipboardData) {
  if (!clipboardData) return [];

  const sources = [];
  const items = Array.from(clipboardData.items || []);

  for (const item of items) {
    if (item.kind !== "file") continue;

    let source = null;
    if (typeof item.getAsFileSystemHandle === "function") {
      try {
        source = await item.getAsFileSystemHandle();
      } catch {
        // Older Chromium builds may expose the method without clipboard support.
      }
    }
    if (!source && typeof item.webkitGetAsEntry === "function") {
      source = item.webkitGetAsEntry();
    }
    if (!source) source = item.getAsFile();
    if (source) sources.push(source);
  }

  if (!sources.length) sources.push(...Array.from(clipboardData.files || []));
  return sources;
}

export async function sourcesFromNavigatorClipboard() {
  if (!navigator.clipboard?.read) return [];

  const clipboardItems = await navigator.clipboard.read();
  const sources = [];
  let fileIndex = 0;

  for (const clipboardItem of clipboardItems) {
    const type = clipboardItem.types.find((value) => !value.startsWith("text/"));
    if (!type) continue;
    const blob = await clipboardItem.getType(type);
    sources.push(
      blob instanceof File
        ? blob
        : new File([blob], fallbackClipboardFileName(type, fileIndex), {
            type: blob.type || type,
            lastModified: Date.now(),
          }),
    );
    fileIndex += 1;
  }

  return sources;
}

export function isDirectorySource(source) {
  return source?.kind === "directory" || source?.isDirectory === true;
}

export async function fileFromClipboardSource(source) {
  if (source instanceof File) return source;
  if (source?.kind === "file" && typeof source.getFile === "function") {
    return source.getFile();
  }
  if (source?.isFile && typeof source.file === "function") {
    return new Promise((resolve, reject) => source.file(resolve, reject));
  }
  return null;
}

async function readWebkitDirectoryEntries(directory) {
  const reader = directory.createReader();
  const entries = [];

  while (true) {
    const batch = await new Promise((resolve, reject) =>
      reader.readEntries(resolve, reject),
    );
    if (!batch.length) break;
    entries.push(...batch);
  }

  return entries;
}

export async function childrenFromDirectorySource(source) {
  if (source?.kind === "directory" && typeof source.values === "function") {
    const children = [];
    for await (const child of source.values()) children.push(child);
    return children;
  }
  if (source?.isDirectory && typeof source.createReader === "function") {
    return readWebkitDirectoryEntries(source);
  }
  return [];
}
