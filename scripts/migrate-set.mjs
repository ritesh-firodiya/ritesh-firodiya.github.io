#!/usr/bin/env node
/**
 * Rewrite one set's screens and app source onto the canonical token names.
 *
 *   node scripts/build-tokens.mjs --only <set> --push    # 1. the token files
 *   node scripts/migrate-set.mjs <set> --dry             # 2. preview
 *   node scripts/migrate-set.mjs <set>                   # 3. apply
 *   node scripts/lint-designs.mjs                        # 4. check
 *
 * Every edit is a rename or a 1:1 translation of something the markup already
 * said. Nothing changes a value — `scripts/verify-retoken.mjs` proves that
 * separately, and it only holds because this script never guesses.
 *
 * Declarations it does not recognise are LEFT ALONE and counted. The leftover
 * number is the honest size of the hand-work still to do, which is more useful
 * than a clean run that quietly approximated.
 */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { execSync } from "node:child_process";

import {
  renameVars, renameClasses, inlineStylesToUtilities, collapseDarkPairs, typeScaleLookup,
} from "../design-system/lib/codemod.mjs";
import { renameClassStrings } from "../design-system/lib/class-strings.mjs";
import { TARGETS } from "./build-tokens.mjs";

const DS = join(process.cwd(), "design-system");

async function walk(dir, exts, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

async function main() {
  const [name, ...flags] = process.argv.slice(2);
  const dry = flags.includes("--dry");
  if (!name) { console.error("usage: migrate-set.mjs <set> [--dry]"); process.exit(2); }

  const palette = JSON.parse(await readFile(join(DS, "palettes", `${name}.json`), "utf8"));
  const core = JSON.parse(await readFile(join(DS, "core.json"), "utf8"));
  const migrate = palette.migrate;
  if (!migrate) {
    console.error(`palettes/${name}.json has no "migrate" map. Add one — it is the`);
    console.error(`record of what this set called things before, and the only way the`);
    console.error(`rewrite is reviewable rather than magic.`);
    process.exit(2);
  }

  const target = TARGETS[name];
  const anchor = target.design ?? target.runtime;
  const repo = execSync(`git -C ${anchor} rev-parse --show-toplevel`, { encoding: "utf8" }).trim();

  const classMap = { ...migrate.classes };
  delete classMap.__raw;
  const rawMap = migrate.classes.__raw ?? {};
  const typeScale = typeScaleLookup(core.mobile.type);

  const stats = { files: 0, styles: 0, darks: 0, pinned: 0, leftovers: [] };

  // ---- wireframes -------------------------------------------------------
  for (const file of await walk(target.design, [".html"])) {
    const before = await readFile(file, "utf8");
    let text = renameVars(before, migrate.vars);
    text = renameClasses(text, { ...classMap, ...rawMap });
    const styled = inlineStylesToUtilities(text, { typeScale, explicit: migrate.styles ?? {} });
    text = styled.text;
    /* Pin the CDN. Every Tailwind and lucide load in the estate was unpinned,
       so a CDN release could restyle 560 screens with nothing in the repo
       changing. */
    for (const [from, to] of [
      [/https:\/\/cdn\.tailwindcss\.com(?!\/)/g, core.shared.cdn.tailwind],
      [/https:\/\/unpkg\.com\/lucide@latest\/dist\/umd\/lucide\.js/g, core.shared.cdn.lucide],
    ]) {
      const before2 = text;
      text = text.replace(from, to);
      if (text !== before2) stats.pinned++;
    }
    stats.styles += styled.converted;
    stats.leftovers.push(...styled.leftovers.map((l) => `${relative(repo, file)}: ${l}`));
    if (text !== before) {
      stats.files++;
      if (!dry) await writeFile(file, text, "utf8");
    }
  }

  // ---- app source -------------------------------------------------------
  if (target.runtime) {
    for (const file of await walk(target.runtime, [".tsx", ".jsx", ".ts"])) {
      if (file.endsWith("theme/tokens.ts")) continue; // generated
      const before = await readFile(file, "utf8");
      const map = { ...classMap, ...rawMap };
      let text = renameClasses(before, map, { jsx: true });
      /* Class lists kept in plain constants never appear in a class attribute
         — constants/styles.ts holds this app's primary button as a string. */
      text = renameClassStrings(text, map, (t, m) => renameClasses(t, m)).text;
      const collapsed = collapseDarkPairs(text);
      text = collapsed.text;
      stats.darks += collapsed.removed;
      if (text !== before) {
        stats.files++;
        if (!dry) await writeFile(file, text, "utf8");
      }
    }
  }

  const counts = new Map();
  for (const l of stats.leftovers) {
    const prop = l.split(": ").slice(1).join(": ").split(":")[0];
    counts.set(prop, (counts.get(prop) ?? 0) + 1);
  }

  console.log(`\n${dry ? "DRY RUN — " : ""}migrate ${name}\n`);
  console.log(`  files rewritten        ${stats.files}`);
  console.log(`  inline styles folded   ${stats.styles}`);
  console.log(`  dark: variants removed ${stats.darks}`);
  console.log(`  CDN loads pinned       ${stats.pinned}`);
  console.log(`  styles left by hand    ${stats.leftovers.length}`);
  if (counts.size) {
    console.log("");
    for (const [prop, n] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
      console.log(`    ${String(n).padStart(4)}  ${prop}`);
    }
  }
  console.log(`\n  ${dry ? "Nothing written." : `Review: git -C ${repo} diff`}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
