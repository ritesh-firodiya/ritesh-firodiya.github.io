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

const LOADER = 'var SHELL = "https://cdn.jsdelivr.net/npm/@freetesh/canon@0.20.0/shell/";';

/** A minimal Babul set on disk, and a shell whose scan.mjs reports what it can see of the environment. */
function fakeSet({ boot = '"https://cdn.tailwindcss.com/3.4.17"; "https://unpkg.com/lucide@0.544.0/x.js"', loader = LOADER } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "set-"));
  const shell = mkdtempSync(join(tmpdir(), "shell-"));
  for (const d of ["assets", "web"]) mkdirSync(join(dir, d));
  writeFileSync(join(dir, "babul.js"), "(window.BABUL ||= {}).product = {};");
  writeFileSync(join(dir, "tokens.js"), "(window.BABUL ||= {}).tokens = {};");
  writeFileSync(join(dir, "shell.js"), loader);
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

test("a set that does not load canon's shell is withheld and never scanned", async () => {
  const set = fakeSet({ loader: "document.write('<script src=x.js></script>')" });
  try {
    const { sizes, models } = await checkSet(set.dir, set.shell);
    assert.equal(sizes.web.pass, false);
    assert.ok(sizes.web.checks.some((c) => c.id === "shell" && !c.ok));
    assert.match(sizes.web.checks.find((c) => c.id === "scan").detail, /not run/);
    assert.deepEqual(models, {});
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

test("a set with no babul.js does not pass the publish gate", async () => {
  const set = fakeSet();
  rmSync(join(set.dir, "babul.js"));
  try {
    const { sizes } = await checkSet(set.dir, set.shell);
    assert.ok(sizes.web.checks.some((c) => c.id === "files" && !c.ok && /babul\.js/.test(c.detail)));
  } finally {
    set.done();
  }
});
