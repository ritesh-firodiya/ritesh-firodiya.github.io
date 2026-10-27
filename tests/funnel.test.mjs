import { test } from "node:test";
import assert from "node:assert/strict";
import { funnelOf, featureName, statusOf } from "../scripts/funnel.mjs";

const ids = (f) => f.stages.map((s) => s.id);
const stage = (f, id) => f.stages.find((s) => s.id === id);

test("a mobile app waits at store review when iOS is in review and Android is with testers", () => {
  const release = {
    updated: "2026-10-27",
    surfaces: {
      play: { live: null, tracks: { production: null, beta: null, alpha: 16, internal: 16 } },
      app_store: { live: null, in_review: { version: "1.4.3", submitted: "2026-10-27" } },
    },
  };
  const f = funnelOf({ features: [{ slug: "0001-weigh-thesis-dishes", status: "planned" }], release });
  assert.deepEqual(ids(f), ["plan", "build", "testers", "review", "live"]);
  assert.equal(stage(f, "testers").items[0].detail, "build 16");
  assert.equal(stage(f, "review").items[0].detail, "1.4.3 · submitted 2026-10-27");
  assert.equal(f.waits, "review");
  assert.equal(f.asOf, "2026-10-27");
});

test("shipped features sit with the furthest build, and shelved ones leave the funnel", () => {
  const release = { surfaces: { app_store: { live: null, in_review: "2.0.1 (15)" }, play: { live: null, tracks: { alpha: 9 } } } };
  const features = [
    { slug: "0001-a", status: "shipped" },
    { slug: "0002-b", status: "shipped" },
    { slug: "0003-c", status: "shelved" },
  ];
  const f = funnelOf({ features, release });
  assert.equal(stage(f, "review").count, 3); // iOS + 2 shipped
  assert.equal(stage(f, "testers").count, 1);
  assert.equal(f.setAside.shelved, 1);
});

test("a web product is deployed, not live, and an unverified block is ignored", () => {
  const release = {
    surfaces: {
      web: { live: null, deployed: { revision: "web-00075" }, version: "0.1.0" },
      play: { live: null, verified: false, tracks: { internal: "uploaded" } },
    },
  };
  const f = funnelOf({ features: [{ slug: "0009-v1", status: "building" }], release });
  assert.deepEqual(ids(f), ["plan", "build", "deployed", "live"]);
  assert.equal(stage(f, "deployed").items[0].detail, "0.1.0");
  assert.equal(f.waits, "deployed");
});

test("no release file: only Plan and Build, and shipped work stays in Build", () => {
  const f = funnelOf({ features: [{ slug: "0025-x", status: "planned" }, { slug: "0001-y", status: "shipped" }], release: null });
  assert.deepEqual(ids(f), ["plan", "build"]);
  assert.equal(stage(f, "build").count, 1);
  assert.equal(f.waits, "build");
  assert.equal(f.asOf, null);
});

test("reads a feature's status and names it from its file", () => {
  assert.equal(statusOf("---\nid: FEAT-1\nstatus: building\n---\n## Summary"), "building");
  assert.equal(statusOf("## Summary\nstatus: building"), null);
  assert.equal(featureName("0017-holdings-from-demat-statement"), "Holdings from demat statement");
});
