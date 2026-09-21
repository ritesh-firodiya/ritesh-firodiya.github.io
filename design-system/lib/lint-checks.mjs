/**
 * The eleven checks behind /design/drift.
 *
 * Publishing a design system without publishing where it fails is marketing,
 * not documentation. Every check here produces a row on that page whether it
 * passes or not, and the page is linked from the design index at the same
 * weight as the system itself.
 *
 * Each check takes a `set` (see scripts/lint-designs.mjs for its shape) and
 * returns { id, ok, count, detail } — `count` so the page can say "430" rather
 * than "fails", which is the difference between a lint and an argument.
 */

/** Tailwind's own palette. A hue name in a class is a token that never existed. */
const HUES = [
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
];
const HUE_CLASS = new RegExp(
  `\\b(?:bg|text|border|ring|from|via|to|fill|stroke|decoration|outline|shadow|accent|divide|placeholder)-(?:${HUES.join("|")})-(?:50|\\d{3})\\b`,
  "g",
);

/**
 * Classes Tailwind cannot express, and therefore the only ones allowed to be
 * defined in CSS. Rule 5 is settled: utilities only. Anything else defined in
 * a stylesheet is a second source of truth for something a utility already
 * says, and it drifts — which is how four sets ended up with .btn meaning four
 * different paddings and .card meaning five different radii.
 */
export const STRUCTURAL = new Set([
  "phone", "pin-bottom", "breadcrumb", "breadcrumb-inner", "breadcrumb-label",
  "breadcrumb-chip", "screen-layout", "rationale", "rationale-title",
  "route-table", "mono", "num", "no-scrollbar", "lucide", "skel",
]);
/* Comments are prose. A `var(--token)` inside a file header explaining the
   convention is not a reference, and counting it as one is how a lint starts
   reporting its own documentation as a defect. */
const decomment = (s) => s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|\s)\/\/[^\n]*/g, "$1 ");

const hexes = (s) => decomment(s).match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
const varRefs = (s) => [...decomment(s).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]);
/* NOT anchored to line start: imposter packs three declarations onto one line
   (`--civilian: x;  --civilian-bg: y;  --civilian-fg: z;`) and an anchored
   regex sees only the first, then reports the other two as undefined. */
const varDefs = (s) => [...decomment(s).matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]);

/** 1. Every colour in the Tailwind config resolves to a variable. */
export function colorsAreVars(set) {
  if (!set.config) return skip("colors-are-vars", "no tailwind config");
  const block = colorsRegion(set.config);
  const bad = hexes(block);
  return res("colors-are-vars", bad.length === 0, bad.length, bad.slice(0, 8).join(" "));
}

/**
 * 2. Every var referenced is actually defined.
 *
 * This is the check that catches the silent-shadow class of bug: three amber
 * tokens referenced and never declared, so the shadow on 26 primary buttons
 * resolved to nothing for months with no error anywhere.
 */
export function varsDefined(set) {
  const defined = new Set([...varDefs(set.css), ...set.coreVars]);
  const missing = [...new Set([...varRefs(set.css), ...varRefs(set.config ?? "")])]
    .filter((v) => !defined.has(v))
    // A var() with a fallback is a deliberate optional, not an omission.
    .filter((v) => !new RegExp(`var\\(\\s*${v}\\s*,`).test(set.css + (set.config ?? "")));
  return res("vars-defined", missing.length === 0, missing.length, missing.slice(0, 8).join(" "));
}

/** 3. Colour keys are the canonical set, or declared reserved. */
export function canonicalKeys(set) {
  if (!set.palette) return skip("canonical-keys", "no palette declared");
  /* Gradients are declared tokens too. Leaving them out reported a set for
     using the very names its own palette defines. */
  const allowed = new Set([
    ...set.canonKeys,
    ...Object.keys(set.palette.reserved ?? {}),
    ...Object.keys(set.palette.gradients ?? {}),
    ...Object.keys(set.palette.shadows ?? {}).map((k) => `shadow-${k}`),
  ]);
  const declared = varDefs(set.css).map((v) => v.slice(2));
  const stray = declared.filter(
    (k) => !allowed.has(k) && !k.startsWith("shadow") && !set.coreVars.has(`--${k}`),
  );
  return res("canonical-keys", stray.length === 0, stray.length, stray.slice(0, 8).join(" "));
}

/** 4. The mechanical rule: CSS var name === Tailwind key path, dots as dashes. */
export function nameMatchesKey(set) {
  if (!set.config) return skip("name-matches-key", "no tailwind config");
  const bad = [];
  for (const [group, leaf, value] of configColorPairs(set.config)) {
    const expect = `--${leaf === "DEFAULT" ? group : `${group}-${leaf}`}`;
    const actual = value.match(/var\(\s*(--[\w-]+)/)?.[1];
    if (actual && actual !== expect) bad.push(`${group}.${leaf} -> ${actual} (want ${expect})`);
  }
  return res("name-matches-key", bad.length === 0, bad.length, bad.slice(0, 4).join("; "));
}

/** 5. No inline styles in screen markup. */
export function noInlineStyle(set) {
  let n = 0;
  const files = [];
  for (const { path, body } of set.screens) {
    const hits = (body.match(/\sstyle="/g) ?? []).length;
    if (hits) { n += hits; files.push(path); }
  }
  return res("no-inline-style", n === 0, n, files.slice(0, 5).join(" "));
}

/** 6. No default-Tailwind-palette classes. A hue name is a token that never was. */
export function noDefaultPalette(set) {
  let n = 0;
  const worst = [];
  for (const { path, body } of set.screens) {
    const hits = (body.match(HUE_CLASS) ?? []).length;
    if (hits) { n += hits; worst.push([path, hits]); }
  }
  worst.sort((a, b) => b[1] - a[1]);
  return res("no-default-palette", n === 0, n, worst.slice(0, 3).map(([p, c]) => `${p} (${c})`).join(" "));
}

/** 7. No component class Tailwind can already express. */
export function noComponentClasses(set) {
  const defined = [...new Set(
    [...set.css.matchAll(/^\.([a-zA-Z][\w-]*)/gm)].map((m) => m[1]),
  )];
  /* A set may declare its own structural classes in the palette — a game board
     is a device, not a component. They are allowed BY NAME and nothing else.
     Without this the shim simply deleted them, the check passed because there
     was no CSS left to fail, and the board rendered as one column. */
  const declared = new Set(set.palette?.structural?.classes ?? []);
  const stray = defined.filter(
    (c) => !STRUCTURAL.has(c) && !declared.has(c) && !c.startsWith("phone--"),
  );
  return res("no-component-classes", stray.length === 0, stray.length, stray.slice(0, 8).join(" "));
}

/** 8. The canon region of the config is byte-identical to the generated one. */
export function canonIdentical(set) {
  if (!set.config) return skip("canon-identical", "no tailwind config");
  const mine = canonRegion(set.config);
  if (!mine) return res("canon-identical", false, 1, "no CANON region — set predates the generator");
  return res("canon-identical", mine === set.expectedCanon, mine === set.expectedCanon ? 0 : 1,
    mine === set.expectedCanon ? "" : "canon region differs from design-system/core.json");
}

/** 9. CDN URLs are pinned. */
export function cdnPinned(set) {
  const bad = [];
  for (const { path, body } of set.screens) {
    for (const m of body.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      const url = m[1];
      if (!/tailwindcss|lucide/.test(url)) continue;
      const pinned = url === set.cdn.tailwind || url === set.cdn.lucide;
      if (!pinned) bad.push(`${path}: ${url}`);
    }
  }
  return res("cdn-pinned", bad.length === 0, bad.length, bad.slice(0, 2).join(" "));
}

/**
 * 10. Every token-ish class used resolves to a declared token.
 *
 * The one that catches `text-2xs` used 186 times and declared in one app, and
 * `tracking-label` used 9 times and declared nowhere. A class that resolves to
 * nothing does not warn — it just quietly does not paint.
 */
export function classesResolve(set) {
  if (!set.config) return skip("classes-resolve", "no tailwind config");
  const known = new Set(configTokenNames(set.config));
  const used = new Map();

  for (const { body } of set.screens) tally(classAttrs(body), known, used);
  for (const { body } of set.source) tally(stringLiterals(body), known, used);

  const ranked = [...used].sort((a, b) => b[1] - a[1]);
  const total = ranked.reduce((sum, [, c]) => sum + c, 0);
  return res("classes-resolve", total === 0, total,
    ranked.slice(0, 5).map(([t, c]) => `${t} (${c})`).join(" "));
}

const TOKEN_RE = /\b(?:bg|text|border|rounded|shadow|tracking|ring|fill|stroke|from|via|to|decoration|divide|placeholder|accent|outline)-([a-z0-9]+(?:-[a-z0-9]+)*)\b/g;

function tally(chunks, known, used) {
  for (const chunk of chunks) {
    for (const m of chunk.matchAll(TOKEN_RE)) {
      const token = m[1];
      if (known.has(token) || isBuiltin(token)) continue;
      used.set(token, (used.get(token) ?? 0) + 1);
    }
  }
}

/**
 * Only class attributes, never the whole file.
 *
 * Scanning raw markup meant `border-radius` in a <style> block scored as the
 * token `radius`, `text-align` as `align`, and a play.google.com URL as
 * `play`. A lint whose loudest finding is its own false positive gets muted,
 * and a muted lint is the state this estate was already in.
 */
function classAttrs(html) {
  return [...html.matchAll(/\bclass(?:Name)?\s*=\s*"([^"]*)"/g)].map((m) => m[1]);
}

/**
 * Source files keep classes in strings, maps and template literals.
 *
 * Only strings that ARE class lists count. Scanning every literal reported the
 * route "/how-to-play" as a use of the token `play` (via the `to-` prefix) and
 * read a code comment quoting bg-blue-600 as a live class. A lint whose top
 * findings are its own false positives gets ignored.
 */
const CLASSY = /^-?(?:[a-z][\w.-]*:)*[a-z][\w./-]*(?:\[[^\]]*\])?$/;
const COLOUR_BEARING = /^(?:[a-z-]+:)*(?:bg|text|border|rounded|shadow|ring|fill|stroke|from|via|to|tracking|divide|outline|placeholder|accent|decoration)-/;

function stringLiterals(src) {
  return [...decomment(src).matchAll(/["'`]([^"'`\n]{2,400})["'`]/g)]
    .map((m) => m[1])
    .filter((v) => {
      const parts = v.trim().split(/\s+/);
      return parts.every((p) => CLASSY.test(p)) && parts.some((p) => COLOUR_BEARING.test(p));
    });
}

/* ---- helpers ------------------------------------------------------------ */

function isBuiltin(token) {
  // Tailwind's own non-colour scales, the keyword utilities that share a prefix
  // with a colour one (text-center, rounded-full), and the single-letter
  // direction suffixes — `border-b` captures as the token `b`.
  return /^(?:[btlrxyse]|\d+(?:\.\d+)?|xs|sm|base|md|lg|xl|[2-9]xl|full|none|auto|left|right|center|justify|wrap|nowrap|balance|pretty|top|bottom|start|end|solid|dashed|dotted|double|hidden|current|transparent|inherit|black|white|tight|tighter|normal|wide|wider|widest|snug|relaxed|loose|clip|ellipsis|opacity|offset|inset|\[.*\])$/.test(token)
    || /^(?:[btlrxyse]|\d+)-/.test(token);
}

/**
 * Read a Tailwind config by EVALUATING it, not by scraping it.
 *
 * Every one of these files is `tailwind.config = { ... }` — a plain object
 * literal for the Play CDN. Regex-scraping it meant the parser only understood
 * the indentation the generator happens to emit, so six hand-written configs
 * came back empty and every token they declared was reported as an unresolved
 * class. Running the literal is both exact and shorter.
 */
function readConfig(source) {
  try {
    const tailwind = {};
    new Function("tailwind", "window", "module", source)(tailwind, { tailwind }, {});
    return tailwind.config?.theme?.extend ?? tailwind.config?.theme ?? null;
  } catch {
    return null;
  }
}

/** Walk a nested colour object into [group, leaf, value] triples. */
function* flattenColors(colors, group = null) {
  for (const [k, v] of Object.entries(colors ?? {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) yield* flattenColors(v, group ? `${group}-${k}` : k);
    else if (typeof v === "string") yield [group ?? k, group ? k : "DEFAULT", v];
  }
}

function colorsRegion(config) {
  const ext = readConfig(config);
  return ext?.colors ? JSON.stringify(ext.colors) : "";
}

function canonRegion(config) {
  const m = config.match(/==== CANON[\s\S]*?\*\/\n([\s\S]*?)\/\* ==== END CANON/);
  return m ? m[1].trim() : null;
}

function* configColorPairs(config) {
  const ext = readConfig(config);
  yield* flattenColors(ext?.colors);
}

/** Every class token the config makes real, colour and otherwise. */
function configTokenNames(config) {
  const ext = readConfig(config);
  const names = new Set();
  if (!ext) return names;

  for (const [group, leaf] of flattenColors(ext.colors)) {
    names.add(group);
    if (leaf !== "DEFAULT") names.add(`${group}-${leaf}`);
  }
  for (const scale of ["fontSize", "borderRadius", "boxShadow", "letterSpacing", "spacing", "maxWidth", "fontFamily", "backgroundImage"]) {
    for (const k of Object.keys(ext[scale] ?? {})) names.add(k === "DEFAULT" ? "" : k);
  }
  names.delete("");
  return names;
}

const res = (id, ok, count, detail) => ({ id, ok, count, detail: detail || "" });
const skip = (id, why) => ({ id, ok: null, count: 0, detail: why });

export const CHECKS = [
  colorsAreVars, varsDefined, canonicalKeys, nameMatchesKey, noInlineStyle,
  noDefaultPalette, noComponentClasses, canonIdentical, cdnPinned, classesResolve,
];
