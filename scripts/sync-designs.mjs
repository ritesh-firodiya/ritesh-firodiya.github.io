#!/usr/bin/env node
/**
 * Pull the real design sets out of the (private) app repos into
 * public/designs/, so the site shows the actual designs instead of essays
 * about them.
 *
 * NOTHING THIS WRITES IS COMMITTED. public/designs/ and public/products/ are
 * gitignored: a public repo does not store private work, and a copy that has
 * to be refreshed by hand is a copy that is wrong. scripts/designs/sources.mjs
 * decides where each set comes from — a sparse clone of the private repo in
 * CI, the working copy under ~/git/products locally.
 *
 * Each set is a Babul set (canon's design-sets standard): `babul.js`,
 * `tokens.js`, `assets/`, `shell.js`, and one folder per size. The shell
 * reads everything from the HTML at runtime, by paths relative to the set's
 * root, so the whole folder is copied with its shape intact. The shell itself
 * is canon's: it is published once, at /designs/_shell/, and each set's
 * shell.js is pointed there.
 *
 *  - a size that fails the publish gate (scripts/designs/conformance.mjs) is
 *    not copied; its reasons land in designs.json and the product page says so
 *  - every CDN the shell loads is named in its `boot.js` as a string. Each
 *    is vendored into public/designs/_vendor/ and the published boot.js points
 *    there: a public site should not depend on third-party hosts being up,
 *    and each would otherwise see every visitor's IP
 *  - the screens list is canon's scan of the set (`scan.mjs <set> <size> --json`):
 *    each page, and each `?state=` of it
 *  - /products/<slug>/designs/ forwards to the set's journey, so the address
 *    the site has always used still opens it
 *
 *   node scripts/sync-designs.mjs
 */
import { mkdir, readFile, readdir, writeFile, rm, copyFile } from "node:fs/promises";
import { join, dirname, relative, extname, sep } from "node:path";
import { resolveSources, resolveShell } from "./designs/sources.mjs";
import { checkSet } from "./designs/conformance.mjs";
import { assertNoSecrets } from "./designs/secrets.mjs";
import { walk } from "./designs/fs.mjs";

const OUT = join(process.cwd(), "public", "designs");
const VENDOR = join(OUT, "_vendor");
const DATA = join(process.cwd(), "src", "data", "generated", "designs.json");
const PAGES = join(process.cwd(), "public", "products");
const SHELL_OUT = join(OUT, "_shell");
const SHELL_LINE = /var SHELL = "[^"]*";/;

/* Text is scanned for secrets before it leaves a private repo; images are copied as they are. */
const TEXT_EXT = new Set([".html", ".css", ".js", ".mjs", ".svg", ".json"]);
const COPY_EXT = new Set([...TEXT_EXT, ".png", ".webp", ".jpg", ".jpeg", ".ico"]);

const VENDOR_HOSTS = ["cdn.tailwindcss.com", "unpkg.com", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"];
const HOSTS_RE = VENDOR_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|");
/* In boot.js a CDN is a JS string literal, not a src/href attribute. */
const CDN_STRING = new RegExp(`"(https://(?:${HOSTS_RE})[^"]*)"`, "g");
const CDN_ANY = new RegExp(`https://(?:${HOSTS_RE})[^"'\\s)]*`);

/** A readable, collision-free local filename for a vendored URL. */
function vendorName(url) {
  const u = new URL(url);
  const name = (u.host + u.pathname).replace(/[^A-Za-z0-9._@-]+/g, "_").replace(/_+$/, "");
  return /\.(js|mjs|css)$/.test(name) ? name : `${name}.js`;
}

/** url → { url, name, bytes }, downloaded at most once per run. */
const vendored = new Map();
async function vendorAsset(url) {
  const held = vendored.get(url);
  if (held) return held;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`vendoring ${url}: HTTP ${r.status}`);
  const body = Buffer.from(await r.arrayBuffer());
  const rec = { url, name: vendorName(url), bytes: body.length };
  await writeFile(join(VENDOR, rec.name), body);
  vendored.set(url, rec);
  return rec;
}

/** boot.js with every CDN string pointing at the vendored copy. */
async function vendorBoot(js) {
  let out = js;
  for (const url of new Set([...js.matchAll(CDN_STRING)].map((m) => m[1]))) {
    const { name } = await vendorAsset(url);
    out = out.split(`"${url}"`).join(`"/designs/_vendor/${name}"`);
  }
  return out;
}

await rm(OUT, { recursive: true, force: true });
await mkdir(VENDOR, { recursive: true });

const { mode, sets } = resolveSources();

/* One shell, canon's, published once for every set. Without it nothing can
   be checked or shown, so stop rather than publish broken pages. */
const shellDir = resolveShell(mode);
await mkdir(SHELL_OUT, { recursive: true });
for (const f of await readdir(shellDir).catch(() => [])) {
  let text = await readFile(join(shellDir, f), "utf8");
  if (f === "boot.js") text = await vendorBoot(text);
  assertNoSecrets(text, `_shell/${f}`);
  await writeFile(join(SHELL_OUT, f), text);
}
if (!(await readdir(SHELL_OUT)).includes("scan.mjs")) throw new Error(`no canon shell at ${shellDir} — refusing to publish`);

const manifest = {};
/* slug → { surfaces: size → verdict, publishable: sizes }. Every product is
   recorded, passing or not: a withheld set says so on its page. */
const conformance = {};
let files = 0;
let bytes = 0;

for (const [slug, source] of Object.entries(sets)) {
  const src = source.dir;
  const { sizes, models } = await checkSet(src, shellDir);
  const publishable = Object.keys(models).sort();
  conformance[slug] = { surfaces: sizes, publishable };
  if (publishable.length === 0) continue;

  for await (const file of walk(src)) {
    const rel = relative(src, file);
    const top = rel.split(sep)[0];
    const ext = extname(file).toLowerCase();
    if (!COPY_EXT.has(ext)) continue;
    /* A size that failed is not copied, so it cannot be reached at all. */
    if (top in sizes && !publishable.includes(top)) continue;

    const dest = join(OUT, slug, rel);
    await mkdir(dirname(dest), { recursive: true });
    files++;
    if (!TEXT_EXT.has(ext)) {
      await copyFile(file, dest);
      continue;
    }
    let text = await readFile(file, "utf8");
    if (rel === "shell.js") text = text.replace(SHELL_LINE, 'var SHELL = "/designs/_shell/";');
    /* Fail loudly rather than publish a page that still calls a CDN. */
    const leaked = text.match(CDN_ANY);
    if (leaked) throw new Error(`${slug}/${rel}: un-vendored CDN reference ${leaked[0]}`);
    /* These bytes came out of a PRIVATE repo and are about to sit on a public
       host, and nothing else looks at them. So the scan runs here and stops
       the build. */
    assertNoSecrets(text, `${slug}/${rel}`);
    await writeFile(dest, text);
    bytes += Buffer.byteLength(text);
  }

  const screens = [];
  for (const size of publishable) {
    for (const page of models[size].pages) {
      const path = `/designs/${slug}/${size}/${page.id}.html`;
      const area = page.id.includes("/") ? page.id.split("/")[0] : null;
      screens.push({ path, title: page.name, surface: size, area });
      for (const s of page.states) {
        screens.push({ path: `${path}?state=${encodeURIComponent(s.name)}`, title: `${page.name} · ${s.name}`, surface: size, area });
      }
    }
  }
  manifest[slug] = {
    journeys: publishable.map((size) => ({ surface: size, path: `/designs/${slug}/${size}/index.html` })),
    screens,
  };

  /* The address the site has always linked, forwarding to the journey. */
  const forward = (to) =>
    `<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><a href="${to}">Open the design set</a>\n`;
  for (const [i, j] of manifest[slug].journeys.entries()) {
    const dests = [join(PAGES, slug, "designs", j.surface, "index.html")];
    if (i === 0) dests.push(join(PAGES, slug, "designs", "index.html"));
    for (const d of dests) {
      await mkdir(dirname(d), { recursive: true });
      await writeFile(d, forward(j.path));
    }
  }
}

await mkdir(dirname(DATA), { recursive: true });
await writeFile(
  DATA,
  JSON.stringify(
    {
      $comment: "GENERATED by scripts/sync-designs.mjs from the private app repos. Do not hand-edit.",
      generatedOn: new Date().toISOString().slice(0, 10),
      source: mode,
      styleGuide: {
        note: "Sizes that fail are not published at all. See the design-sets standard.",
        results: conformance,
      },
      commits: Object.fromEntries(Object.entries(sets).map(([s, x]) => [s, { repo: x.origin, sha: x.sha }])),
      vendored: [...vendored.values()].sort((a, b) => a.name.localeCompare(b.name)),
      sets: manifest,
    },
    null,
    2,
  ) + "\n",
);

console.log(`source: ${mode}${mode === "remote" ? " (private repos, default branch)" : " (~/git/products)"}`);
console.log(`\ndesign-sets conformance — canon's shell from ${shellDir}`);
for (const [slug, c] of Object.entries(conformance)) {
  if (Object.keys(c.surfaces).length === 0) console.log(`  NONE  ${slug} (no size folder)`);
  for (const [size, r] of Object.entries(c.surfaces)) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${slug}/${size}`);
    if (!r.pass) for (const f of r.checks.filter((x) => !x.ok)) console.log(`          ${f.id}: ${f.detail}`);
  }
}
const published = Object.values(conformance).filter((c) => c.publishable.length).length;
console.log(`\npublishing ${published} of ${Object.keys(conformance).length} products' design sets`);
console.log(`copied ${files} files, ${(bytes / 1024 / 1024).toFixed(2)}MB of text`);
const vendorKB = [...vendored.values()].reduce((n, x) => n + x.bytes, 0) / 1024;
console.log(`vendored ${vendored.size} asset(s), ${vendorKB.toFixed(0)}KB`);
for (const [s, e] of Object.entries(manifest)) {
  console.log(`  ${s.padEnd(20)} ${String(e.screens.length).padStart(3)} screens · ${e.journeys.map((j) => j.surface).join(", ")}`);
}
