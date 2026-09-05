/**
 * Parses the info string that follows a Markdown code fence.
 *
 * Only a standalone `play` token after the language enables the playground.
 * Examples: `javascript` is static; `javascript play` is runnable.
 */
export function parseCodeFenceMeta(value, fallbackLanguage = "javascript") {
  const tokens = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const language = tokens.shift() || fallbackLanguage;

  return {
    language,
    showPlay: tokens.some((token) => token.toLowerCase() === "play"),
  };
}
