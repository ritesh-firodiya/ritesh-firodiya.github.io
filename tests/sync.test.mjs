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
import { checkSet, shellOf } from "../scripts/designs/conformance.mjs";

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

/** A minimal Babul set on disk whose scan.mjs reports what it can see of the environment. */
function fakeSet({ boot = '"https://cdn.tailwindcss.com/3.4.17"; "https://unpkg.com/lucide@0.544.0/x.js"' } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "set-"));
  for (const d of ["_shell", "assets", "web"]) mkdirSync(join(dir, d));
  writeFileSync(join(dir, "babul.js"), "(window.BABUL ||= {}).product = {};");
  writeFileSync(join(dir, "tokens.js"), "(window.BABUL ||= {}).tokens = {};");
  writeFileSync(join(dir, "web", "index.html"), "<html></html>");
  writeFileSync(join(dir, "_shell", "boot.js"), boot);
  writeFileSync(
    join(dir, "_shell", "scan.mjs"),
    'console.log(JSON.stringify({ errors: [], components: [], pages: [{ id: "a/b", name: process.env.DESIGNS_TOKEN ?? "none", states: [] }] }));',
  );
  return dir;
}

test("a set's scan runs without the build's secrets", async () => {
  const dir = fakeSet();
  process.env.DESIGNS_TOKEN = "must-not-leak";
  try {
    const { sizes, models } = await checkSet(dir, await shellOf(dir));
    assert.equal(sizes.web.pass, true, JSON.stringify(sizes.web.checks));
    assert.equal(models.web.pages[0].name, "none");
  } finally {
    delete process.env.DESIGNS_TOKEN;
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a set whose shell drifted is withheld and its code is never run", async () => {
  const dir = fakeSet();
  try {
    const canonical = new Map(await shellOf(dir));
    canonical.set("boot.js", Buffer.from("// the canonical copy"));
    const { sizes, models } = await checkSet(dir, canonical);
    assert.equal(sizes.web.pass, false);
    assert.ok(sizes.web.checks.some((c) => c.id === "shell" && !c.ok));
    assert.match(sizes.web.checks.find((c) => c.id === "scan").detail, /not run/);
    assert.deepEqual(models, {});
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an unpinned CDN fails the gate", async () => {
  const dir = fakeSet({ boot: '"https://cdn.tailwindcss.com/3.4.17"; "https://unpkg.com/lucide@latest/x.js"' });
  try {
    const { sizes } = await checkSet(dir, await shellOf(dir));
    assert.match(sizes.web.checks.find((c) => c.id === "pinned-cdns").detail, /lucide/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a set with no babul.js does not pass the publish gate", async () => {
  const dir = fakeSet();
  rmSync(join(dir, "babul.js"));
  try {
    const { sizes } = await checkSet(dir, await shellOf(dir));
    assert.ok(sizes.web.checks.some((c) => c.id === "files" && !c.ok && /babul\.js/.test(c.detail)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
