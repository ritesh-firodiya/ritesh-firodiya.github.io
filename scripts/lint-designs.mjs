#!/usr/bin/env node
/**
 * Audit every design set in the estate and write src/data/design-audit.json,
 * which /design/drift renders.
 *
 *   node scripts/lint-designs.mjs           audit, write the data, print a table
 *   node scripts/lint-designs.mjs --quiet   data only
 *
 * THE DRIFT TABLE IS GENERATED OUTPUT, like PROJECTS.md. It was hand-written
 * in the wireframe, which means it was accurate on the day it was drawn and
 * decayed from then on. A design-system page that shows only the compliant
 * examples is a portfolio piece; the useful artifact is the one that says
 * which rules got broken, by whom, and what it would cost to fix.
 *
 * Reads the app repos when they are present (they are, locally) and falls back
 * to the synced copies in public/designs/. The audit JSON is committed, so CI
 * publishes the last locally-generated truth rather than pretending it can see
 * ten private repos.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";
import { homedir } from "node:os";

import { CHECKS } from "../design-system/lib/lint-checks.mjs";
import { paletteKeys } from "../design-system/lib/tokens.mjs";
import { STRUCTURE_CHECKS } from "../design-system/lib/structure-checks.mjs";

const ROOT = process.cwd();
const DS = join(ROOT, "design-system");
const GIT = join(homedir(), "git");

/** Blocking checks fail the build. The rest report, so the site can ship while
 *  the migrations in phases 3-7 are still in flight. */
const BLOCKING = new Set([
  "colors-are-vars", "vars-defined", "canonical-keys", "name-matches-key", "classes-resolve",
]);

/**
 * Every set, whether or not it has a token layer. The two with none are the
 * whole reason the audit exists — leaving them out would make the table look
 * far better than the estate is.
 */
const SETS = [
  { name: "imposter",     product: "Imposter",   design: "apps/imposter/.context/designs",     source: "apps/imposter/src" },
  { name: "tic-tac-toe",  product: "Tic Tac Toe", design: "apps/tic-tac-toe/.context/designs", source: "apps/tic-tac-toe/src" },
  { name: "aakalan",      product: "Aakalan",    design: "apps/aakalan/.context/designs",      source: "apps/aakalan/src" },
  { name: "askcal",       product: "AskCal",     design: "apps/askcal/.context/designs",       source: "apps/askcal/apps/mobile/src" },
  { name: "charades",     product: "Charades",   design: "apps/charades/.context/designs",     source: "apps/charades/src" },
  { name: "plan-kid",     product: "Plan-Kid",   design: "apps/plan-kid/.context/designs",     source: null },
  { name: "property-app", product: "DwarSeva Property", design: "apps/property-app/.context/designs", source: "apps/property-app/apps/mobile/src" },
  { name: "chitragupt",   product: "Chitragupt", design: "apps/chitragupt/.context/designs",          source: "apps/chitragupt/apps/mobile/src" },
  { name: "trunk",        product: "Trunk",      design: "ventures/trunk/.trunk/ux",                  source: "ventures/trunk/apps" },
];

async function walk(dir, ext, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, ext, out);
    else if (ext.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

async function readAll(paths, base, cap = Infinity) {
  const out = [];
  for (const p of paths.slice(0, cap)) {
    out.push({ path: relative(base, p), body: await readFile(p, "utf8") });
  }
  return out;
}

/** Every stylesheet in a set, concatenated — a set may carry more than one,
 *  and askcal's second one is a whole parallel design system. */
async function collectCss(dir) {
  const files = await walk(dir, [".css"]);
  const bodies = await Promise.all(files.map((f) => readFile(f, "utf8")));
  // Screens with no stylesheet inline their own <style> block; that is a token
  // layer too, just a very bad one, and check 7 must see it.
  return { css: bodies.join("\n"), stylesheets: files.length };
}

async function buildSet(def, ctx) {
  const dir = join(GIT, def.design);
  if (!existsSync(dir)) return null;

  const screenFiles = await walk(dir, [".html"]);
  const screens = await readAll(screenFiles, dir);
  const inline = screens.map((s) => (s.body.match(/<style>([\s\S]*?)<\/style>/g) ?? []).join("\n")).join("\n");
  const { css, stylesheets } = await collectCss(dir);

  const configPath = (await walk(dir, ["tailwind.config.js"]))[0];
  const config = configPath ? await readFile(configPath, "utf8") : null;

  const srcDir = def.source ? join(GIT, def.source) : null;
  const source = srcDir && existsSync(srcDir)
    ? await readAll(await walk(srcDir, [".tsx", ".ts", ".jsx"]), srcDir, 600)
    : [];

  const palette = ctx.palettes.get(def.name) ?? null;
  const canonKeys = palette ? paletteKeys(palette).canon : [];

  /* Structure is read per SURFACE, because a set may be drawn for mobile, for
     web, or for both, and "whichever is available" has to mean the same shape
     in each. Everything below is surface-relative: mobile/auth/sign-in.html. */
  const surfaces = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith("."))
    .map((e) => e.name)
    .sort();

  const surfaceFiles = {};
  const indexHtml = {};
  const flows = [];
  for (const surface of surfaces) {
    const entries = await readdir(join(dir, surface), { withFileTypes: true });
    surfaceFiles[surface] = entries.filter((e) => e.isFile()).map((e) => e.name).sort();
    for (const e of entries) if (e.isDirectory()) flows.push(e.name);
    indexHtml[surface] = surfaceFiles[surface].includes("index.html")
      ? await readFile(join(dir, surface, "index.html"), "utf8")
      : null;
  }
  const screenPaths = screenFiles.map((f) => relative(dir, f)).sort();

  /* A second copy of the same tree is the real failure — whichever folder it
     sits in, the next edit lands in one of them and nobody finds out which. */
  const repo = def.design.split("/").slice(0, 2).join("/");
  const altTrees = [".trunk/designs", ".trunk/ux", "designs", "wireframes"]
    .map((alt) => join(GIT, repo, alt))
    .filter((alt) => alt !== dir && existsSync(alt))
    .map((alt) => relative(join(GIT, repo), alt));

  return {
    ...def,
    dir,
    screens,
    source,
    surfaces,
    surfaceFiles,
    indexHtml,
    flows: [...new Set(flows)],
    screenPaths,
    repo,
    altTrees,
    css: css + "\n" + inline,
    stylesheets,
    config,
    palette,
    canonKeys,
    coreVars: ctx.coreVars,
    expectedCanon: ctx.expectedCanon,
    cdn: ctx.cdn,
  };
}

/**
 * A set with no token layer is NOT clean, it is unmeasured. The first version
 * of this function scored chitragupt and property-app — 269 and 83 screens
 * with an inline <style> block each and no config at all — as "near-clean",
 * because every token check had skipped. A lint that rewards having nothing to
 * check is worse than no lint.
 */
function verdict(rows, set) {
  if (!set.config) return "outside the system";
  const failed = rows.filter((r) => r.ok === false);
  const blocking = failed.filter((r) => BLOCKING.has(r.id));
  if (!failed.length) return "canonical";
  if (!blocking.length) return "near-clean";
  if (blocking.length <= 2) return "older generation";
  return "drifted";
}

async function main() {
  const quiet = process.argv.includes("--quiet");
  const version = (await readFile(join(DS, "VERSION"), "utf8")).trim();
  const core = JSON.parse(await readFile(join(DS, "core.json"), "utf8"));

  const palettes = new Map();
  for (const f of await readdir(join(DS, "palettes"))) {
    if (!f.endsWith(".json")) continue;
    const p = JSON.parse(await readFile(join(DS, "palettes", f), "utf8"));
    palettes.set(p.name, p);
  }

  const canonSrc = join(DS, "dist", "aakalan", "mobile", "tailwind.config.js");
  const expectedCanon = existsSync(canonSrc)
    ? (await readFile(canonSrc, "utf8")).match(/==== CANON[\s\S]*?\*\/\n([\s\S]*?)\/\* ==== END CANON/)?.[1].trim()
    : null;
  const coreCss = existsSync(join(DS, "dist", "aakalan", "mobile", "core.css"))
    ? await readFile(join(DS, "dist", "aakalan", "mobile", "core.css"), "utf8")
    : "";
  const coreVars = new Set([...coreCss.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));

  const structure = JSON.parse(await readFile(join(DS, "structure.json"), "utf8"));
  const ctx = { palettes, coreVars, expectedCanon, cdn: core.shared.cdn, structure };

  const results = [];
  for (const def of SETS) {
    const set = await buildSet(def, ctx);
    if (!set) continue;
    const rows = [
      ...CHECKS.map((fn) => fn(set)),
      ...STRUCTURE_CHECKS.map((fn) => fn(set, ctx.structure)),
    ];
    results.push({
      name: set.name,
      product: set.product,
      path: def.design,
      screens: set.screens.length,
      stylesheets: set.stylesheets,
      hasPalette: Boolean(set.palette),
      hasConfig: Boolean(set.config),
      verdict: verdict(rows, set),
      checks: rows,
    });
  }

  const audit = {
    _: "GENERATED by scripts/lint-designs.mjs. Do not hand-edit — rerun it.",
    version,
    generatedAt: new Date().toISOString().slice(0, 10),
    checks: CHECKS.map((fn) => fn.name),
    blocking: [...BLOCKING],
    sets: results,
  };
  await writeFile(join(ROOT, "src", "data", "design-audit.json"), JSON.stringify(audit, null, 2) + "\n");

  if (!quiet) print(results, version);

  const blocked = results.flatMap((r) =>
    r.checks.filter((c) => c.ok === false && BLOCKING.has(c.id)).map((c) => `${r.name}: ${c.id} (${c.count})`),
  );
  if (blocked.length) {
    console.error(`\n${blocked.length} blocking violation(s). These fail the build:`);
    for (const b of blocked) console.error("  " + b);
    process.exitCode = 1;
  }
}

function print(results, version) {
  const ids = results[0]?.checks.map((c) => c.id) ?? [];
  const w = Math.max(...results.map((r) => r.product.length), 7);
  const cell = (c) => (c.ok === null ? "-" : c.ok ? "ok" : fmt(c.count)).padStart(7);

  console.log(`\ndesign-system ${version} — compliance by set\n`);
  console.log(
    "  " + "Set".padEnd(w) + "Scr".padStart(6) +
    ids.map((_, i) => String(i + 1).padStart(7)).join("") + "   Verdict",
  );
  for (const r of results) {
    console.log(
      "  " + r.product.padEnd(w) + String(r.screens).padStart(6) +
      r.checks.map(cell).join("") + "   " + r.verdict,
    );
  }
  console.log("");
  ids.forEach((id, i) => console.log(`  ${String(i + 1).padStart(2)}  ${id}${BLOCKING.has(id) ? "  (blocking)" : ""}`));
  console.log("\n  ok = passes   -  = nothing to check (no token layer)   n = violations found");
}

/** 31810 reads as 31.8k; the exact number is in the JSON and on the page. */
function fmt(n) {
  return n >= 10000 ? (n / 1000).toFixed(1) + "k" : String(n);
}

main().catch((e) => { console.error(e); process.exit(1); });
