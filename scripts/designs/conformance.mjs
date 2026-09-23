/**
 * Does a design set follow ~/git/personal/STYLE-GUIDE.md?
 *
 * The guide is mostly about product design sets, not about this website, and
 * most of it is not mechanically checkable — whether a screen describes the app
 * that exists (§11) is a judgement. What IS checkable is the machinery: the
 * manifest, the five shared files, pinned CDNs, the token contract. Those are
 * exactly the things that decide whether a set can be *published*, because a
 * set without them has no gallery, no flow chart and no working bar.
 *
 * So this is the publish gate. A set that passes goes on the site. A set that
 * fails is not published and its reasons are recorded, so the product page can
 * say what is missing instead of quietly dropping the section — the same rule
 * the rest of this site runs on.
 *
 * Deliberately NOT checked here, because they need the whole set walked and
 * belong in the product repo rather than in a website's build:
 *   links · click-through · flow-complete · acyclic   (§12)
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, relative, sep, extname, basename } from "node:path";

/* §13: the canonical set. Every other set's _chrome.js and _gallery.js must
   match it byte for byte. Naming a set rather than "the nearest one" is the
   whole point of that section — a migration that copies from a set which is
   itself behind looks finished and is a version behind. */
export const CANONICAL = { slug: "charades", surface: "mobile" };

/* §1 — the files a set is made of. */
const REQUIRED = ["routes.js", "_chrome.js", "_gallery.js", "shared.css", "tailwind.config.js", "index.html", "screenshots.html"];

/* §13 — copied byte for byte, never edited per product. */
const BYTE_IDENTICAL = ["_chrome.js", "_gallery.js"];

/* §3 — pinned, because an unpinned CDN restyles the estate overnight. */
const PINS = [
  { name: "tailwind", bad: /cdn\.tailwindcss\.com(?!\/3\.4\.17)["'\s]/ },
  { name: "lucide", bad: /lucide@(?!0\.544\.0)[a-z0-9.]+/ },
];

/* §8 — the palette every product must declare. Role names, never hues. */
const REQUIRED_TOKENS = [
  "--page", "--frame", "--surface", "--muted", "--sunken",
  "--ink", "--ink-2", "--ink-3", "--ink-4", "--ink-inverse",
  "--line", "--line-strong",
  "--brand-50", "--brand-100", "--brand-200", "--brand-400", "--brand-500", "--brand-700", "--brand-900",
  "--success", "--success-bg", "--success-fg",
  "--warn", "--warn-bg", "--warn-fg",
  "--danger", "--danger-bg", "--danger-fg",
  "--info", "--info-bg", "--info-fg",
  "--shadow-tint",
];

const md5 = (buf) => createHash("md5").update(buf).digest("hex");
const exists = async (p) => { try { await stat(p); return true; } catch { return false; } };

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

/** Evaluate routes.js without a browser. It only ever assigns window.ROUTES. */
function readRoutes(src) {
  const window = {};
  try {
    new Function("window", src)(window);
  } catch (e) {
    return { error: `routes.js did not evaluate: ${e.message}` };
  }
  if (!window.ROUTES) return { error: "routes.js does not assign window.ROUTES" };
  return { routes: window.ROUTES };
}

/**
 * Check one surface directory. Every check is always reported, passing or not,
 * so a product page can show the whole scorecard rather than only the first
 * thing that broke.
 */
export async function checkSurface(dir, canonicalHashes) {
  const checks = [];
  const add = (id, ok, detail = "") => checks.push({ id, ok, detail });

  // ── §1 · the files a set is made of ────────────────────────────────────
  const missing = [];
  for (const f of REQUIRED) if (!(await exists(join(dir, f)))) missing.push(f);
  add("files", missing.length === 0, missing.length ? `missing ${missing.join(", ")}` : "all seven present");

  // ── §13 · the shared files are copies, not versions ────────────────────
  const drifted = [];
  for (const f of BYTE_IDENTICAL) {
    const p = join(dir, f);
    if (!(await exists(p))) { drifted.push(`${f} (absent)`); continue; }
    const got = md5(await readFile(p));
    if (canonicalHashes[f] && got !== canonicalHashes[f]) drifted.push(f);
  }
  add("shared-files", drifted.length === 0,
    drifted.length
      ? `${drifted.join(", ")} differs from the canonical ${CANONICAL.slug}/${CANONICAL.surface} copy — §13 says these are copied byte for byte`
      : "byte-identical to canonical");

  // ── §3 · pinned CDNs ───────────────────────────────────────────────────
  const unpinned = new Set();
  const htmlFiles = [];
  for await (const f of walk(dir)) if (extname(f).toLowerCase() === ".html") htmlFiles.push(f);
  for (const f of htmlFiles) {
    const h = await readFile(f, "utf8");
    for (const p of PINS) if (p.bad.test(h)) unpinned.add(p.name);
  }
  add("pinned-cdns", unpinned.size === 0,
    unpinned.size ? `unpinned ${[...unpinned].join(", ")} — §3` : "tailwind 3.4.17, lucide 0.544.0");

  // ── §2 · routes.js is the single source ────────────────────────────────
  let routes = null;
  if (await exists(join(dir, "routes.js"))) {
    const r = readRoutes(await readFile(join(dir, "routes.js"), "utf8"));
    if (r.error) add("routes-manifest", false, r.error);
    else {
      routes = r.routes;
      const absent = ["product", "surface", "flows"].filter((k) => routes[k] === undefined);
      if (!routes.flow?.start) absent.push("flow.start");
      add("routes-manifest", absent.length === 0,
        absent.length ? `routes.js has no ${absent.join(", ")}` : `${routes.product} · ${(routes.flows || []).length} flows`);
    }
  } else add("routes-manifest", false, "no routes.js");

  // ── §2 · a screen not in routes.js appears nowhere ─────────────────────
  if (routes?.flows) {
    const declared = new Set();
    for (const f of routes.flows) for (const s of f.screens || []) {
      declared.add(s.file);
      for (const v of Object.values(s.states || {})) declared.add(v);
    }
    const onDisk = htmlFiles
      .map((f) => relative(dir, f).split(sep).join("/"))
      .filter((f) => f.includes("/") && !basename(f).startsWith("_"));

    const undeclared = onDisk.filter((f) => !declared.has(f));
    const phantom = [...declared].filter((f) => !onDisk.includes(f));
    const trim = (a) => `${a.slice(0, 3).join(", ")}${a.length > 3 ? ", …" : ""}`;
    add("declared-screens", undeclared.length === 0 && phantom.length === 0,
      [undeclared.length ? `${undeclared.length} on disk not in routes.js (${trim(undeclared)})` : "",
       phantom.length ? `${phantom.length} declared but absent (${trim(phantom)})` : ""]
        .filter(Boolean).join("; ") || `${declared.size} screens, all accounted for`);

    // ── §2 · every screen declares its own path ──────────────────────────
    const badChrome = [];
    for (const rel of onDisk) {
      const h = await readFile(join(dir, rel), "utf8");
      const m = h.match(/data-file="([^"]+)"/);
      if (!/data-chrome\b/.test(h) || !m) badChrome.push(`${rel} (no data-chrome/data-file)`);
      else if (m[1] !== rel) badChrome.push(`${rel} says data-file="${m[1]}"`);
    }
    add("screen-identity", badChrome.length === 0,
      badChrome.length ? `${badChrome.length}: ${badChrome.slice(0, 2).join("; ")}${badChrome.length > 2 ? ", …" : ""}`
                       : "every screen declares its own path");
  } else {
    add("declared-screens", false, "no manifest to check against");
    add("screen-identity", false, "no manifest to check against");
  }

  // ── §8 · the palette contract ──────────────────────────────────────────
  if (await exists(join(dir, "shared.css"))) {
    const css = await readFile(join(dir, "shared.css"), "utf8");
    const absent = REQUIRED_TOKENS.filter((t) => !new RegExp(`${t}\\s*:`).test(css));
    add("palette-tokens", absent.length === 0,
      absent.length ? `${absent.length} required token(s) undeclared: ${absent.slice(0, 5).join(", ")}${absent.length > 5 ? ", …" : ""} — §8`
                    : `all ${REQUIRED_TOKENS.length} declared`);
  } else add("palette-tokens", false, "no shared.css");

  // ── §8 · every config value is var(--token), never a literal ───────────
  if (await exists(join(dir, "tailwind.config.js"))) {
    const cfg = await readFile(join(dir, "tailwind.config.js"), "utf8");
    const stripped = cfg.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    const literals = [...new Set(stripped.match(/["']#[0-9a-fA-F]{3,8}["']/g) || [])];
    add("no-literal-colours", literals.length === 0,
      literals.length ? `${literals.length} literal hex in tailwind.config.js: ${literals.slice(0, 4).join(", ")} — §8`
                      : "every value is var(--token)");
  } else add("no-literal-colours", false, "no tailwind.config.js");

  // ── §8 · one stylesheet per surface ────────────────────────────────────
  const strayCss = [];
  for await (const f of walk(dir)) {
    const rel = relative(dir, f).split(sep).join("/");
    if (extname(f) === ".css" && rel !== "shared.css") strayCss.push(rel);
  }
  add("one-stylesheet", strayCss.length === 0,
    strayCss.length ? `stray stylesheet(s): ${strayCss.join(", ")} — §8` : "shared.css only");

  return { pass: checks.every((c) => c.ok), checks };
}

/** md5 of the canonical set's shared files, for everyone else to match. */
export async function canonicalHashes(dirOfCanonicalSurface) {
  const out = {};
  for (const f of BYTE_IDENTICAL) {
    const p = join(dirOfCanonicalSurface, f);
    if (await exists(p)) out[f] = md5(await readFile(p));
  }
  return out;
}
