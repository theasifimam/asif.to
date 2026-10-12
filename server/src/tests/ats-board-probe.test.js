import assert from "node:assert/strict";
import test from "node:test";
import { buildProbeTuples, probeAtsBoards, slugVariants } from "../services/jobs/atsBoardProbe.service.js";

const memoryState = (value = 0) => {
  const state = { value, writes: 0 };
  state.findOne = () => ({ lean: async () => ({ value: state.value }) });
  state.updateOne = async (_, update) => { state.value = update.$set.value; state.writes += 1; };
  return state;
};

const jsonResponse = (body, ok = true) => ({ ok, json: async () => body });

test("slugVariants produces compact and hyphenated board slugs", () => {
  assert.deepEqual(slugVariants("Majid Al Futtaim"), ["majidalfuttaim", "majid-al-futtaim"]);
  assert.deepEqual(slugVariants("Noon"), ["noon"]);
  assert.deepEqual(slugVariants("ab"), []);
});

test("buildProbeTuples covers every provider for every slug", () => {
  const tuples = buildProbeTuples(["Noon"]);
  assert.deepEqual(tuples.map((item) => item.provider).sort(), ["ashby", "greenhouse", "lever", "smartrecruiters", "workable"]);
});

test("probeAtsBoards returns only boards that really exist and advances the cursor", async () => {
  const state = memoryState();
  const fetchImpl = async (url) => {
    if (url.startsWith("https://api.lever.co/v0/postings/noon")) return jsonResponse([]);
    if (url.startsWith("https://api.smartrecruiters.com/v1/companies/noon")) return jsonResponse({ totalFound: 0, content: [] }); // fake-200 quirk
    return jsonResponse({}, false);
  };
  const { signals, probed, total } = await probeAtsBoards({ names: ["Noon"], fetchImpl, StateModel: state, batch: 100 });
  assert.equal(total, 5);
  assert.equal(probed, 5);
  assert.equal(signals.length, 1);
  assert.equal(signals[0].careersUrl, "https://jobs.lever.co/noon");
  assert.equal(signals[0].discoveryMethod, "ats_slug_probe");
  assert.equal(state.value, 0); // wrapped around a full pass
});

test("probeAtsBoards resumes from the stored cursor in rolling windows", async () => {
  const state = memoryState();
  const seen = [];
  const fetchImpl = async (url) => { seen.push(url); return jsonResponse({}, false); };
  await probeAtsBoards({ names: ["Noon", "Tabby"], fetchImpl, StateModel: state, batch: 4, concurrency: 1 });
  assert.equal(state.value, 4);
  await probeAtsBoards({ names: ["Noon", "Tabby"], fetchImpl, StateModel: state, batch: 4, concurrency: 1 });
  assert.equal(state.value, 8);
  assert.equal(new Set(seen).size, 8, "second window must not repeat the first");
});

test("probeAtsBoards rejects a Greenhouse board that belongs to a different company", async () => {
  const fetchImpl = async (url) => (url.includes("boards-api.greenhouse.io/v1/boards/noon") ? jsonResponse({ name: "Zebra Logistics" }) : jsonResponse({}, false));
  const { signals } = await probeAtsBoards({ names: ["Noon"], fetchImpl, StateModel: memoryState(), batch: 10 });
  assert.equal(signals.length, 0);
});

test("probeAtsBoards survives network failures", async () => {
  const fetchImpl = async () => { throw new Error("ECONNRESET"); };
  const { signals, probed } = await probeAtsBoards({ names: ["Noon"], fetchImpl, StateModel: memoryState(), batch: 10 });
  assert.equal(signals.length, 0);
  assert.equal(probed, 5);
});

test("probeAtsBoards ignores empty Workable accounts and stops hitting a rate-limited provider", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url.includes("workable")) return jsonResponse({ name: "x", jobs: [] });
    if (url.includes("greenhouse")) return { ok: false, status: 429, json: async () => ({}) };
    return jsonResponse({}, false);
  };
  const { signals } = await probeAtsBoards({ names: ["Noon", "Tabby", "Careem"], fetchImpl, StateModel: memoryState(), batch: 100, concurrency: 1 });
  assert.equal(signals.length, 0);
  assert.equal(calls.filter((url) => url.includes("greenhouse")).length, 1, "greenhouse must not be called again after a 429");
});
