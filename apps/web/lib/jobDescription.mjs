export function safeJobDescription(value = "") {
  let html = String(value);
  for (let i = 0; i < 3; i++) {
    const decoded = html.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#(?:39|x27);/gi, "'").replace(/&nbsp;/g, " ");
    if (decoded === html) break;
    html = decoded;
  }
  const allowed = new Set(["p", "br", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "u", "div", "span"]);
  return html.replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|form|iframe|object|embed|svg|math)[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name) => allowed.has(name.toLowerCase()) ? `${tag.startsWith("</") ? "</" : "<"}${name.toLowerCase()}>` : "");
}
