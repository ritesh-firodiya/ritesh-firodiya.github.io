/**
 * Assertions about the exported HTML in out/, not about the source.
 *
 * Metadata in Next is inherited, so a page can be correct in isolation and
 * wrong once it is built — which is exactly what happened: the root layout
 * declared `alternates: { canonical: "/" }`, every page that did not override
 * it inherited that, and 35 of 40 exported pages told search engines they were
 * duplicates of the homepage. No source-level test could have caught it. This
 * reads what actually shipped.
 *
 * Run after `pnpm build`.
 */
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "out");
const BASE = "https://ritesh-firodiya.github.io";

before(() => {
  assert.ok(existsSync(out), "out/ does not exist — run `pnpm build` first");
});

/** Every index.html in out/, as { route, html }. */
function pages() {
  const found = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "_next") continue;
        walk(p);
      } else if (e.name === "index.html") {
        const rel = relative(out, dir).split("\\").join("/");
        found.push({ route: rel === "" ? "/" : `/${rel}/`, file: p, html: readFileSync(p, "utf8") });
      }
    }
  };
  walk(out);
  return found;
}

const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1] ?? null;
const isNoindex = (html) => /<meta name="robots" content="[^"]*noindex/.test(html);

/* Next writes the 404 to both out/404.html and out/404/index.html, and
   _not-found is the internal route that produces them. None is a real URL. */
const NOT_A_PAGE = (route) => route === "/404/" || route === "/_not-found/";

test("out/ actually contains the site", () => {
  const routes = pages().map((p) => p.route);
  for (const r of ["/", "/products/", "/work/", "/about/", "/contact/", "/hire/", "/legal/", "/support/", "/resume/"]) {
    assert.ok(routes.includes(r), `${r} was not exported`);
  }
  assert.ok(routes.filter((r) => r.startsWith("/products/") && r !== "/products/").length >= 10,
    "the product pages did not export");
});

test("every indexable page declares its own canonical", () => {
  const wrong = [];
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route) || isNoindex(html)) continue;
    const want = `${BASE}${route}`;
    const got = canonicalOf(html);
    if (got !== want) wrong.push(`${route} → ${got ?? "(none)"}`);
  }
  assert.deepEqual(wrong, [], `these pages declare the wrong canonical:\n  ${wrong.join("\n  ")}`);
});

test("no page other than the homepage claims to be the homepage", () => {
  const impostors = pages()
    .filter(({ route, html }) => route !== "/" && !NOT_A_PAGE(route) && canonicalOf(html) === `${BASE}/`)
    .map((p) => p.route);
  assert.deepEqual(impostors, [],
    `an inherited canonical is a duplicate-content claim. These pages point at the homepage:\n  ${impostors.join("\n  ")}`);
});

test("a noindex page does not also declare a canonical", () => {
  for (const { route, html } of pages()) {
    if (!isNoindex(html)) continue;
    assert.equal(canonicalOf(html), null,
      `${route} is noindex and also canonical — the two instructions contradict each other`);
  }
});

test("the short links are noindex, and nothing else is", () => {
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route)) continue;
    const shouldHide = route.startsWith("/go/");
    assert.equal(isNoindex(html), shouldHide, `${route}: noindex=${isNoindex(html)}, expected ${shouldHide}`);
  }
});

test("every page has a title and a description", () => {
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route)) continue;
    assert.match(html, /<title>[^<]+<\/title>/, `${route} has no title`);
    if (route.startsWith("/go/")) continue; // noindex; a description buys nothing
    assert.match(html, /<meta name="description" content="[^"]+"/, `${route} has no description`);
  }
});

/* ── things that are revenue or compliance, not SEO ─────────────────────── */

test("app-ads.txt survived the export with a publisher id", () => {
  const f = join(out, "app-ads.txt");
  assert.ok(existsSync(f), "out/app-ads.txt is missing — AdMob silently marks the inventory unauthorised");
  assert.match(readFileSync(f, "utf8"), /pub-\d+/, "app-ads.txt has no publisher id");
});

test("every legal document exported", () => {
  const products = JSON.parse(readFileSync(join(root, "src/data/products.json"), "utf8")).products;
  for (const p of products) {
    for (const kind of ["privacy", "delete"]) {
      const href = p.legal[kind];
      if (!href || href.startsWith("http")) continue;
      assert.ok(existsSync(join(out, href)), `${p.slug}.legal.${kind} (${href}) did not export`);
    }
  }
});

test("the sitemap lists every indexable page and nothing else", () => {
  const xml = readFileSync(join(out, "sitemap.xml"), "utf8");
  const listed = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route)) continue;
    const url = `${BASE}${route}`;
    if (isNoindex(html)) {
      assert.ok(!listed.has(url), `${route} is noindex but is in the sitemap`);
    } else {
      assert.ok(listed.has(url), `${route} is indexable but missing from the sitemap`);
    }
  }
});

test("nothing large enough to notice ships unreferenced", () => {
  // 604KB of unreferenced PNG shipped on every deploy for months. Anything
  // over this that no exported page mentions is almost certainly the same
  // mistake again.
  const LIMIT = 100 * 1024;
  const html = pages().map((p) => p.html).join("\n") +
    readFileSync(join(out, "sitemap.xml"), "utf8");
  const offenders = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === "_next") continue;
        walk(p);
        continue;
      }
      if (/\.(html|txt|xml|ico|pdf|json|webmanifest)$/.test(e.name)) continue;
      if (statSync(p).size < LIMIT) continue;
      const href = "/" + relative(out, p).split("\\").join("/");
      if (!html.includes(href)) offenders.push(`${href} (${Math.round(statSync(p).size / 1024)}KB)`);
    }
  };
  walk(out);
  assert.deepEqual(offenders, [], `these ship but no page references them:\n  ${offenders.join("\n  ")}`);
});
