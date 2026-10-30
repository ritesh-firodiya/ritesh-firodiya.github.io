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
import { publicArchitecture } from "../scripts/designs/public-architecture.mjs";

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

test("an architecture page publishes names and paths, and nothing else", () => {
  const published = publicArchitecture({
    summary: "private",
    verified: "2026-10-30",
    headlines: [{ label: "Known cost", value: "$8" }],
    unknowns: ["RISK: private"],
    data: [{ what: "x", where: "private" }],
    growth: { unit: "Scans", rate: 1 },
    areas: [{ id: "phone", label: "On the phone", secret: "x" }, { id: "empty", label: "Only an unused part" }],
    parts: [
      { id: "app", area: "phone", label: "App", does: "private", price: "$1", cost: { today: "$1" }, ifDown: { user: "private" } },
      { id: "api", area: "phone", label: "Api" },
      { id: "bill", area: "empty", label: "On no path", cost: { today: "$9" } },
    ],
    flows: [{ name: "Scan", cost: "$1", note: "private", steps: ["private"], path: ["app", "api"] }],
  });
  assert.deepEqual(published, {
    areas: [{ id: "phone", label: "On the phone" }],
    parts: [{ id: "app", area: "phone", label: "App" }, { id: "api", area: "phone", label: "Api" }],
    flows: [{ name: "Scan", path: ["app", "api"] }],
  });
});

test("a page with no paths publishes nothing", () => {
  assert.equal(publicArchitecture({ parts: [{ id: "a", area: "x", label: "A" }] }), null);
});
