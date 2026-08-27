export const VSCODE_DARK_THEME = {
  colors: { surface1: "#1e1e1e", surface2: "#252526", surface3: "#333333", clickable: "#cccccc", base: "#9d9d9d", disabled: "#666666", hover: "#ffffff", accent: "#007acc", error: "#f48771", errorSurface: "#3c1f1e" },
  syntax: { plain: "#d4d4d4", comment: { color: "#6a9955", fontStyle: "italic" }, keyword: "#c586c0", tag: "#569cd6", punctuation: "#d4d4d4", definition: "#dcdcaa", property: "#9cdcfe", static: "#4ec9b0", string: "#ce9178" },
  font: { body: "Inter, system-ui, sans-serif", mono: "Consolas, 'Cascadia Code', 'Fira Code', monospace", size: "14px", lineHeight: "1.6" },
};

export const VSCODE_LIGHT_THEME = {
  colors: { surface1: "#ffffff", surface2: "#f3f3f3", surface3: "#e5e5e5", clickable: "#3b3b3b", base: "#616161", disabled: "#a0a0a0", hover: "#111111", accent: "#0066b8", error: "#a1260d", errorSurface: "#fff1f0" },
  syntax: { plain: "#1f1f1f", comment: { color: "#008000", fontStyle: "italic" }, keyword: "#af00db", tag: "#800000", punctuation: "#1f1f1f", definition: "#795e26", property: "#001080", static: "#267f99", string: "#a31515" },
  font: VSCODE_DARK_THEME.font,
};

export async function executeCurrentFiles(sandpack) {
  const clients = Object.values(sandpack.clients || {});
  if (sandpack.status !== "running" || clients.length === 0) return sandpack.runSandpack();
  await Promise.all(clients.map((client) => client.updateSandbox({ files: sandpack.files, template: sandpack.environment })));
}

export function normalizeFiles(language, code, files) {
  const normalized = files ? { ...files } : null;
  if (normalized && !["react", "nextjs", "javascript"].includes(language) && normalized["/index.html"]) {
    let html = normalized["/index.html"];
    if (normalized["/style.css"] && !html.includes("style.css")) html = `<link rel="stylesheet" href="/style.css">\n${html}`;
    if (normalized["/index.js"] && !html.includes("index.js")) html += `\n<script type="module" src="/index.js"></script>`;
    if (!html.includes("data-asif-hidden-scrollbars")) html += `\n<style data-asif-hidden-scrollbars>html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none;width:0;height:0}</style>`;
    normalized["/index.html"] = html;
  }
  if (normalized) return normalized;
  if (language === "react") return { "/App.jsx": code || "" };
  if (language === "typescript") return { "/index.ts": code || "" };
  if (language === "react-typescript") return { "/App.tsx": code || "" };
  if (language === "nextjs") return { "/pages/index.js": code || "" };
  if (language === "html") return { "/index.html": `${code || ""}\n<style data-asif-hidden-scrollbars>html,body{scrollbar-width:none;-ms-overflow-style:none}html::-webkit-scrollbar,body::-webkit-scrollbar,*::-webkit-scrollbar{display:none;width:0;height:0}</style>`, "/style.css": "", "/index.js": "" };
  if (language === "css") return { "/index.html": '<div class="preview">Edit the CSS</div>', "/style.css": code || "", "/index.js": "" };
  return { "/index.js": code || "" };
}
