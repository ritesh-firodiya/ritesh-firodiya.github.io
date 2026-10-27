import { test } from "node:test";
import assert from "node:assert/strict";
import { flowOf } from "../scripts/flow.mjs";

const file = (counts, medianHours = {}) => ({
  updated: "2026-10-27",
  stages: ["asked", "committed", "released", "live"].map((id, i) => ({ id, count: counts[i] })),
  medianHours,
});

test("names the slowest step by median wait and the biggest drop by share", () => {
  const f = flowOf(file([61, 39, 19, 0], { "asked→committed": 1.6, "committed→released": 191.6 }));
  assert.deepEqual(f.hops.map((h) => h.share), [64, 49, 0]);
  assert.equal(f.slowest, "released");
  assert.equal(f.drop, "live");
  assert.equal(f.asOf, "2026-10-27");
});

test("a step after an empty stage has no share, and is never the drop", () => {
  const f = flowOf(file([131, 61, 0, 0], { "asked→committed": 0.8, "committed→released": null }));
  assert.equal(f.hops[2].share, null);
  assert.equal(f.drop, "released");
  assert.equal(f.slowest, "committed");
});

test("refuses a file whose stages are missing or out of order", () => {
  assert.throws(() => flowOf({ stages: [{ id: "asked", count: 1 }] }), /in order/);
  assert.throws(() => flowOf(file([1, 2.5, 0, 0])), /whole number/);
});
