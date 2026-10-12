/**
 * Smart job search helpers: autocomplete suggestions and typo correction, both
 * driven by a vocabulary built from the jobs that are live right now (cached),
 * so suggestions never point at something that returns nothing.
 */
import Job from "../../models/Job.js";
import { SKILL_CATALOG } from "./skillCatalog.js";
import { publicJobFilter } from "../../utils/jobValidation.js";

const CACHE_MS = 10 * 60_000;
// A candidate seen on fewer live jobs than this is more likely noise than the word meant.
const MIN_WORD_COUNT = 2;
const cache = { at: 0, vocab: null };

const norm = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
const words = (value) => norm(value).split(/[\s.-]+/).filter((word) => word.length > 1);

/** Damerau-Levenshtein (optimal string alignment) distance with an early exit. */
export function editDistance(a, b, max = 3) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1);
    }
  }
  return rows[a.length][b.length];
}

/** Builds a vocabulary from plain rows; separated from the DB so it can be tested. */
export function buildVocabulary(rows = []) {
  const wordCounts = new Map();
  const titles = new Map();
  const companies = new Map();
  const locations = new Map();
  const categories = new Map();
  const skills = new Map();
  const bump = (map, key, extra) => { const current = map.get(key); map.set(key, current ? { ...current, count: current.count + 1 } : { count: 1, ...extra }); };
  for (const row of rows) {
    for (const word of new Set([...words(row.title), ...words(row.companyName), ...words(row.location)])) wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    if (row.title) bump(titles, norm(row.title), { label: row.title });
    if (row.companyName) bump(companies, norm(row.companyName), { label: row.companyName, slug: row.companySlug || "" });
    if (row.location) bump(locations, norm(row.location), { label: row.location, slug: row.locationSlug || "" });
    if (row.category) bump(categories, norm(row.category), { label: row.category, slug: row.categorySlug || "" });
    for (const skill of row.skills || []) bump(skills, norm(skill), { label: skill });
  }
  for (const skill of SKILL_CATALOG) for (const word of words(skill.label)) wordCounts.set(word, (wordCounts.get(word) || 1));
  return { wordCounts, titles, companies, locations, categories, skills };
}

async function loadVocabulary(JobModel = Job) {
  if (cache.vocab && Date.now() - cache.at < CACHE_MS) return cache.vocab;
  const rows = await JobModel.find(publicJobFilter()).select("title companyName location locationSlug category categorySlug skills company").populate("company", "slug").lean();
  cache.vocab = buildVocabulary(rows.map((row) => ({ ...row, companySlug: row.company?.slug })));
  cache.at = Date.now();
  return cache.vocab;
}

export const _resetSearchCache = () => { cache.at = 0; cache.vocab = null; };

const matchScore = (query, label) => {
  const text = norm(label);
  if (text === query) return 100;
  if (text.startsWith(query)) return 80;
  if (words(label).some((word) => word.startsWith(query))) return 60;
  if (text.includes(query)) return 40;
  return 0;
};

/** Nearest known word within a small edit distance (closer and more common wins). */
function nearestWord(token, wordCounts, minCount = 1) {
  // Short words are too easy to "correct" into a different real word (node -> code), so skip them.
  const limit = token.length >= 9 ? 2 : token.length >= 5 ? 1 : 0;
  if (!limit) return null;
  let best = null;
  for (const [word, count] of wordCounts) {
    if (Math.abs(word.length - token.length) > limit || count < minCount) continue;
    const distance = editDistance(token, word, limit);
    if (distance > limit) continue;
    if (!best || distance < best.distance || (distance === best.distance && count > best.count)) best = { word, distance, count };
  }
  return best?.word || null;
}

/**
 * Suggestions for what the user is typing. Typos get "did you mean" style matches.
 * @returns {Array<{type: string, label: string, value: string, slug?: string, count: number}>}
 */
export function suggestFromVocabulary(rawQuery, vocab, { limit = 8 } = {}) {
  const query = norm(rawQuery);
  if (query.length < 2) return [];
  const groups = [["skill", vocab.skills], ["title", vocab.titles], ["company", vocab.companies], ["category", vocab.categories], ["location", vocab.locations]];
  const run = (needle) => {
    const found = [];
    for (const [type, map] of groups) {
      for (const [key, item] of map) {
        const score = matchScore(needle, key);
        if (score) found.push({ type, label: item.label, value: item.label, slug: item.slug, count: item.count, score: score + Math.min(item.count, 50) / 10 + (type === "skill" ? 5 : 0) });
      }
    }
    return found;
  };
  let found = run(query);
  if (!found.length) {
    const corrected = query.split(" ").map((token) => (vocab.wordCounts.has(token) ? token : nearestWord(token, vocab.wordCounts) || token)).join(" ");
    if (corrected !== query) found = run(corrected);
  }
  const seen = new Set();
  return found
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .filter((item) => { const key = `${item.type}:${norm(item.label)}`; if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, limit)
    .map(({ score: _score, ...item }) => item);
}

/** Corrects unknown words in a keyword search ("developr" -> "developer"), or returns null. */
export function correctKeywordFromVocabulary(keyword, vocab) {
  const tokens = norm(keyword).split(" ").filter(Boolean);
  let changed = false;
  const fixed = tokens.map((token) => {
    if (vocab.wordCounts.has(token) || token.length < 5) return token;
    const near = nearestWord(token, vocab.wordCounts, MIN_WORD_COUNT);
    if (near) changed = true;
    return near || token;
  });
  return changed ? fixed.join(" ") : null;
}

export async function suggestJobs(query, options = {}) {
  return suggestFromVocabulary(query, await loadVocabulary(options.JobModel), options);
}

export async function correctKeyword(keyword, options = {}) {
  return correctKeywordFromVocabulary(keyword, await loadVocabulary(options.JobModel));
}
