import { test } from "node:test";
import assert from "node:assert/strict";
import { flowOf } from "../scripts/flow.mjs";

const STORE = ["idea", "code", "release", "live"];
const file = (counts, medianHours = {}, ids = STORE) => ({
  updated: "2026-10-27",
  since: "2026-09-26",
  stages: ids.map((id, i) => ({ id, count: counts[i] })),
  medianHours,
});

test("names the slowest step by median wait and the biggest drop by share", () => {
  const f = flowOf(file([61, 39, 19, 0], { "idea→code": 1.6, "code→release": 191.6 }));
  assert.deepEqual(f.hops.map((h) => h.share), [64, 49, 0]);
  assert.equal(f.slowest, "release");
  assert.equal(f.drop, "live");
  assert.equal(f.asOf, "2026-10-27");
  assert.equal(f.since, "2026-09-26");
});

test("a step after an empty stage has no share, and is never the drop", () => {
  const f = flowOf(file([131, 61, 0, 0], { "idea→code": 0.8, "code→release": null }));
  assert.equal(f.hops[2].share, null);
  assert.equal(f.drop, "release");
  assert.equal(f.slowest, "code");
});

test("a product's own stages are kept in its order", () => {
  const ids = ["idea", "research", "plan", "design"];
  assert.deepEqual(flowOf(file([18, 16, 12, 10], {}, ids)).stages.map((s) => s.id), ids);
});

test("refuses a file whose stages are unknown, too few or out of order", () => {
  assert.throws(() => flowOf({ stages: [{ id: "idea", count: 1 }] }), /in that order/);
  assert.throws(() => flowOf(file([3, 2], {}, ["code", "idea"])), /in that order/);
  assert.throws(() => flowOf(file([3, 2], {}, ["idea", "ship"])), /in that order/);
  assert.throws(() => flowOf(file([1, 2.5, 0, 0])), /whole number/);
});
