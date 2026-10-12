const DAY_MS = 86_400_000;

/**
 * Re-orders a newest-first list so one employer cannot fill a whole page.
 * Rows stay grouped by posting day (so "newest" still means newest), and within a
 * day the companies take turns in round-robin order, each company's own jobs
 * keeping their recency order.
 *
 * @param {Array<{_id: any, company: any, postedAt: Date|string}>} rows newest first
 * @returns {Array} the same rows, interleaved
 */
export function diversifyByCompany(rows = []) {
  const result = [];
  let index = 0;
  while (index < rows.length) {
    const day = Math.floor(new Date(rows[index].postedAt).getTime() / DAY_MS);
    const queues = new Map();
    while (index < rows.length && Math.floor(new Date(rows[index].postedAt).getTime() / DAY_MS) === day) {
      const key = String(rows[index].company ?? rows[index]._id);
      if (!queues.has(key)) queues.set(key, []);
      queues.get(key).push(rows[index]);
      index += 1;
    }
    const lists = [...queues.values()];
    for (let round = 0; lists.some((list) => round < list.length); round += 1) {
      for (const list of lists) if (round < list.length) result.push(list[round]);
    }
  }
  return result;
}
