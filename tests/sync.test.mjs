/**
 * The rules that decide what leaves a private product repo for a public host.
 * A bad edit to any of them still builds green, so each one is pinned here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { assertNoSecrets } from "../scripts/designs/secrets.mjs";
import { escapeHtml, isSafeHref } from "../scripts/designs/html.mjs";
import { checkSurface, readRoutes } from "../scripts/designs/conformance.mjs";

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

test("routes.js cannot read the build's secrets", () => {
  process.env.DESIGNS_TOKEN = "must-not-leak";
  try {
    const r = readRoutes("window.ROUTES = { token: typeof process === 'undefined' ? null : process.env.DESIGNS_TOKEN ?? null };");
    assert.deepEqual(r, { routes: { token: null } });
  } finally {
    delete process.env.DESIGNS_TOKEN;
  }
});

test("a routes.js that throws is reported, not crashed on", () => {
  assert.match(readRoutes("throw new Error('boom')").error, /did not evaluate: .*boom/);
});

test("a set with no routes.js does not pass the publish gate", async () => {
  const dir = mkdtempSync(join(tmpdir(), "set-"));
  try {
    writeFileSync(join(dir, "index.html"), "<html></html>");
    const r = await checkSurface(dir, {});
    assert.equal(r.pass, false);
    assert.ok(r.checks.some((c) => c.id === "routes-manifest" && !c.ok));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
