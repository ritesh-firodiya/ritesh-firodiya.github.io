#!/usr/bin/env node
/**
 * Emit every design token file in the estate from one source per product.
 *
 *   node scripts/build-tokens.mjs            emit into design-system/dist/
 *   node scripts/build-tokens.mjs --check    regenerate and diff; non-zero on drift
 *   node scripts/build-tokens.mjs --push     write into the real app repos
 *   node scripts/build-tokens.mjs --only aakalan
 *
 * WHY THIS EXISTS
 *
 * There were eleven independent token systems in ~/git, all built to the same
 * convention and sharing zero code. Copying shared.css into ten repos and
 * hoping is what produced `text-2xs` being used 186 times and declared in one
 * app, `tracking-label` used 9 times and declared nowhere, and a set of amber
 * shadow tokens that were referenced but never defined — so the shadow on 26
 * primary buttons silently resolved to nothing, for months, with no error.
 *
 * So: one hand-edited source per product (design-system/palettes/<name>.json)
 * plus one shared skeleton (design-system/core.json), and FOUR emitted files.
 * A token cannot exist on one side and not the other, because both sides come
 * out of the same object.
 *
 * DEFAULTS TO A DRY RUN. It writes into design-system/dist/ and touches no app
 * repo unless --push is passed. Phase 1 of the rollout is "canon exists and
 * nothing else has changed yet", and a generator that edits ten repos the
 * first time it is run cannot deliver that.
 */
import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { homedir } from "node:os";

import { emitCoreCss } from "../design-system/lib/emit-core-css.mjs";
import { emitTokensCss } from "../design-system/lib/emit-tokens-css.mjs";
import { emitTailwindConfig } from "../design-system/lib/emit-tailwind-config.mjs";
import { emitGlobalCss, emitTokensTs } from "../design-system/lib/emit-runtime.mjs";

const ROOT = process.cwd();
const DS = join(ROOT, "design-system");
const DIST = join(DS, "dist");
const APPS = join(homedir(), "git", "apps");

/**
 * Where each palette's files land in the real tree under --push.
 * Paths differ per repo (askcal's app is a workspace package, the site has no
 * wireframe surface), so they are stated rather than derived. Same reasoning
 * as the SETS map in sync-designs.mjs.
 */
export const TARGETS = {
  aakalan:      { design: `${APPS}/aakalan/.context/designs/mobile`, runtime: `${APPS}/aakalan/src` },
  askcal:       { design: `${APPS}/askcal/.context/designs/mobile`,  runtime: `${APPS}/askcal/apps/mobile/src` },
  charades:     { design: `${APPS}/charades/.context/designs/mobile`, runtime: `${APPS}/charades/src` },
  imposter:     { design: `${APPS}/imposter/.context/designs/mobile`, runtime: `${APPS}/imposter/src` },
  "plan-kid":   { design: `${APPS}/plan-kid/.context/designs/mobile`, runtime: null },
  "tic-tac-toe":{ design: `${APPS}/tic-tac-toe/.context/designs/mobile`, runtime: `${APPS}/tic-tac-toe/src` },
  "ritesh-firodiya": { design: null, runtime: join(process.cwd(), "src", "app") },
};

/**
 * shared.css stays the file every screen links to. 452 screens carry
 *   <link rel="stylesheet" href="../shared.css">
 * and rewriting all of them to adopt tokens would make a token change a markup
 * change. It becomes a two-line shim instead, so phases 1-5 need zero edits to
 * any screen HTML.
 */
const SHIM = (version) => `/* design-system ${version} — see design-system/README.md

   This file is the stable entry point every screen links to. The tokens live
   in the two files it imports, both generated. Do not add rules here: a rule
   in this file is a rule in exactly one set, which is where drift starts. */
@import "./core.css";
@import "./tokens.css";
`;

/* A set may declare structural CSS the canon cannot know about — a game board
   is a device, like the phone frame. Declared per set in the palette and
   checked: the lint allows exactly the classes it names. */
const SHIM_LOCAL = `@import "./local.css";\n`;

async function write(map, path, body) {
  map.set(path, body.endsWith("\n") ? body : body + "\n");
}

async function build({ core, version, palettes }) {
  const files = new Map();

  for (const palette of palettes) {
    const surfaces = palette.surfaces ?? ["mobile"];
    for (const surface of surfaces) {
      const base = join(DIST, palette.name, surface);
      await write(files, join(base, "core.css"), await emitCoreCss({ core, surface, version, dir: DS }));
      await write(files, join(base, "tokens.css"), emitTokensCss({ palette, version }));
      await write(files, join(base, "tailwind.config.js"), emitTailwindConfig({ core, surface, palette, version }));
      if (surface === "mobile") {
        const local = palette.structural;
        await write(files, join(base, "shared.css"), SHIM(version) + (local ? SHIM_LOCAL : ""));
        if (local) {
          await write(
            files,
            join(base, "local.css"),
            `/* ${palette.product} — structural CSS, generated from palettes/${palette.name}.json.\n` +
              `   Classes allowed here: ${local.classes.join(", ")}. */\n\n${local.css}\n`,
          );
        }
        const rt = join(DIST, palette.name, "runtime");
        await write(files, join(rt, "global.css"), await emitGlobalCss({ core, surface, palette, version, dir: DS }));
        await write(files, join(rt, "theme", "tokens.ts"), emitTokensTs({ palette, version }));
      }
    }
  }
  return files;
}

async function flush(files) {
  for (const [path, body] of files) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body, "utf8");
  }
}

async function check(files) {
  const drift = [];
  for (const [path, body] of files) {
    const rel = path.replace(process.cwd() + "/", "");
    if (!existsSync(path)) { drift.push(`missing  ${rel}`); continue; }
    if ((await readFile(path, "utf8")) !== body) drift.push(`modified ${rel}`);
  }
  return drift;
}

/**
 * Copy a set's generated files into its real repo.
 *
 * One set at a time, and never over uncommitted work — a token migration
 * touches every screen in a set, and the only cheap way to review one is
 * `git diff` against a clean tree.
 */
async function push(name, files, version) {
  const target = TARGETS[name];
  if (!target) {
    console.error(`no push target for "${name}". Add one to TARGETS.`);
    process.exit(2);
  }

  /* Ask git, never guess: deriving the root by stripping path segments matched
     the "apps" in ~/git/apps/<name> and resolved to ~/git itself. */
  const anchor = target.design ?? target.runtime;
  const repoRoot = execSync(`git -C ${anchor} rev-parse --show-toplevel`, { encoding: "utf8" }).trim();
  const dirty = execSync(`git -C ${repoRoot} status --porcelain`, { encoding: "utf8" }).trim();
  if (dirty && !process.argv.includes("--force")) {
    console.error(`${repoRoot} has uncommitted changes:\n${dirty}`);
    console.error("\nCommit or stash first — a clean tree is what makes the migration diff reviewable.");
    process.exit(2);
  }

  const written = [];
  const prefix = join(DIST, name) + "/";
  for (const [path, body] of files) {
    /* The map also carries src/data/design-tokens.json, which belongs to the
       site and not to any set. Without this guard it was written into the app
       repo under its own absolute path as a nested directory. */
    if (!path.startsWith(prefix)) continue;
    const rel = path.slice(prefix.length);
    const [surface, ...rest] = rel.split("/");
    let dest = null;
    if (surface === "runtime" && target.runtime) dest = join(target.runtime, rest.join("/"));
    else if (surface !== "runtime" && target.design) dest = join(target.design, rest.join("/"));
    if (!dest) continue;
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, body, "utf8");
    written.push(dest.replace(homedir(), "~"));
  }

  console.log(`design-system ${version} -> ${name}`);
  for (const w of written) console.log("  " + w);
  console.log(`\n${written.length} files. Review with: git -C ${repoRoot} diff`);
}

async function main() {
  const argv = process.argv.slice(2);
  const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;

  const version = (await readFile(join(DS, "VERSION"), "utf8")).trim();
  const core = JSON.parse(await readFile(join(DS, "core.json"), "utf8"));

  const names = (await readdir(join(DS, "palettes")))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((n) => !only || n === only)
    .sort();

  const palettes = await Promise.all(
    names.map(async (n) => JSON.parse(await readFile(join(DS, "palettes", `${n}.json`), "utf8"))),
  );

  const files = await build({ core, version, palettes });

  /* One file the site reads, so /design/system never imports across the repo
     boundary into design-system/. It is generated, so it cannot describe a
     token set that does not exist. */
  files.set(
    join(ROOT, "src", "data", "design-tokens.json"),
    JSON.stringify({
      _: "GENERATED by scripts/build-tokens.mjs. Do not hand-edit.",
      version,
      core,
      palettes,
    }, null, 2) + "\n",
  );

  if (argv.includes("--check")) {
    const drift = await check(files);
    if (drift.length) {
      console.error(`design-system ${version}: ${drift.length} generated file(s) do not match their source\n`);
      for (const d of drift) console.error("  " + d);
      console.error("\nEdit design-system/core.json or design-system/palettes/*.json, then rerun without --check.");
      process.exit(1);
    }
    console.log(`design-system ${version}: ${files.size} generated files match their source`);
    return;
  }

  if (argv.includes("--push")) {
    if (!only) {
      console.error("--push requires --only <set>. Migrating one set at a time is the");
      console.error("whole point: each one is reviewed before the next starts.");
      process.exit(2);
    }
    await push(only, files, version);
    return;
  }

  await rm(DIST, { recursive: true, force: true });
  await flush(files);
  console.log(`design-system ${version}: wrote ${files.size} files for ${names.length} products`);
  for (const n of names) console.log("  " + n);
}

/* Only run when invoked directly. migrate-set.mjs imports TARGETS from here,
   and a bare main() call meant importing the map also regenerated every file. */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
