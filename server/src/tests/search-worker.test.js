import assert from "node:assert/strict";
import test from "node:test";
import { Worker } from "node:worker_threads";
import { once } from "node:events";
import { rankResults } from "../../../apps/web/lib/search/rankResults.js";
import { rankAdminResults } from "../../../apps/admin/src/lib/admin-search.js";

for (const [name, path, rank] of [
  ["web", "../../../apps/web/lib/search/search.worker.js", (items, query) => rankResults(items, query, { limit: items.length })],
  ["admin", "../../../apps/admin/src/lib/search.worker.js", rankAdminResults],
]) {
  test(`${name} background search preserves ranking and cancels superseded queries`, async (t) => {
    const url = new URL(path, import.meta.url).href;
    const worker = new Worker(`
      const { parentPort, workerData } = require("node:worker_threads");
      globalThis.self = { postMessage: (data) => parentPort.postMessage(data) };
      import(workerData).then(() => {
        parentPort.on("message", (data) => self.onmessage({ data }));
        parentPort.postMessage({ ready: true });
      });
    `, { eval: true, workerData: url });
    t.after(() => worker.terminate());
    await once(worker, "message");
    const items = Array.from({ length: 1200 }, (_, i) => ({
      id: `item:${i}`, title: i % 2 ? "React Developer" : "Ada Lovelace", type: i % 2 ? "job" : "user",
      keywords: ["react", `ada_${i}`], description: "Build applications and learn JavaScript", adminUrl: `/users/${i}`,
    }));
    worker.postMessage({ type: "index", items });
    const next = once(worker, "message");
    worker.postMessage({ type: "query", query: "react", id: 1 });
    worker.postMessage({ type: "query", query: "Ada", id: 2 });
    const [result] = await next;
    assert.equal(result.id, 2);
    assert.deepEqual(result.matches, rank(items, "Ada").map(({ id, score }) => ({ id, score })));
    const cleared = once(worker, "message");
    worker.postMessage({ type: "query", query: "", id: 3 });
    assert.deepEqual((await cleared)[0].matches, []);

    const replaced = once(worker, "message");
    worker.postMessage({ type: "query", query: "react", id: 4 });
    worker.postMessage({ type: "index", items: [items[0]] });
    worker.postMessage({ type: "query", query: "Ada", id: 5 });
    assert.deepEqual((await replaced)[0].matches.map(item => item.id), [items[0].id]);
  });
}
