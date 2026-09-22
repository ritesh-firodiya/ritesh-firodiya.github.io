#!/usr/bin/env node
/**
 * Prove that adopting the canon changes no colour on any screen.
 *
 *   node scripts/verify-retoken.mjs
 *
 * A retoken must be INVISIBLE. Only names change — indigo-500 becomes
 * brand-500, --text-primary becomes --ink — and if a value moves at the same
 * time, the migration stops being a rename and becomes a redesign that nobody
 * reviewed. That is the difference between a safe mechanical change across 150
 * screens and a change that needs 150 screens re-approved.
 *
 * Every difference this prints must be one somebody signed off on. Today that
 * is exactly one set: Charades, whose wireframe moves to the shipped app's
 * ramp — the single documented inversion of "the wireframe is the spec".
 * See design-system/palettes/charades.json and /design/drift.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const APPS = join(homedir(), "git", "products");
const DIST = join(process.cwd(), "design-system", "dist");

/** canonical key -> the name(s) the sets used before the rename. */
const RENAME = {
  page: ["page-bg", "page"], frame: ["phone-bg"], surface: ["surface"],
  muted: ["surface-muted", "muted"], sunken: ["surface-sunken", "sunken"],
  ink: ["text-primary", "ink"], "ink-2": ["text-secondary", "ink-2"],
  "ink-3": ["text-tertiary", "ink-3"], "ink-4": ["text-quaternary", "ink-4"],
  "ink-inverse": ["text-inverse", "ink-inv"],
  line: ["border", "line"], "line-strong": ["border-strong", "line-strong"],
  warn: ["warning", "warn"], "warn-bg": ["warning-bg", "warn-bg"], "warn-fg": ["warning-fg", "warn-fg"],
  "role-civilian": ["civilian"], "role-civilian-bg": ["civilian-bg"], "role-civilian-fg": ["civilian-fg"],
  "role-imposter": ["imposter"], "role-imposter-bg": ["imposter-bg"], "role-imposter-fg": ["imposter-fg"],
  "page-2": ["page-bg-2"],
};

/** Per-set ramp provenance: which hue name `brand` and `accent` came from. */
const RAMP = {
  aakalan: { brand: "indigo", accent: "saffron" },
  askcal: { brand: "brand", accent: "ask" },
  charades: { brand: "navy", accent: "gold" },
  imposter: { brand: "accent" },
  "plan-kid": { brand: "teal", accent: "coral" },
  "tic-tac-toe": {},
};

/** Changes that were reviewed and approved. Anything else is a regression. */
const APPROVED = {
  charades:
    "the wireframe moves to the shipped app's ramp — the one documented " +
    "inversion of 'the wireframe is the spec'",
};

const vars = (css) =>
  Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+)/g)].map((m) => [m[1].slice(2), m[2].trim()]));

/** A rename is invisible, so compare with the ramp names mapped back. */
function norm(value, set) {
  let s = value.replace(/\s+/g, " ").trim().toLowerCase();
  for (const [canon, old] of Object.entries(RAMP[set] ?? {})) {
    s = s.replaceAll(`--${canon}-`, `--${old}-`);
  }
  return s;
}

async function compare(set) {
  const shared = await readFile(join(APPS, set, ".context/designs/mobile/shared.css"), "utf8");
  const i = shared.indexOf(":root");
  const before = vars(shared.slice(i, shared.indexOf("\n}", i)));

  const tokens = await readFile(join(DIST, set, "mobile", "tokens.css"), "utf8");
  const after = vars(tokens.match(/:root \{([\s\S]*?)\n\}/)[1]);

  const diffs = [];
  let compared = 0;
  for (const [key, value] of Object.entries(after)) {
    if (key.startsWith("shadow") || key.startsWith("font-")) continue;
    const ramp = key.match(/^(brand|accent)-(\d+)$/);
    const old = ramp && RAMP[set][ramp[1]]
      ? before[`${RAMP[set][ramp[1]]}-${ramp[2]}`]
      : RENAME[key]?.map((n) => before[n]).find((v) => v !== undefined) ?? before[key];
    if (old === undefined) continue; // newly declared, nothing to contradict
    compared++;
    if (norm(old, set) !== norm(value, set)) diffs.push({ key, value, old });
  }
  return { compared, diffs };
}

const sets = Object.keys(RAMP);
let unapproved = 0;
let total = 0;

console.log("\nRetoken safety — every value that moved, and whether anyone approved it\n");
for (const set of sets) {
  const { compared, diffs } = await compare(set);
  total += compared;
  const ok = diffs.length === 0;
  const approved = APPROVED[set];
  if (!ok && !approved) unapproved += diffs.length;
  console.log(
    `  ${set.padEnd(14)}${String(compared).padStart(4)} tokens   ` +
      (ok ? "unchanged" : `${diffs.length} changed${approved ? " (approved)" : " — UNAPPROVED"}`),
  );
  if (!ok) {
    if (approved) console.log(`  ${" ".repeat(14)}            ${approved}`);
    for (const d of diffs) console.log(`  ${" ".repeat(14)}            ${d.key}: ${d.old} → ${d.value}`);
  }
}

console.log(`\n  ${total} tokens compared across ${sets.length} sets.`);
if (unapproved) {
  console.error(`\n  ${unapproved} unapproved value change(s). A retoken must be invisible.`);
  process.exit(1);
}
console.log("  Every change is one that was signed off. Safe to migrate.\n");
