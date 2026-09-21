/**
 * palettes/<app>.json -> src/global.css  and  src/theme/tokens.ts
 *
 * The runtime half. Emitting both sides from one source is the point of the
 * whole exercise: a token cannot exist on one side only, which is the entire
 * class of bug the audit found — `text-2xs` used 186 times and declared in one
 * app, `tracking-label` used 9 times and declared nowhere, aakalan's `settled`
 * and `ink-inverse` referenced by the design and absent from the app,
 * imposter's Mr White tokens surviving a feature deletion.
 *
 * DARK MODE IS A TOKEN SCOPE, never a `dark:` prefix. Tokens are redefined
 * inside uniwind's @variant blocks, so `bg-surface` works in both themes with
 * no prefix — aakalan writes zero `dark:` utilities across its whole source.
 * `useColorScheme()` is banned: tic-tac-toe's own Themed.tsx documents that it
 * disagrees with uniwind on the static web build, and charades uses it anyway
 * in two files. Read theme through useUniwind().theme instead.
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { banner, entries, reservedValue } from "./tokens.mjs";

/** Tailwind v4 namespaces the theme layer. --ink-2 becomes --color-ink-2. */
const colorVar = (k) => `--color-${k}`;

function allColors(palette, themeName) {
  const theme = palette.themes[themeName] ?? {};
  const reserved = Object.fromEntries(
    entries(palette.reserved)
      .map(([k, e]) => [k, reservedValue(e, themeName)])
      .filter(([, v]) => v != null),
  );
  return { ...theme, ...reserved };
}

function scaleBlock(core, surface) {
  const s = core[surface];
  const out = [];
  for (const [step, spec] of entries(s.type)) {
    out.push(`  --text-${step}: ${spec.size};`);
    if (spec.leading) out.push(`  --text-${step}--line-height: ${spec.leading};`);
    if (spec.tracking) out.push(`  --text-${step}--letter-spacing: ${spec.tracking};`);
  }
  out.push("");
  for (const [k, v] of entries(s.radius)) {
    // The phone frame is wireframe chrome. It has no meaning inside the app.
    if (k === "phone") continue;
    out.push(`  --radius-${k === "DEFAULT" ? "card" : k}: ${v};`);
  }
  out.push("");
  for (const [k, v] of entries(s.tracking)) out.push(`  --tracking-${k}: ${v};`);
  return out;
}

export async function emitGlobalCss({ core, surface, palette, version, dir }) {
  const themeNames = entries(palette.themes).map(([n]) => n);
  const out = [
    banner(version, `core.json + palettes/${palette.name}.json`),
    "",
    "@import 'tailwindcss';",
    "@import 'uniwind';",
    "",
    "/* Scales. Identical in every app — see design-system/core.json. */",
    "@theme {",
    ...scaleBlock(core, surface),
    "}",
    "",
  ];

  out.push("/* Colours. A theme is a remap of the same names, so no utility in");
  out.push("   the source ever needs a dark: prefix. */");
  out.push("@layer theme {");
  out.push("  :root {");
  for (const name of themeNames) {
    out.push(`    @variant ${name} {`);
    for (const [k, v] of Object.entries(allColors(palette, name))) {
      out.push(`      ${colorVar(k)}: ${v};`);
    }
    out.push(`    }`);
  }
  if (themeNames.length === 1) {
    out.push("");
    out.push("    /* Single-theme product. Uniwind resolves a missing variant to");
    out.push("       black rather than falling back, so the one theme is declared");
    out.push("       under both names. */");
    const only = themeNames[0];
    const other = only === "light" ? "dark" : "light";
    out.push(`    @variant ${other} {`);
    for (const [k, v] of Object.entries(allColors(palette, only))) {
      out.push(`      ${colorVar(k)}: ${v};`);
    }
    out.push(`    }`);
  }
  out.push("  }");
  out.push("}");
  out.push("");
  out.push(await readFile(join(dir, "templates", "runtime-utilities.css"), "utf8"));

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

/**
 * The JS mirror, for the values a className genuinely cannot carry: lucide's
 * `color` prop, LinearGradient stops, shadow objects, icon sizes.
 *
 * aakalan kept this by hand and wrote a test to prove it agreed with the CSS.
 * That test was the only design-token check in the tree, and generating the
 * file replaces it with something stronger: the two cannot disagree.
 */
export function emitTokensTs({ palette, version }) {
  const themeNames = entries(palette.themes).map(([n]) => n);
  const byTheme = Object.fromEntries(
    themeNames.map((n) => [n, allColors(palette, n)]),
  );
  const keys = [...new Set(themeNames.flatMap((n) => Object.keys(byTheme[n])))].sort();

  const lines = [
    banner(version, `palettes/${palette.name}.json`, "js"),
    "",
    "/**",
    " * Use a className wherever one works. This file is for the props that",
    " * cannot take one — lucide's `color`, LinearGradient stops, shadow objects.",
    " * Read it through useColors() so it follows the active theme; importing a",
    " * theme directly re-introduces the hard-coded hex this file exists to kill.",
    " */",
    "",
    `export type ThemeName = ${themeNames.map((n) => `"${n}"`).join(" | ")};`,
    "",
    "export const COLORS = {",
  ];
  for (const name of themeNames) {
    lines.push(`  ${name}: {`);
    for (const k of keys) {
      const v = byTheme[name][k];
      if (v == null) continue;
      lines.push(`    ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    }
    lines.push(`  },`);
  }
  lines.push("} as const satisfies Record<ThemeName, Record<string, string>>;");
  lines.push("");

  const grads = entries(palette.gradients);
  if (grads.length) {
    lines.push("/* Gradients are CSS in the wireframes and stop arrays in the app.");
    lines.push("   The raw declarations are kept so the two can be compared by eye");
    lines.push("   at review; the app reads the stops. */");
    lines.push("export const GRADIENT_CSS = {");
    for (const [k, v] of grads) lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
    lines.push("} as const;");
    lines.push("");
  }

  lines.push("export const ICON_SIZE = { xs: 14, sm: 16, md: 18, lg: 20, tab: 22, fab: 28 } as const;");
  lines.push("");
  return lines.join("\n");
}
