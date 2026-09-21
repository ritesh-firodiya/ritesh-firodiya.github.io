/**
 * core.json (+ the structural template) -> core.css
 *
 * Layer 1: every value that is not a colour, as a CSS custom property, plus
 * the short list of structural classes Tailwind cannot express.
 *
 * FULL VAR INDIRECTION, on purpose. The existing sets only put colours behind
 * variables and wrote radii and type sizes as literals in the Tailwind config.
 * That is where rule 4 leaked: a literal compiled into a utility cannot be
 * re-scoped, cannot be read back by the lint, and is exactly how tic-tac-toe
 * ended up with rounded-2xl meaning 28px while every sibling meant 24px. Here
 * every scale is a variable, so check 1 is one rule for one file type and a
 * rescale is a one-file change.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { banner, entries } from "./tokens.mjs";

const NL = "\n";

function typeVars(type) {
  const out = [];
  for (const [step, spec] of entries(type)) {
    out.push(`  --fs-${step}: ${spec.size};`);
    if (spec.leading) out.push(`  --lh-${step}: ${spec.leading};`);
    if (spec.tracking) out.push(`  --ls-${step}: ${spec.tracking};`);
  }
  return out;
}

function radiusVars(radius) {
  return entries(radius).map(
    ([k, v]) => `  --radius${k === "DEFAULT" ? "" : `-${k}`}: ${v};`,
  );
}

function shadowVars(shared, surface) {
  const out = [];
  const a = shared.shadowGeometry.alphaDefaults;
  out.push(`  /* Overridden per product; a dark palette needs far more alpha. */`);
  out.push(`  --shadow-a1: ${a.a1};`, `  --shadow-a2: ${a.a2};`, `  --shadow-a3: ${a.a3};`);
  for (const [k, v] of entries(shared.shadowGeometry)) {
    if (k === "alphaDefaults") continue;
    out.push(`  --shadow${k === "DEFAULT" ? "" : `-${k}`}: ${v};`);
  }
  for (const [k, v] of entries(surface.shadow)) {
    out.push(`  --shadow-${k}: ${v};`);
  }
  return out;
}

export async function emitCoreCss({ core, surface, version, dir }) {
  const s = core[surface];
  const lines = [banner(version, "core.json"), ""];

  lines.push(`:root {`);
  lines.push(`  --font-sans: ${core.shared.font.sans.join(", ")};`);
  lines.push(`  --font-mono: ${core.shared.font.mono.join(", ")};`);
  lines.push("");
  lines.push(...typeVars(s.type));
  lines.push("");
  for (const [k, v] of entries(s.tracking)) lines.push(`  --tracking-${k}: ${v};`);
  lines.push("");
  lines.push(...radiusVars(s.radius));
  lines.push("");
  lines.push(...shadowVars(core.shared, s));

  if (s.frame) {
    lines.push("");
    lines.push(`  --frame-w: ${s.frame.width};`);
    lines.push(`  --frame-h: ${s.frame.height};`);
  }
  for (const [k, v] of entries(s.spacing)) lines.push(`  --sp-${k}: ${v};`);
  for (const [k, v] of entries(s.maxWidth)) lines.push(`  --w-${k}: ${v};`);
  lines.push(`}`, "");

  if (surface === "mobile") {
    lines.push(await readFile(join(dir, "templates", "structural-mobile.css"), "utf8"));
  }
  return lines.join(NL).replace(/\n{3,}/g, "\n\n");
}
