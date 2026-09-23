#!/usr/bin/env node
/**
 * Pull the real design screens out of the (private) app repos into
 * public/designs/, so the site shows the actual wireframes instead of essays
 * about them.
 *
 * NOTHING THIS WRITES IS COMMITTED. public/designs/ and public/products/ are
 * gitignored: a public repo does not store private work, and a copy that has
 * to be refreshed by hand is a copy that is wrong. scripts/designs/sources.mjs
 * decides where each set comes from — a sparse clone of the private repo in
 * CI, the working copy under ~/git/products locally.
 *
 * Each design set is plain HTML that loads Tailwind from a CDN, lucide from
 * unpkg, and its own shared.css / tailwind.config.js by relative path. So:
 *
 *  - the folder shape is preserved, which keeps every relative link working
 *  - every CDN asset is vendored into public/designs/_vendor/ and the tags
 *    rewritten. A public site should not depend on four third-party hosts
 *    being up, and each would otherwise see every visitor's IP
 *  - each set's own index.html is kept and is what /products/<slug>/designs
 *    shows. It is the gallery the screens were designed and reviewed against;
 *    a second grid written here would be a different document that drifts the
 *    moment a screen is added
 *  - the breadcrumb strip is kept for the same reason — with the index present
 *    the copied set is a self-navigating mini-site, and stripping it left every
 *    screen a dead end. `stripElement` is retained for when that changes again
 *  - links that cannot resolve (never-drawn screens, the skipped _review.html)
 *    are neutralised rather than deleted, so the gap stays visible
 *  - _review.html is skipped: a 14-iframe local contact sheet, not a document
 *    anyone else needs
 *
 *   node scripts/sync-designs.mjs
 */
import { mkdir, readdir, readFile, writeFile, rm, stat, copyFile } from "node:fs/promises";
import { join, dirname, relative, extname, basename, sep, resolve, isAbsolute } from "node:path";
import { existsSync } from "node:fs";
import { resolveSources } from "./designs/sources.mjs";
import { checkSurface, canonicalHashes, CANONICAL } from "./designs/conformance.mjs";

const OUT = join(process.cwd(), "public", "designs");
const VENDOR = join(OUT, "_vendor");
const DATA = join(process.cwd(), "src", "data", "designs.json");
/* Clean per-product URLs for the galleries. These are static files, not Next
   routes — the page served is the app repo's own index.html, unaltered but
   for a <base> tag. Wrapping it in a route would put our header, our back
   link and our scroll container around a document that already has its own. */
const PAGES = join(process.cwd(), "public", "products");

// index.html is KEPT: it is the design set's own gallery, written in the app
// repo, and the site shows that page rather than inventing a second one.
// _review.html is a 14-iframe contact sheet for local review — not a document
// anyone else needs.
const SKIP_FILES = new Set(["_review.html"]);

/* Credential shapes worth stopping a public deploy for. Deliberately narrow:
   a pattern that fires on a wireframe's placeholder trains everyone to add an
   exception, and then it catches nothing. */
const SECRETS = [
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["GitHub token", /\bgh[pousr]_[0-9A-Za-z]{36,}\b/],
  ["Slack token", /\bxox[abposr]-[0-9A-Za-z-]{10,}\b/],
  ["Stripe secret key", /\bsk_live_[0-9A-Za-z]{16,}\b/],
  ["RevenueCat secret key", /\bsk_[0-9A-Za-z]{24,}\b/],
  ["private key block", /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/],
];
const COPY_EXT = new Set([".html", ".css", ".js", ".svg", ".png", ".webp", ".jpg"]);

const exists = async (p) => {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
};

/** Remove an element by walking tag depth. Regex cannot do this: the chrome
 *  contains nested divs and a non-greedy `</div>` stops at the first one. */
function stripElement(html, openRe) {
  const m = openRe.exec(html);
  if (!m) return html;
  let depth = 1;
  const tag = /<\/?div\b/gi;
  tag.lastIndex = m.index + m[0].length;
  let t;
  while ((t = tag.exec(html))) {
    depth += t[0][1] === "/" ? -1 : 1;
    if (depth === 0) {
      const end = html.indexOf(">", t.index) + 1;
      return html.slice(0, m.index) + html.slice(end);
    }
  }
  return html;
}

// The breadcrumb strip is NOT stripped any more. It is the set's own
// navigation, and with the index page included the copied set becomes a
// self-navigating mini-site: index -> screen -> back. Removing it left every
// screen a dead end.
const CHROME = [];

/* Hosts served from here instead of from them.
 *
 * This used to be a two-entry list — tailwind and lucide — written when those
 * were the only things the sets loaded. They are not any more: the sets on
 * main also pull reactflow (script AND stylesheet), chart.js, mermaid, and
 * react/react-dom. Hardcoding the list is what let that happen unseen, so the
 * rewrite is now driven by what the HTML actually asks for. */
const VENDOR_HOSTS = ["cdn.tailwindcss.com", "unpkg.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"];
const HOSTS_RE = VENDOR_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|");
const ASSET_RE = new RegExp(`(?:src|href)="(https://(?:${HOSTS_RE})[^"]*)"`, "g");

/* `@latest` is not a version. 112 files ask for it, so two builds a month
   apart would ship different icons from the same commit — and the claim that
   these pages are the repo's own bytes would quietly stop being true. Pin it
   to what the rest of the estate already pins. */
const PINS = [[/^https:\/\/unpkg\.com\/lucide@latest\//, "https://unpkg.com/lucide@0.544.0/"]];
const pin = (url) => PINS.reduce((u, [re, to]) => u.replace(re, to), url);

/** A readable, collision-free local filename for a vendored URL. */
function vendorName(url) {
  const u = new URL(url);
  const name = (u.host + u.pathname).replace(/[^A-Za-z0-9._@-]+/g, "_").replace(/_+$/, "");
  return /\.(js|mjs|css)$/.test(name) ? name : `${name}.js`;
}

/** url → { name, bytes }, downloaded at most once per run. */
const vendored = new Map();

async function vendorAsset(rawUrl) {
  const url = pin(rawUrl);
  const held = vendored.get(url);
  if (held) return held;

  const name = vendorName(url);
  const dest = join(VENDOR, name);
  let bytes;
  if (await exists(dest)) {
    bytes = (await stat(dest)).size;
  } else {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`vendoring ${url}: HTTP ${r.status}`);
    const body = Buffer.from(await r.arrayBuffer());
    await mkdir(VENDOR, { recursive: true });
    await writeFile(dest, body);
    bytes = body.length;
  }
  const rec = { url, name, bytes };
  vendored.set(url, rec);
  return rec;
}

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

await rm(OUT, { recursive: true, force: true }).catch(() => {});
await mkdir(OUT, { recursive: true });
await mkdir(VENDOR, { recursive: true });

const manifest = {};
let screens = 0;
let bytes = 0;

const { mode, sets } = resolveSources();

/* §13 — every set's _chrome.js and _gallery.js is measured against this one.
   If charades itself is absent nothing can be compared, so say so loudly
   rather than pass every set by default. */
const canonDir = join(sets[CANONICAL.slug]?.dir ?? "", CANONICAL.surface);
const canon = await canonicalHashes(canonDir);
if (!canon["_chrome.js"]) {
  throw new Error(
    `canonical set ${CANONICAL.slug}/${CANONICAL.surface} has no _chrome.js at ${canonDir}.\n` +
      "  Nothing can be checked against it — refusing to publish rather than pass every set by default.",
  );
}

/* Which surfaces may be published, and why the rest may not. Filled by the
   conformance pass below and recorded in the manifest either way: a product
   whose set is withheld says so on its page rather than silently losing a
   section. */
const conformance = {};

for (const [slug, source] of Object.entries(sets)) {
  const src = source.dir;
  const entries = [];

  /* One verdict per surface. A product can have a conforming mobile set and a
     web set that is not there yet, and the mobile one should still publish. */
  conformance[slug] = { surfaces: {}, publishable: [] };
  for (const s of await readdir(src, { withFileTypes: true })) {
    if (!s.isDirectory() || !["mobile", "web"].includes(s.name)) continue;
    const r = await checkSurface(join(src, s.name), canon);
    conformance[slug].surfaces[s.name] = r;
    if (r.pass) conformance[slug].publishable.push(s.name);
  }

  for await (const file of walk(src)) {
    const rel = relative(src, file);
    const ext = extname(file).toLowerCase();
    if (!COPY_EXT.has(ext)) continue;
    if (ext === ".html" && SKIP_FILES.has(basename(file))) continue;

    /* THE GATE. A surface that does not follow STYLE-GUIDE.md is not copied,
       so it cannot be reached on the site at all — not merely unlinked. Its
       reasons are in `conformance` and the product page states them.
       brand/ is shared artwork rather than a surface; it rides along only when
       at least one surface of this product publishes. */
    const top = rel.split(sep)[0];
    if (top === "brand") {
      if (conformance[slug].publishable.length === 0) continue;
    } else if (!conformance[slug].publishable.includes(top)) continue;

    const dest = join(OUT, slug, rel);
    await mkdir(dirname(dest), { recursive: true });

    if (ext !== ".html") {
      await copyFile(file, dest);
      continue;
    }

    let h = await readFile(file, "utf8");
    for (const re of CHROME) h = stripElement(h, re);

    /* Rewrite whatever this file asks for, rather than the two things an
       earlier version assumed it would. Both `src` and `href`: reactflow ships
       a stylesheet, and a design set missing its stylesheet is a broken page
       that still passes every check. */
    const up = relative(dirname(dest), VENDOR).split(sep).join("/") || ".";
    for (const url of new Set([...h.matchAll(ASSET_RE)].map((m) => m[1]))) {
      const { name } = await vendorAsset(url);
      h = h.split(`"${url}"`).join(`"${up}/${name}"`);
    }

    /* Fail loudly rather than publish a page that still calls a CDN. A silent
       miss here is invisible until someone reads the network tab. */
    const leaked = h.match(new RegExp(`https://(?:${HOSTS_RE})[^"']*`, "g"));
    if (leaked) throw new Error(`${slug}/${rel}: un-vendored CDN reference ${leaked[0]}`);

    /* These bytes came out of a PRIVATE repo and are about to sit on a public
       host. A wireframe that hardcoded a real key to make a demo work would be
       published by this script and nothing else would ever look at it. So the
       scan runs here, at the boundary, and stops the build. */
    for (const [name, re] of SECRETS) {
      const hit = h.match(re);
      if (hit) throw new Error(`${slug}/${rel}: looks like a ${name} — refusing to publish it`);
    }

    await writeFile(dest, h);
    bytes += Buffer.byteLength(h);
    screens++;

    const title = (h.match(/<title>([^<]*)<\/title>/) || [, basename(file, ".html")])[1]
      .replace(/\s*[—·|]\s*(wireframes?|mobile|web).*$/i, "")
      .trim();
    const parts = rel.split(sep);
    entries.push({
      path: `/designs/${slug}/${parts.join("/")}`,
      title,
      surface: parts[0],
      area: parts.length > 2 ? parts[parts.length - 2] : null,
      isIndex: basename(file) === "index.html",
    });
  }
  if (entries.length) {
    entries.sort((a, b) => a.path.localeCompare(b.path));
    manifest[slug] = {
      // The set's own gallery pages, one per surface (mobile / web).
      indexes: entries.filter((e) => e.isIndex).map(({ path, title, surface }) => ({ path, title, surface })),
      screens: entries
        .filter((e) => !e.isIndex)
        .map((e) => ({ path: e.path, title: e.title, surface: e.surface, area: e.area })),
    };
  }
}

/* Second pass: neutralise links that cannot resolve.
 *
 * Some galleries link to screens that were never drawn (aakalan's account and
 * settle flows), and imposter's links to the _review.html contact sheet this
 * script deliberately does not publish. Left alone those are 404s on a public
 * page; deleted outright the gap disappears, which the site's own rule forbids
 * — a missing thing is visibly missing. So the anchor keeps its label and
 * loses its href, and says why on hover.
 *
 * Runs after everything is on disk, because a link may point forward to a file
 * this walk had not reached yet. */
const LINK = /<a\b([^>]*?)href="([^"]+)"([^>]*)>/gi;
let neutralised = 0;

for await (const file of walk(OUT)) {
  if (extname(file).toLowerCase() !== ".html") continue;
  const dir = dirname(file);
  const before = await readFile(file, "utf8");
  const after = before.replace(LINK, (whole, pre, href, post) => {
    const clean = decodeURIComponent(href.split("#")[0].split("?")[0]);
    if (!clean.endsWith(".html")) return whole;
    if (/^(?:[a-z]+:)?\/\//i.test(clean) || isAbsolute(clean)) return whole;
    if (existsSync(resolve(dir, clean))) return whole;
    neutralised++;
    return `<a${pre}aria-disabled="true" title="Not drawn yet" style="opacity:.45;text-decoration:line-through;cursor:default;pointer-events:none"${post}>`;
  });
  if (after !== before) await writeFile(file, after);
}

/* Publish each root gallery at /products/<slug>/designs/ (and, where a set has
 * more than one surface, /products/<slug>/designs/<surface>/ as well).
 *
 * The file is the original byte-for-byte apart from one injected <base>. Every
 * link and script src inside it is relative to where it lives under /designs/,
 * so <base> is what lets the same bytes be served from a second path without
 * rewriting a single href. Clicking through then lands on the real screen at
 * its real URL, which is the point — these pages are a front door, not a copy. */
await rm(PAGES, { recursive: true, force: true }).catch(() => {});
let pages = 0;

for (const [slug, set] of Object.entries(manifest)) {
  const roots = [];
  for (const g of set.indexes) {
    const held = roots.find((r) => r.surface === g.surface);
    const depth = (x) => x.path.split("/").length;
    if (!held) roots.push(g);
    else if (depth(g) < depth(held)) roots[roots.indexOf(held)] = g;
  }
  roots.sort((a, b) => a.surface.localeCompare(b.surface));
  if (roots.length === 0) continue;

  for (const [i, g] of roots.entries()) {
    const html = await readFile(join(OUT, g.path.replace("/designs/", "")), "utf8");
    const base = `${g.path.slice(0, g.path.lastIndexOf("/"))}/`;
    const withBase = html.replace(/<head([^>]*)>/i, `<head$1>\n<base href="${base}">`);
    if (withBase === html) throw new Error(`${g.path}: no <head> to anchor <base> to`);

    // The first surface is the product's designs page; the rest get their own.
    const dests = [join(PAGES, slug, "designs", g.surface, "index.html")];
    if (i === 0) dests.push(join(PAGES, slug, "designs", "index.html"));
    for (const dest of dests) {
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, withBase);
      pages++;
    }
  }
}

await writeFile(
  DATA,
  JSON.stringify(
    {
      $comment:
        "GENERATED by scripts/sync-designs.mjs from the private app repos. Do not hand-edit.",
      generatedOn: new Date().toISOString().slice(0, 10),
      source: mode,
      styleGuide: {
        canonical: `${CANONICAL.slug}/${CANONICAL.surface}`,
        note: "Surfaces that fail are not published at all. See STYLE-GUIDE.md.",
        results: conformance,
      },
      commits: Object.fromEntries(
        Object.entries(sets).map(([s, x]) => [s, { repo: x.origin, sha: x.sha }]),
      ),
      vendored: [...vendored.values()].sort((a, b) => a.name.localeCompare(b.name)),
      sets: manifest,
    },
    null,
    2,
  ) + "\n",
);

console.log(`source: ${mode}${mode === "remote" ? " (private repos, default branch)" : " (~/git/products)"}`);
console.log(`\nSTYLE-GUIDE.md conformance — canonical set is ${CANONICAL.slug}/${CANONICAL.surface}`);
for (const [slug, c] of Object.entries(conformance)) {
  for (const [surface, r] of Object.entries(c.surfaces)) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${slug}/${surface}`);
    if (!r.pass) for (const f of r.checks.filter((x) => !x.ok)) console.log(`          ${f.id}: ${f.detail}`);
  }
}
const published = Object.values(conformance).filter((c) => c.publishable.length).length;
console.log(`\npublishing ${published} of ${Object.keys(conformance).length} products' design sets\n`);
console.log(`published ${pages} gallery page(s) under /products/<slug>/designs/`);
console.log(`neutralised ${neutralised} dead link(s) to screens that were never drawn`);
console.log(`synced ${screens} screens, ${(bytes / 1024 / 1024).toFixed(2)}MB html`);
const vendorKB = [...vendored.values()].reduce((n, x) => n + x.bytes, 0) / 1024;
console.log(`vendored ${vendored.size} asset(s), ${vendorKB.toFixed(0)}KB, from ${VENDOR_HOSTS.length} host(s)`);
for (const x of [...vendored.values()].sort((a, b) => b.bytes - a.bytes)) {
  console.log(`  ${String(Math.round(x.bytes / 1024)).padStart(4)}KB  ${x.url}`);
}
for (const [s, e] of Object.entries(manifest)) {
  console.log(`  ${s.padEnd(20)} ${String(e.screens.length).padStart(3)} screens · ${e.indexes.length} gallery page(s)`);
}
