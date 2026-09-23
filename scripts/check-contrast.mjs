#!/usr/bin/env node
/**
 * Assert the contrast ratios globals.css claims, in BOTH themes.
 *
 * A palette comment that says "4.6:1 on paper" is a claim, and a claim nobody
 * checks decays the first time a value is nudged. The theme this site replaced
 * used a grey at 2.9:1 that failed AA outright while a comment beside it said
 * otherwise. So the ratios are computed from the file rather than remembered.
 *
 * Both themes matter equally: a dark palette hand-written to "look about right"
 * is exactly where a quiet label lands at 3:1 and nobody notices, because the
 * person who wrote it reads it on the display it was tuned on.
 *
 *   node scripts/check-contrast.mjs
 */
import { readFile } from "node:fs/promises";

const CSS = new URL("../src/app/globals.css", import.meta.url);

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

/** Pull `--color-x: #hex;` pairs out of one brace-delimited block. */
const tokensIn = (block) =>
  Object.fromEntries([...block.matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

const css = await readFile(CSS, "utf8");

/* Light lives in @theme; dark in the [data-theme="dark"] block, which repeats
   every declaration, so it is read whole and layered over light.

   The light slice MUST stop at the dark section. The first version of this
   ended it at "Section rhythm", which sits after the dark blocks — so the
   light scan swallowed them, Object.fromEntries kept the last value of each
   token, and both columns printed the dark palette while reporting 25 passes.
   A checker that silently grades the wrong thing is worse than no checker,
   which is why the assertion below exists. */
const lightEnd = css.indexOf("/* ═══ Dark");
if (lightEnd < 0) throw new Error("cannot find the dark section — has globals.css been restructured?");
const light = tokensIn(css.slice(css.indexOf("@theme"), lightEnd));

const darkStart = css.indexOf(':root[data-theme="dark"] {\n    --color-page');
if (darkStart < 0) throw new Error("cannot find the [data-theme=dark] palette block");
const dark = { ...light, ...tokensIn(css.slice(darkStart, css.indexOf("\n}", darkStart))) };

/* If the two palettes parse identical, one of the slices is wrong — a real
   dark theme never reuses the light page colour. */
if (light["page"] === dark["page"] && light["ink"] === dark["ink"]) {
  throw new Error("light and dark parsed to the same values — the slice boundaries are wrong");
}

/* [foreground, background, minimum, what it is for] */
const AA = 4.5, UI = 3;
const PAIRS = [
  ["ink", "page", AA, "body text"],
  ["ink", "surface", AA, "body on a card"],
  ["ink", "muted", AA, "body on a muted band"],
  ["ink", "sunken", AA, "body on a sunken band"],
  ["ink-2", "page", AA, "secondary text"],
  ["ink-2", "surface", AA, "secondary on a card"],
  ["ink-3", "page", AA, "the quiet floor — §8 says it must still pass"],
  ["ink-3", "surface", AA, "quiet on a card"],
  ["ink-4", "page", UI, "disabled / struck through only, UI minimum"],
  ["brand-500", "page", AA, "body links, not only decoration"],
  ["brand-500", "surface", AA, "links on a card"],
  ["ink-inverse", "ink", AA, "inverted band"],
  ["success-fg", "success-bg", AA, "status pill"],
  ["warn-fg", "warn-bg", AA, "status pill"],
  ["danger-fg", "danger-bg", AA, "status pill"],
  ["info-fg", "info-bg", AA, "status pill"],
  ["m-free", "m-free-wash", AA, "model pill"],
  ["m-ads", "m-ads-wash", AA, "model pill"],
  ["m-once", "m-once-wash", AA, "model pill"],
  ["m-sub", "m-sub-wash", AA, "model pill"],
  ["m-year", "m-year-wash", AA, "model pill"],
  ["live", "live-wash", AA, "state pill"],
  ["beta", "beta-wash", AA, "state pill"],
  ["build", "build-wash", AA, "state pill"],
  ["design", "design-wash", AA, "state pill"],
];

let failed = 0;
for (const [name, tokens] of [["light", light], ["dark", dark]]) {
  console.log(`\n${name}`);
  for (const [fg, bg, min, why] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) {
      console.log(`  ?     ${fg} on ${bg} — undeclared`);
      failed++;
      continue;
    }
    const r = ratio(tokens[fg], tokens[bg]);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`  ${ok ? "ok " : "FAIL"} ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${fg} on ${bg} — ${why}`);
  }
}

console.log(failed ? `\n${failed} pair(s) below their minimum` : "\nall pairs pass");
process.exit(failed ? 1 : 0);
