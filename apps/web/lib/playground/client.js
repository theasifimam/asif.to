export const PLAYGROUND_PREFIX = "asifto-playground";
export const RECENT_PRACTICE_KEY = "asifto-practice:recent";

export function storageKey(playgroundId, language, fileName) {
  return `${PLAYGROUND_PREFIX}:${playgroundId || "scratch"}:${language}:${fileName}`;
}

export function explainError(message = "") {
  const source = String(message);
  const location = source.match(/(?:\(|\s|^)([^\s():]+\.[a-z]+):(\d+):(\d+)/i);
  const rules = [
    [/ReferenceError:\s*([^\s]+) is not defined/i, (m) => ({ explanation: `You are trying to use \`${m[1]}\`, but no variable with that name exists in the current scope.`, reason: "The name may be misspelled, declared in another scope, or used before it was declared.", suggestion: `Declare \`${m[1]}\` before using it or check that the variable name is correct.` })],
    [/SyntaxError:\s*Unexpected token/i, () => ({ explanation: "The parser found code where it did not expect it.", reason: "A bracket, quote, comma, or other piece of syntax is probably missing or misplaced.", suggestion: "Check the indicated line and the line immediately before it for unbalanced punctuation." })],
    [/TypeError:\s*([^\n]+)/i, () => ({ explanation: "An operation was attempted on a value that does not support it.", reason: "The value may be undefined, null, or a different type than expected.", suggestion: "Inspect the value before this line and guard it or correct how it is created." })],
    [/Cannot find module|Module not found|Could not resolve/i, () => ({ explanation: "The sandbox could not resolve an imported dependency or file.", reason: "The package is unavailable here, or the import path/file name does not match.", suggestion: "Use a dependency supported by this playground or correct the local import path." })],
  ];
  const match = rules.map(([pattern, build]) => [source.match(pattern), build]).find(([m]) => m);
  const detail = match ? match[1](match[0]) : { explanation: "The compiler or runtime could not complete this operation.", reason: "The message above contains the exact diagnostic from the sandbox.", suggestion: "Start at the first reported line, check nearby values and syntax, then run again." };
  return { original: source, file: location?.[1], line: location ? Number(location[2]) : undefined, column: location ? Number(location[3]) : undefined, ...detail };
}

export function unsupportedFeedback(files) {
  const code = Object.values(files || {}).map((file) => file.code || "").join("\n");
  if (/\b(?:fs|node:fs|child_process|node:child_process)\b/.test(code)) return "Node.js filesystem and process APIs are not available in this browser sandbox.";
  if (/\b(?:getServerSideProps|getStaticProps|use server)\b|next\/headers|next\/server/.test(code)) return "This Next.js server feature requires a server runtime and cannot run inside this browser sandbox.";
  if (/process\.env\.[A-Z_]+/.test(code)) return "Private server environment variables are not available to browser playground code.";
  return "";
}

export async function formatSource(source, fileName = "") {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const parser = { js: "babel", jsx: "babel", ts: "typescript", tsx: "typescript", html: "html", htm: "html", css: "css" }[extension];
  if (!parser) return `${String(source).replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim()}\n`;
  const { format } = await import("prettier/standalone");
  let plugins;
  if (parser === "babel") {
    const [babel, estree] = await Promise.all([import("prettier/plugins/babel"), import("prettier/plugins/estree")]);
    plugins = [babel.default, estree.default];
  } else if (parser === "typescript") {
    const [typescript, estree] = await Promise.all([import("prettier/plugins/typescript"), import("prettier/plugins/estree")]);
    plugins = [typescript.default, estree.default];
  } else if (parser === "html") {
    const html = await import("prettier/plugins/html"); plugins = [html.default];
  } else {
    const postcss = await import("prettier/plugins/postcss"); plugins = [postcss.default];
  }
  return format(String(source), {
    parser,
    plugins,
    tabWidth: 2,
    semi: true,
    singleQuote: false,
  });
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function encodeShareState(state) {
  const bytes = new TextEncoder().encode(JSON.stringify(state));
  if (typeof CompressionStream !== "undefined") {
    const compressed = await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
    return `g.${bytesToBase64(new Uint8Array(compressed))}`;
  }
  return `j.${bytesToBase64(bytes)}`;
}

export async function decodeShareState(value) {
  if (!value) return null;
  const [mode, encoded] = value.split(".", 2);
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const raw = mode === "g" && typeof DecompressionStream !== "undefined"
    ? await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
    : bytes;
  return JSON.parse(new TextDecoder().decode(raw));
}
