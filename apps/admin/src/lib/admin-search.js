const ALIASES = { js: "javascript", next: "nextjs routing", mongo: "mongodb", node: "nodejs", hooks: "hook react", routing: "route router", "state hook": "usestate", "effect hook": "useeffect" };
export const SEARCH_TYPES = { all: "All", course: "Courses", chapter: "Chapters", topic: "Topics", article: "Articles", question: "Questions", cheatsheet: "Cheatsheets" };
const normalize = (value = "") => String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_$.[\]{}()=+>#-]+/g, " ").trim();
const words = (value) => normalize(value).split(" ").filter(Boolean);
function distance(a, b) { const row = Array.from({ length: b.length + 1 }, (_, index) => index); for (let i = 1; i <= a.length; i++) { let before = row[0]; row[0] = i; for (let j = 1; j <= b.length; j++) { const old = row[j]; row[j] = Math.min(row[j] + 1, row[j - 1] + 1, before + (a[i - 1] === b[j - 1] ? 0 : 1)); before = old; } } return row[b.length]; }
const matches = (needle, haystack) => haystack.includes(needle) || haystack.some((word) => needle.length > 3 && Math.abs(word.length - needle.length) <= 2 && distance(needle, word) <= (needle.length > 7 ? 2 : 1));
export function rankAdminResults(items, query, type = "all") {
  const normalized = normalize(query); if (!normalized) return [];
  const queryWords = [...new Set([...words(normalized), ...Object.entries(ALIASES).filter(([key]) => normalized.includes(key)).flatMap(([, value]) => words(value))])];
  return items.filter((item) => item.adminUrl && (type === "all" || item.type === type)).flatMap((item) => {
    const title = normalize(item.title); const titleWords = words(title); const keywords = words((item.keywords || []).join(" ")); const context = words(`${item.course || ""} ${item.category || ""} ${item.technology || ""} ${item.description || ""}`);
    let score = title === normalized ? 180 : title.startsWith(normalized) ? 120 : title.includes(normalized) ? 85 : 0; let coverage = 0;
    queryWords.forEach((word) => { if (matches(word, titleWords)) { score += 40; coverage++; } else if (matches(word, keywords)) { score += 25; coverage++; } else if (matches(word, context)) { score += 12; coverage++; } });
    return coverage ? [{ ...item, score: score * (.5 + .5 * coverage / queryWords.length) }] : [];
  }).sort((a, b) => b.score - a.score).slice(0, 40);
}
