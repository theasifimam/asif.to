import { SEARCH_ALIASES } from "./aliases";

export const TYPE_LABELS = { course: "Course", chapter: "Chapter", topic: "Topic", article: "Article", question: "Interview Question", cheatsheet: "Cheatsheet", practice: "Practice" };
export const FILTERS = ["all", "course", "chapter", "topic", "article", "question", "cheatsheet", "practice"];
export const FILTER_LABELS = { all: "All", course: "Courses", chapter: "Chapters", topic: "Topics", article: "Articles", question: "Questions", cheatsheet: "Cheatsheets", practice: "Practice" };

export function normalize(value = "") {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/\bnext\s*\.\s*js\b/g, "nextjs").replace(/\breact\s*\.?\s*js\b/g, "react")
    .replace(/\bnode\s*\.\s*js\b/g, "nodejs").replace(/[^a-z0-9_$.[\]{}()=+>#-]+/g, " ").trim().replace(/\s+/g, " ");
}

function tokens(value) { return normalize(value).split(" ").filter((token) => token.length > 1 || /[^a-z]/.test(token)); }
function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j++) { const old = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1)); previous = old; }
  }
  return row[b.length];
}
function tokenMatch(queryToken, fieldTokens) {
  if (fieldTokens.includes(queryToken)) return 1;
  if (fieldTokens.some((word) => word.startsWith(queryToken) || queryToken.startsWith(word))) return .82;
  if (queryToken.length >= 4 && fieldTokens.some((word) => distance(queryToken, word) <= (queryToken.length > 7 ? 2 : 1))) return .62;
  return 0;
}
function expandedQuery(query) {
  const normalized = normalize(query); const extra = [];
  for (const [alias, values] of Object.entries(SEARCH_ALIASES)) if (normalized.includes(normalize(alias))) extra.push(...values);
  return { normalized, queryTokens: [...new Set([...tokens(normalized), ...extra.flatMap(tokens)])] };
}

export function rankResults(items, query, options = {}) {
  const { normalized: q, queryTokens } = expandedQuery(query);
  if (!q) return [];
  const requestedType = normalize(options.type || "all");
  const intent = q.includes("interview") || q.includes("question") ? "question" : q.includes("practice") || q.includes("problem") ? "practice" : null;
  return items.flatMap((item) => {
    if (requestedType !== "all" && item.type !== requestedType) return [];
    const fields = {
      title: normalize(item.title), keywords: normalize((item.keywords || []).join(" ")), headings: normalize((item.headings || []).join(" ")),
      context: normalize(`${item.course || ""} ${item.category || ""} ${item.technology || ""}`), description: normalize(item.description), content: normalize(item.content),
    };
    let score = Number(item.priority || 0);
    if (fields.title === q) score += 180; else if (fields.title.startsWith(q)) score += 120; else if (fields.title.includes(q)) score += 88;
    const weights = { title: 42, keywords: 30, headings: 24, context: 19, description: 12, content: 4 };
    let matchedOriginal = 0;
    const originalTokens = tokens(q);
    for (const token of queryTokens) {
      let best = 0;
      for (const [field, weight] of Object.entries(weights)) best = Math.max(best, tokenMatch(token, tokens(fields[field])) * weight);
      score += best;
    }
    for (const token of originalTokens) if (Object.values(fields).some((field) => tokenMatch(token, tokens(field)) >= .62)) matchedOriginal++;
    if (!matchedOriginal) return [];
    score *= .45 + .55 * (matchedOriginal / Math.max(1, originalTokens.length));
    if (matchedOriginal === originalTokens.length) score += 24;
    if (intent === item.type) score += 55;
    return [{ ...item, score }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, options.limit || 100);
}

export function highlightParts(text, query) {
  const wanted = tokens(query).sort((a, b) => b.length - a.length);
  if (!wanted.length) return [{ text, match: false }];
  const expression = new RegExp(`(${wanted.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "ig");
  return String(text).split(expression).filter(Boolean).map((part) => ({ text: part, match: wanted.includes(normalize(part)) }));
}
