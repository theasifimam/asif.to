import { rankResults } from "./rankResults.js";

let items = [];
let version = 0;
self.onmessage = async ({ data }) => {
  if (data.type === "index") {
    items = data.items;
    version++;
    return;
  }
  const current = ++version;
  const ranked = [];
  // Yield between batches so a newer query can cancel obsolete work.
  for (let offset = 0; offset < items.length && data.query.trim(); offset += 200) {
    if (current !== version) return;
    const batch = items.slice(offset, offset + 200);
    ranked.push(...rankResults(batch, data.query, { limit: batch.length }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  if (current !== version) return;
  ranked.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  self.postMessage({ id: data.id, query: data.query, matches: ranked.map(({ id, score }) => ({ id, score })) });
};
