#!/usr/bin/env node
/**
 * Assert the contrast ratios the palettes claim — in BOTH themes, in BOTH
 * files that declare them.
 *
 * A palette comment saying "5.3:1 on page" is a claim, and a claim nobody
 * checks decays the first time a value is nudged. The theme this replaced
 * carried a grey at 2.9:1 while a comment beside it said otherwise.
 *
 * Two files, because two declare the same role names: the app's globals.css
 * and the design set's shared.css. Checking one lets the other drift, and the
 * set is where a colour is chosen before it ever reaches the app.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFile } from "node:fs/promises";

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

/** `--color-x: #hex` and `--x: #hex` both, so one parser serves both files. */
const tokensIn = (block) =>
  Object.fromEntries(
    [...block.matchAll(/--(?:color-)?([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]),
  );

/**
 * Slice one file into its two palettes.
 *
 * The boundaries are the whole difficulty. An earlier version ended the light
 * slice at a marker that sat AFTER the dark block, so the light scan swallowed
 * it, last-wins kept the dark values, and both columns printed the dark
 * palette while reporting every pair as passing. A checker that silently
 * grades the wrong thing is worse than no checker — hence `assertDistinct`.
 */
function split(css, { lightFrom, lightTo, darkFrom }) {
  const a = css.indexOf(lightFrom);
  const b = css.indexOf(lightTo);
  const c = css.indexOf(darkFrom);
  if (a < 0 || b < 0 || c < 0) throw new Error("palette markers not found — has the file been restructured?");
  if (!(a < b && b <= c)) throw new Error("palette markers are out of order — the slices would overlap");
  const light = tokensIn(css.slice(a, b));
  const dark = { ...light, ...tokensIn(css.slice(c, css.indexOf("\n}", c))) };
  return { light, dark };
}

function assertDistinct(name, light, dark) {
  if (light.page === dark.page && light.ink === dark.ink) {
    throw new Error(`${name}: light and dark parsed identical — the slice boundaries are wrong`);
  }
}

const AA = 4.5, UI = 3;
/** [foreground, background, minimum, what it is for] */
const PAIRS = [
  ["ink", "page", AA, "body text"],
  ["ink", "surface", AA, "body on a card"],
  ["ink", "muted", AA, "body on a muted band"],
  ["ink-2", "page", AA, "secondary text"],
  ["ink-3", "page", AA, "the quiet floor — §8 says it must still pass"],
  ["ink-4", "page", UI, "disabled / struck through only, UI minimum"],
  ["brand-500", "page", AA, "body links, not only decoration"],
  ["brand-500", "surface", AA, "links on a card"],
  /* accent is the hot red and is UI-minimum ON PURPOSE: it is for filled
     fields and display type, never a sentence. If it ever passes AA it has
     probably been dulled into a second brand colour. */
  ["accent-500", "page", UI, "FIELDS AND DISPLAY TYPE ONLY — never small text"],
  ["band-ink", "band", AA, "inverted band — footer, contact"],
  ["band-2", "band", UI, "quiet text on an inverted band"],
  ["success-fg", "success-bg", AA, "status pill"],
  ["warn-fg", "warn-bg", AA, "status pill"],
  ["danger-fg", "danger-bg", AA, "status pill"],
  ["info-fg", "info-bg", AA, "status pill"],
  ["m-free", "m-free-bg", AA, "model pill"],
  ["m-ads", "m-ads-bg", AA, "model pill"],
  ["m-once", "m-once-bg", AA, "model pill"],
  ["m-sub", "m-sub-bg", AA, "model pill"],
  ["m-year", "m-year-bg", AA, "model pill"],
  ["live", "live-bg", AA, "state pill"],
  ["beta", "beta-bg", AA, "state pill"],
  ["build", "build-bg", AA, "state pill"],
  ["idea", "idea-bg", AA, "state pill"],
];

const FILES = [
  {
    name: "app · src/app/globals.css",
    url: new URL("../src/app/globals.css", import.meta.url),
    lightFrom: "@theme",
    lightTo: "/* ═══ Dark",
    darkFrom: ':root[data-theme="dark"] {\n    --color-page',
  },
  {
    name: "set · .context/designs/web/shared.css",
    url: new URL("../.context/designs/web/shared.css", import.meta.url),
    lightFrom: "   PALETTE — ritesh",
    lightTo: "\n.phone--dark {",
    darkFrom: "\n.phone--dark {",
  },
];

let failed = 0;
const vocab = {};

for (const f of FILES) {
  const css = await readFile(f.url, "utf8");
  const { light, dark } = split(css, f);
  assertDistinct(f.name, light, dark);
  vocab[f.name] = new Set(Object.keys(light));
  console.log(`\n\x1b[1m${f.name}\x1b[0m`);
  let skipped = 0;
  for (const [name, tokens] of [["  light", light], ["  dark ", dark]]) {
    console.log(name);
    for (const [fg, bg, min, why] of PAIRS) {
      /* A pair naming a token this file does not declare is SKIPPED, not
         failed. The two files are allowed to be out of step while a redesign
         is pending — the set is drawn before the app adopts it, which is the
         whole point of approving designs first. Ratios are this script's job;
         inventory drift is reported below instead, where it cannot be
         mistaken for a contrast failure. */
      if (!tokens[fg] || !tokens[bg]) { skipped++; continue; }
      const r = ratio(tokens[fg], tokens[bg]);
      const ok = r >= min;
      if (!ok) failed++;
      console.log(`    ${ok ? "ok " : "FAIL"} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} on ${bg} — ${why}`);
    }
  }
  if (skipped) console.log(`    (${skipped / 2} pair(s) skipped — token not declared in this file)`);
}

/* Say plainly where the two vocabularies differ. Silence here is how the app
   and the set drift into two design systems wearing one name. */
const [a, b] = Object.keys(vocab);
const only = (x, y) => [...vocab[x]].filter((t) => !vocab[y].has(t)).sort();
const [oa, ob] = [only(a, b), only(b, a)];
if (oa.length || ob.length) {
  console.log("\n\x1b[1minventory\x1b[0m — the two files do not declare the same roles");
  if (oa.length) console.log(`  only in ${a}:\n    ${oa.join(", ")}`);
  if (ob.length) console.log(`  only in ${b}:\n    ${ob.join(", ")}`);
  console.log("  Expected while a redesign is drawn and not yet built. Not expected once it is.");
} else {
  console.log("\n\x1b[1minventory\x1b[0m — both files declare the same roles");
}

console.log(failed ? `\n${failed} pair(s) below their minimum` : "\nall declared pairs pass, both palettes, both files");
process.exit(failed ? 1 : 0);
