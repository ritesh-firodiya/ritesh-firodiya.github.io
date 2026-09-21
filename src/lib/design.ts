import auditRaw from "@/data/design-audit.json";
import tokensRaw from "@/data/design-tokens.json";

/**
 * Reads the two generated files behind /design.
 *
 * Both are written by scripts — design-audit.json by lint-designs.mjs and
 * design-tokens.json by build-tokens.mjs — for the same reason PROJECTS.md is
 * generated: the drift table was hand-written in the wireframe, which made it
 * accurate on the day it was drawn and decayed from then on. A page that
 * claims to be the lint output has to actually be the lint output.
 */

export type Check = { id: string; ok: boolean | null; count: number; detail: string };

export type AuditSet = {
  name: string;
  product: string;
  path: string;
  screens: number;
  stylesheets: number;
  hasPalette: boolean;
  hasConfig: boolean;
  verdict: string;
  checks: Check[];
};

export const audit = auditRaw as unknown as {
  version: string;
  generatedAt: string;
  blocking: string[];
  sets: AuditSet[];
};

type TypeStep = { size: string; leading?: string; tracking?: string };
export type Palette = {
  name: string;
  product: string;
  surfaces?: string[];
  _?: string[];
  shadowTint?: string;
  themes: Record<string, Record<string, string>>;
  reserved?: Record<string, unknown>;
  scopes?: Record<string, unknown>;
  gradients?: Record<string, string>;
};

export const tokens = tokensRaw as unknown as {
  version: string;
  core: {
    shared: {
      colorKeys: { ramps: string[]; required: string[]; flat: string[]; renamed: Record<string, string> };
      cdn: { tailwind: string; lucide: string };
    };
    mobile: { type: Record<string, TypeStep>; radius: Record<string, string>; tracking: Record<string, string> };
    web: { type: Record<string, TypeStep>; radius: Record<string, string> };
  };
  palettes: Palette[];
};

export const sets = audit.sets;
export const palettes = tokens.palettes;

export const notes = (p: { _?: string[] | string }): string[] =>
  Array.isArray(p._) ? p._ : p._ ? [p._] : [];

/**
 * The first paragraph of a note.
 *
 * Notes are stored as wrapped lines so the JSON stays readable at 80 columns,
 * with an empty string between paragraphs. Taking `notes(p)[0]` therefore took
 * one line and cut the sentence in half.
 */
export function lead(p: { _?: string[] | string }): string {
  const lines = notes(p);
  const end = lines.indexOf("");
  return (end === -1 ? lines : lines.slice(0, end)).join(" ").trim();
}

/** Prose keys (`_`, `_pending`) are documentation and never render as tokens. */
export const realKeys = (o: Record<string, unknown> | undefined): string[] =>
  Object.keys(o ?? {}).filter((k) => !k.startsWith("_"));

export const paletteFor = (name: string) => palettes.find((p) => p.name === name);

export const checkOf = (s: AuditSet, id: string) => s.checks.find((c) => c.id === id);

export const isBlocking = (id: string) => audit.blocking.includes(id);

/** Sets that have a token layer at all. The other three are the headline. */
export const measured = sets.filter((s) => s.hasConfig);
export const unmeasured = sets.filter((s) => !s.hasConfig);

/**
 * "Found in N of M sets" for a rule that maps onto a check.
 *
 * Only counts sets the check actually ran on — a set with no token layer did
 * not pass rule 4 and did not fail it, and rolling those into the denominator
 * would make every rule look better the more unmeasured sets exist.
 */
export function tally(ids: string[]): { pass: number; of: number } {
  const ran = sets.filter((s) => ids.every((id) => checkOf(s, id)?.ok !== null));
  const pass = ran.filter((s) => ids.every((id) => checkOf(s, id)?.ok === true));
  return { pass: pass.length, of: ran.length };
}

export const withTwoThemes = palettes.filter((p) => Object.keys(p.themes).length > 1);
export const withReserved = palettes.filter((p) => realKeys(p.reserved).length > 0);

/** Totals for the headline counters on /design. */
export const totals = {
  sets: sets.length,
  screens: sets.reduce((n, s) => n + s.screens, 0),
  products: palettes.length,
  violations: sets.reduce(
    (n, s) => n + s.checks.filter((c) => c.ok === false).length,
    0,
  ),
};
