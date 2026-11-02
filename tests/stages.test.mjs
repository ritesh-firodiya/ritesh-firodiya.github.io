import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PIPELINE, stageMap, shipStatus, statusOf } from "../scripts/stages.mjs";

const ids = (m) => m.nodes.map((n) => n.id);
const node = (m, id) => m.nodes.find((n) => n.id === id);
const ALL = ["problem", "idea", "research", "plan", "feature", "design", "code", "review", "release", "live", "marketing", "result"].map((id) => ({ id }));

test("a status is read from the frontmatter", () => {
  assert.equal(statusOf("---\nid: PROB-1\nstatus: solving\n---\n# x"), "solving");
  assert.equal(statusOf("# no frontmatter"), null);
});

test("forks: idea to three, plan to two, release by surface, live to two", () => {
  const release = { surfaces: { play: { live: "1.4.4" }, app_store: { live: null, in_review: { version: "1.4.4" } } } };
  const m = stageMap({ pipeline: ALL, release, started: { video: true } });
  for (const id of ["experiment", "research", "dropped", "feature", "bug", "surface-play", "surface-app_store", "marketing", "result", "video"]) assert.ok(node(m, id), id);
  assert.equal(node(m, "dropped").branch, true);
  assert.equal(node(m, "research").branch, false);
  // Dropped is a dead end: nothing leaves it. Edges: from problem on, count them.
  assert.equal(m.lines.filter((l) => l.d.includes("C")).length > 15, true);
  assert.equal(m.label.text, "design is optional");
});

test("Live opens only when a surface is live, whatever else exists", () => {
  const off = stageMap({ pipeline: ALL, release: { surfaces: { web: { live: null, deployed: { revision: "r" }, version: "0.1.0" } } } });
  assert.equal(node(off, "live").off, true);
  assert.equal(node(off, "surface-web").what, "deployed, not launched · 0.1.0");
  const on = stageMap({ pipeline: ALL, release: { surfaces: { play: { live: "1.4.4" } } } });
  assert.equal(node(on, "live").off, false);
  assert.equal(node(on, "surface-play").what, "live · 1.4.4");
});

test("counts carry the status breakdown, and one record reads in the singular", () => {
  const m = stageMap({ pipeline: ALL, records: { problems: ["solving", "solving", "open"], ideas: ["accepted", "dropped"], experiments: ["done"] } });
  assert.equal(node(m, "problem").n, 3);
  assert.deepEqual(node(m, "problem").counts, [{ count: 2, status: "being solved" }, { count: 1, status: "open" }]);
  assert.equal(node(m, "experiment").unit, "experiment");
  assert.equal(node(m, "dropped").n, 1);
  assert.equal(node(m, "feature").n, undefined);
  assert.equal(node(m, "feature").off, true);
});

test("a design-only pipeline has no code stage, no bug, one row", () => {
  const m = stageMap({ pipeline: ["problem", "idea", "research", "plan", "design", "marketing"].map((id) => ({ id })) });
  assert.deepEqual(ids(m), ["problem", "idea", "research", "experiment", "dropped", "plan", "design", "marketing"]);
  assert.equal(m.height, 450);
  assert.equal(m.label, null);
});

test("an unverified surface is ignored", () => {
  const m = stageMap({ pipeline: ALL, release: { surfaces: { play: { verified: false, live: "1" } } } });
  assert.equal(node(m, "surface-play"), undefined);
});

test("the canon page's default map draws every stage as started, with the gates", () => {
  const m = stageMap({ pipeline: DEFAULT_PIPELINE, all: true });
  assert.ok(m.nodes.every((n) => !n.off));
  assert.deepEqual(m.nodes.filter((n) => n.gate).map((n) => n.id), ["plan", "design", "review"]);
});

test("the status lines name surfaces and what is next", () => {
  const s = shipStatus({ surfaces: { play: { live: "1.4.4" } } }, ["planned", "planned", "shipped"]);
  assert.deepEqual(s, { surfaces: [{ name: "Android", what: "live · 1.4.4" }], next: ["2 planned"], anyLive: true });
});
