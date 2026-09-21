/**
 * palettes/<app>.json -> tokens.css
 *
 * Layer 2: the colours, and only the colours.
 *
 * A theme is a scope remap, never a second set of utilities (rule 07). The
 * same token names are redefined inside `.phone--dark`, so a utility written
 * against a variable follows whichever scope it lands in. No markup changes,
 * and nothing can be dark in one place and light in another.
 *
 * Reserved tokens are emitted into the same scopes as the canonical ones. That
 * matters: aakalan's seven category pairs all have dark values, and a reserved
 * colour that only exists in light is how a category plate goes unreadable at
 * night without anything failing.
 */
import { banner, entries, reservedValue } from "./tokens.mjs";

function block(selector, pairs, indent = "  ") {
  if (!pairs.length) return [];
  assertNoCollision(selector, pairs);
  return [`${selector} {`, ...pairs.map(([k, v]) => `${indent}--${k}: ${v};`), `}`, ""];
}

/**
 * Two declarations of one name in one block is a silent bug, not a warning.
 *
 * tic-tac-toe declared `mark-x` as a reserved colour AND as a gradient. The
 * gradient was emitted second and won, so X rendered as a gradient in light
 * and as a flat colour in dark, and nothing anywhere said so. That is exactly
 * the failure this system exists to remove, so it throws rather than reports.
 */
function assertNoCollision(selector, pairs) {
  const seen = new Set();
  const dupes = [];
  for (const [k] of pairs) {
    if (seen.has(k)) dupes.push(k);
    seen.add(k);
  }
  if (dupes.length) {
    throw new Error(
      `token collision in ${selector}: ${dupes.join(", ")} declared twice. ` +
        `A reserved colour and a gradient cannot share a name — rename one in the palette.`,
    );
  }
}

function reservedFor(palette, themeName) {
  return entries(palette.reserved).map(([k, entry]) => [k, reservedValue(entry, themeName)])
    .filter(([, v]) => v != null);
}

function alphaFor(palette, themeName) {
  const a = palette.shadowAlpha?.[themeName];
  return a ? Object.entries(a).map(([k, v]) => [`shadow-${k}`, v]) : [];
}

export function emitTokensCss({ palette, version, darkSelector = ".phone--dark" }) {
  const out = [banner(version, `palettes/${palette.name}.json`), ""];
  const themes = entries(palette.themes);
  const [firstName, firstTheme] = themes[0];

  // The first theme is the ground state and lives on :root, so a screen with no
  // scope class still paints. Everything after it is a scope.
  out.push(
    ...block(":root", [
      ["shadow-tint", palette.shadowTint ?? "0 0 0"],
      ...alphaFor(palette, firstName),
      ...Object.entries(firstTheme),
      ...reservedFor(palette, firstName),
      ...entries(palette.gradients),
      /* Product shadows. sm/DEFAULT/lg are shared geometry, but `card`,
         `press` and `fab` are a specific affordance in a specific product —
         imposter's card shadow is a 24px lift with an inset highlight and
         tic-tac-toe's is an 8px drop. Sharing a name is not sharing a value. */
      ...entries(palette.shadows).map(([k, v]) => [`shadow-${k}`, v]),
      ...entries(palette.fonts).map(([k, v]) => [`font-${k}`, v]),
    ]),
  );

  for (const [name, theme] of themes.slice(1)) {
    out.push(`/* ${name} — a remap of the same names, not new utilities. */`);
    out.push(
      ...block(darkSelector, [
        ...alphaFor(palette, name),
        ...Object.entries(theme),
        ...reservedFor(palette, name),
      ]),
    );
  }

  for (const [name, remap] of entries(palette.scopes)) {
    out.push(`/* scope: ${name} */`);
    out.push(...block(`.${name}`, Object.entries(remap).filter(([k]) => k !== "_")));
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}
