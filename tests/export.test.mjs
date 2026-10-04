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

/**
 * The design sets scripts/sync-designs.mjs pulls from the private app repos.
 * They are published HTML but they are not pages OF this site: no Next
 * metadata, no canonical, deliberately out of the sitemap. Everything that
 * asks "is this page correct" has to skip them; the unreferenced-asset check
 * still reads them, because that is where their own assets are referenced.
 */
const isSyncedDesign = (routeOrPath) =>
  routeOrPath.startsWith("/designs/") || /^\/products\/[^/]+\/designs\//.test(routeOrPath);

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
        const route = rel === "" ? "/" : `/${rel}/`;
        if (isSyncedDesign(route)) continue;
        found.push({ route, file: p, html: readFileSync(p, "utf8") });
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

/* A forwarding address: an old URL that now points somewhere else. It is a
   meta refresh, not a page — noindex, no canonical, not in the sitemap. */
const forwardOf = (html) => html.match(/<meta http-equiv="refresh" content="0; url=([^"]+)"/)?.[1] ?? null;
const FORWARDS = {
  "/work/": "/#work", "/products/": "/#work", "/process/": "/#process", "/design/gallery/": "/#process",
  "/about/": "/resume/", "/contact/": "/resume/", "/hire/": "/resume/",
  "/work/chitragupt/": "/products/chitragupt/",
  "/products/dwarseva-property/": "/products/seedha-ghar/",
};

test("out/ actually contains the site", () => {
  const routes = pages().map((p) => p.route);
  for (const r of ["/", "/resume/", "/legal/", "/support/"]) {
    assert.ok(routes.includes(r), `${r} was not exported`);
  }
  assert.ok(routes.filter((r) => /^\/products\/[^/]+\/$/.test(r)).length >= 10,
    "the product pages did not export");
});

test("every old address still forwards, to a page that exists", () => {
  const byRoute = new Map(pages().map((p) => [p.route, p.html]));
  for (const [from, to] of Object.entries(FORWARDS)) {
    assert.ok(byRoute.has(from), `${from} is gone — store listings and old links still point at it`);
    assert.equal(forwardOf(byRoute.get(from)), to, `${from} does not forward to ${to}`);
    const [page, anchor] = to.split("#");
    assert.ok(byRoute.has(page), `${from} forwards to ${to}, which was not exported`);
    if (anchor) assert.ok(byRoute.get(page).includes(`id="${anchor}"`), `${from} forwards to ${to}, and ${page} has no #${anchor}`);
  }
});

test("the wikis exported, one page per wiki page", () => {
  const index = JSON.parse(readFileSync(join(root, "src/data/generated/wiki.json"), "utf8")).wiki;
  const routes = new Set(pages().map((p) => p.route));
  for (const [slug, w] of Object.entries(index)) {
    assert.ok(routes.has(`/products/${slug}/wiki/`), `the ${slug} wiki index did not export`);
    const n = [...routes].filter((r) => r.startsWith(`/products/${slug}/wiki/`) && r !== `/products/${slug}/wiki/`).length;
    assert.equal(n, w.total, `${slug}: ${w.total} wiki pages were synced and ${n} exported`);
  }
});

test("every published design set ships its notes pages, and its bar points at them", () => {
  // The bar's notes button fetches Markdown. It answered 404 on every screen
  // of every set until the wiki pages were published beside the designs.
  const designs = JSON.parse(readFileSync(join(root, "src/data/generated/designs.json"), "utf8"));
  for (const [slug, set] of Object.entries(designs.sets)) {
    const notes = join(out, "designs", slug, "wiki", "surfaces");
    assert.ok(existsSync(notes) && readdirSync(notes).some((f) => f.endsWith(".md")), `${slug}: no notes pages at /designs/${slug}/wiki/surfaces/`);
    for (const surface of new Set(set.screens.map((s) => s.surface))) {
      const chrome = readFileSync(join(out, "designs", slug, surface, "_chrome.js"), "utf8");
      assert.ok(chrome.includes('"../wiki/surfaces/"'), `${slug}/${surface}: _chrome.js still points two levels up`);
    }
  }
});

test("every picture a page shows is a file that shipped", () => {
  const missing = new Set();
  for (const { route, html } of pages()) {
    for (const m of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
      if (!existsSync(join(out, decodeURIComponent(m[1])))) missing.add(`${route} → ${m[1]}`);
    }
    for (const m of html.matchAll(/<iframe[^>]+src="(\/[^"?]+)/g)) {
      if (!existsSync(join(out, decodeURIComponent(m[1])))) missing.add(`${route} → ${m[1]}`);
    }
  }
  assert.deepEqual([...missing], [], `these pictures are referenced and missing:\n  ${[...missing].join("\n  ")}`);
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

test("the short links and the forwarding addresses are noindex, and nothing else is", () => {
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route)) continue;
    const shouldHide = route.startsWith("/go/") || route in FORWARDS;
    assert.equal(isNoindex(html), shouldHide, `${route}: noindex=${isNoindex(html)}, expected ${shouldHide}`);
  }
});

test("every page has a title and a description", () => {
  for (const { route, html } of pages()) {
    if (NOT_A_PAGE(route)) continue;
    assert.match(html, /<title>[^<]+<\/title>/, `${route} has no title`);
    if (isNoindex(html)) continue; // a description buys nothing on a page search never shows
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
  // Every HTML and JS file in the export, including the synced design sets —
  // a vendored bundle is referenced from a design page, not from a site page.
  const corpus = [];
  const collect = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const f = join(dir, e.name);
      if (e.isDirectory()) { collect(f); continue; }
      if (/\.(html|js|css|xml)$/.test(e.name)) corpus.push(readFileSync(f, "utf8"));
    }
  };
  collect(out);
  const html = corpus.join("\n");
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
      // Matched on basename, not on the absolute path: the synced design sets
      // reference their own assets relatively ("routes.js", "../../_vendor/x.js"),
      // so an absolute-href search reports every one of them as an orphan. A
      // basename is a weaker match but still catches the case this exists for —
      // a file nothing anywhere mentions, like the 604KB sample.png.
      const href = "/" + relative(out, p).split("\\").join("/");
      if (!html.includes(e.name)) offenders.push(`${href} (${Math.round(statSync(p).size / 1024)}KB)`);
    }
  };
  walk(out);
  assert.deepEqual(offenders, [], `these ship but no page references them:\n  ${offenders.join("\n  ")}`);
});
