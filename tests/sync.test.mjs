/**
 * The rules that decide what leaves a private product repo for a public host.
 * A bad edit to any of them still builds green, so each one is pinned here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assertNoSecrets } from "../scripts/designs/secrets.mjs";
import { escapeHtml, isSafeHref } from "../scripts/designs/html.mjs";
import { checkSet } from "../scripts/designs/conformance.mjs";
import { architectureRedirect, publicArchitecture } from "../scripts/designs/public-architecture.mjs";

test("a credential shape stops the publish, naming the file", () => {
  const key = `ghp_${"a".repeat(36)}`;
  assert.throws(() => assertNoSecrets(`token = "${key}"`, "set/x.js"), /set\/x\.js: looks like a GitHub token/);
});

test("a vendor's documented example key is not a secret", () => {
  assert.doesNotThrow(() => assertNoSecrets("AKIAIOSFODNN7EXAMPLE", "set/x.html"));
});

test("only links this site can honour survive", () => {
  for (const ok of ["https://example.com", "mailto:a@b.c", "#top", "/legal/"]) assert.ok(isSafeHref(ok), ok);
  for (const bad of ["//evil.com", "javascript:alert(1)", "../raw/notes.md", "data:text/html,x"]) assert.ok(!isSafeHref(bad), bad);
});

test("raw HTML in a wiki is shown as text", () => {
  assert.equal(escapeHtml('Viewing as <name> "x" & y'), "Viewing as &lt;name&gt; &quot;x&quot; &amp; y");
});

/** A minimal Babul set on disk, and a shell whose scan.mjs reports what it can see of the environment. */
function fakeSet({ boot = '"https://cdn.tailwindcss.com/3.4.17"; "https://unpkg.com/lucide@0.544.0/x.js"' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "set-"));
  const shell = mkdtempSync(join(tmpdir(), "shell-"));
  for (const d of ["assets", "web"]) mkdirSync(join(dir, d));
  writeFileSync(join(dir, "design.js"), "(window.BABUL ||= {}).product = {};");
  writeFileSync(join(dir, "tokens.js"), "(window.BABUL ||= {}).tokens = {};");
  writeFileSync(join(dir, "web", "index.html"), "<html></html>");
  writeFileSync(join(shell, "boot.js"), boot);
  writeFileSync(
    join(shell, "scan.mjs"),
    'console.log(JSON.stringify({ errors: [], components: [], pages: [{ id: "a/b", name: process.env.DESIGNS_TOKEN ?? "none", states: [] }] }));',
  );
  return { dir, shell, done: () => [dir, shell].forEach((d) => rmSync(d, { recursive: true, force: true })) };
}

test("a set's scan runs without the build's secrets", async () => {
  const set = fakeSet();
  process.env.DESIGNS_TOKEN = "must-not-leak";
  try {
    const { sizes, models } = await checkSet(set.dir, set.shell);
    assert.equal(sizes.web.pass, true, JSON.stringify(sizes.web.checks));
    assert.equal(models.web.pages[0].name, "none");
  } finally {
    delete process.env.DESIGNS_TOKEN;
    set.done();
  }
});

test("a set's own shell.js is not the gate's concern: canon's shell is published once and each set's loader is written for it", async () => {
  const set = fakeSet();
  try {
    const { sizes } = await checkSet(set.dir, set.shell);
    assert.equal(sizes.web.pass, true, JSON.stringify(sizes.web.checks));
    assert.ok(!sizes.web.checks.some((c) => c.id === "shell"));
  } finally {
    set.done();
  }
});

test("an unpinned CDN fails the gate", async () => {
  const set = fakeSet({ boot: '"https://cdn.tailwindcss.com/3.4.17"; "https://unpkg.com/lucide@latest/x.js"' });
  try {
    const { sizes } = await checkSet(set.dir, set.shell);
    assert.match(sizes.web.checks.find((c) => c.id === "pinned-cdns").detail, /lucide/);
  } finally {
    set.done();
  }
});

test("a set with no design.js does not pass the publish gate", async () => {
  const set = fakeSet();
  rmSync(join(set.dir, "design.js"));
  try {
    const { sizes } = await checkSet(set.dir, set.shell);
    assert.ok(sizes.web.checks.some((c) => c.id === "files" && !c.ok && /design\.js/.test(c.detail)));
  } finally {
    set.done();
  }
});

test("an architecture page publishes costs and failures, but no risk notes", () => {
  const published = publicArchitecture({
    summary: "A phone app.",
    verified: "2026-10-31",
    secretField: "stays private",
    headlines: [{ label: "Known cost", value: "$8" }, { label: "Biggest risk", value: "x" }],
    unknowns: ["The real bill is not read.", "RISK: open", "DESIGNS_TOKEN was pasted once", "Rate limits are in memory", "App Check is not enforced", "A test key is in the source"],
    data: [{ what: "Log", where: "On the phone" }],
    growth: { unit: "Scans", rate: 1, steps: [1] },
    areas: [{ id: "phone", label: "On the phone" }],
    parts: [
      { id: "app", area: "phone", label: "App", does: "the app", cost: { today: "$1", grows: "use", basis: "measured", source: "bill" }, ifDown: { user: "Stops.", data: "Safe", basis: "code", source: "a.ts" } },
      { id: "api", area: "phone", label: "Api", does: "holds one shared key", ifDown: { user: "One burst uses up the shared key.", basis: "code", source: "b.ts" } },
    ],
    flows: [{ name: "Scan", cost: "$1", path: ["app", "api"], steps: ["Send it.", "The token is logged."] }],
  });
  assert.equal(published.secretField, undefined);
  assert.deepEqual(published.headlines, [{ label: "Known cost", value: "$8" }]);
  assert.deepEqual(published.unknowns, ["The real bill is not read."]);
  assert.equal(published.parts[0].cost.today, "$1");
  assert.equal(published.parts[0].ifDown.user, "Stops.");
  assert.equal(published.parts[1].does, "");
  assert.equal(published.parts[1].ifDown, undefined);
  assert.deepEqual(published.flows[0].steps, ["Send it."]);
  const sourced = publicArchitecture({ parts: [{ id: "a", cost: { today: "$1", basis: "code", source: "a.ts has no key" } }], flows: [{ name: "x", path: ["a"], note: "the code goes to the log", steps: [] }] });
  assert.equal(sourced.parts[0].cost.source, undefined);
  assert.equal(sourced.flows[0].note, undefined);
});

test("a page with no parts publishes nothing", () => {
  assert.equal(publicArchitecture({ flows: [] }), null);
});

test("a design set's Architecture item forwards to the product's public page", () => {
  assert.match(architectureRedirect("babul"), /content="0; url=\/products\/babul\/architecture\/"/);
});
