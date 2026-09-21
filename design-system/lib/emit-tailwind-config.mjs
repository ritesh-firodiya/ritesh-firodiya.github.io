/**
 * core.json + palettes/<app>.json -> tailwind.config.js
 *
 * Layer 3, loaded AFTER the Tailwind Play CDN on every screen.
 *
 * EVERY value here is var(--token), never a literal. The CSS holds the values;
 * this file holds only the names. The two cannot drift, because a literal
 * compiled into a utility would paint two scopes the same and nothing in the
 * markup would say why.
 *
 * Because every value is a var and the names are now fixed, the CANON region
 * has no product-specific content left: it is byte-identical in every set on
 * the same surface, and lint check 8 compares it. That catches an omission as
 * well as a literal, which "every value should be a var" does not.
 *
 * Reserved colours are merged into `colors` rather than nested under a
 * `reserved` key — they are colours, and `bg-cat-food` has to keep matching
 * `--cat-food` or the mechanical rule leaks at exactly the place it is most
 * load-bearing. Their reserved STATUS lives in the palette JSON and is
 * rendered on /design/system, not encoded in a class name.
 */
import { banner, literal, nestColors, paletteKeys } from "./tokens.mjs";

const CANON_OPEN = "/* ==== CANON: generated, byte-identical across this surface ==== */";
const CANON_CLOSE = "/* ==== END CANON ==== */";

/** A JS object literal indented to sit where it is being written. */
const j = (v, pad = "") => literal(v, pad);

function scaleVars(obj, fn) {
  return Object.fromEntries(Object.keys(obj).filter((k) => k !== "_").map((k) => [k, fn(k)]));
}

export function emitTailwindConfig({ core, surface, palette, version }) {
  const s = core[surface];
  const { canon, reserved } = paletteKeys(palette);

  const canonColors = nestColors([...canon].sort(), (k) => `var(--${k})`);
  const reservedColors = nestColors([...reserved].sort(), (k) => `var(--${k})`);

  const fontSize = Object.fromEntries(
    Object.keys(s.type).filter((k) => k !== "_").map((step) => {
      const spec = s.type[step];
      const extra = {};
      if (spec.leading) extra.lineHeight = `var(--lh-${step})`;
      if (spec.tracking) extra.letterSpacing = `var(--ls-${step})`;
      return [step, [`var(--fs-${step})`, extra]];
    }),
  );

  const extend = {
    fontSize,
    borderRadius: scaleVars(s.radius, (k) => `var(--radius${k === "DEFAULT" ? "" : `-${k}`})`),
    boxShadow: {
      sm: "var(--shadow-sm)",
      DEFAULT: "var(--shadow)",
      lg: "var(--shadow-lg)",
      ...scaleVars(s.shadow ?? {}, (k) => `var(--shadow-${k})`),
    },
    letterSpacing: scaleVars(s.tracking, (k) => `var(--tracking-${k})`),
    fontFamily: { sans: ["var(--font-sans)"], mono: ["var(--font-mono)"] },
  };
  if (s.spacing) extend.spacing = scaleVars(s.spacing, (k) => `var(--sp-${k})`);
  if (s.maxWidth) extend.maxWidth = scaleVars(s.maxWidth, (k) => `var(--w-${k})`);

  const body = Object.entries(extend)
    .map(([k, v]) => `  ${k}: ${j(v, "  ")},`)
    .join("\n");

  /* Product shadows live OUTSIDE the canon region for the same reason colours
     do: they differ per product, and the canon region has to stay
     byte-identical for lint check 8 to mean anything. */
  const shadows = scaleVars(palette.shadows ?? {}, (k) => `var(--shadow-${k})`);

  /* Gradients are background IMAGES, not colours. Emitting them into `colors`
     left bg-brand-x and imposter's four stage gradients resolving to nothing —
     a utility that names a declared token and still paints no pixels. */
  const gradients = scaleVars(palette.gradients ?? {}, (k) => `var(--${k})`);

  return `${banner(version, `core.json + palettes/${palette.name}.json`, "js")}

${CANON_OPEN}
const SCALES = {
${body}
};
${CANON_CLOSE}

/* Canonical colours: the same key set in every palette on this surface.
   A key outside design-system/core.json > shared.colorKeys fails lint check 3. */
const COLORS = ${j(canonColors, "")};

/* Reserved: colours that carry meaning in ${palette.product} and may not be
   reused for anything else. Rule 01 — the one six of nine sets arrived at
   independently. See design-system/palettes/${palette.name}.json for what each
   one means and why it is spoken for. */
const RESERVED = ${j(reservedColors, "")};

/* Affordances specific to ${palette.product}: a card lift, a pressed edge, a
   floating action button. Shared geometry stays in SCALES. */
const SHADOWS = ${j(shadows, "")};

/* Gradients are background images, so bg-<name> resolves as an image utility. */
const GRADIENTS = ${j(gradients, "")};

/* Deep merge, one level. A shallow spread let RESERVED's brand group replace
   COLORS' brand group wholesale, so declaring a reserved brand-x-from
   silently deleted brand-500 and thirteen uses of bg-brand-500 painted
   nothing. Groups are merged key by key. */
const merge = (base, extra) => {
  const out = { ...base };
  for (const [group, value] of Object.entries(extra)) {
    out[group] =
      value && typeof value === "object" && out[group] && typeof out[group] === "object"
        ? { ...out[group], ...value }
        : value;
  }
  return out;
};

tailwind.config = {
  theme: {
    extend: {
      ...SCALES,
      boxShadow: { ...SCALES.boxShadow, ...SHADOWS },
      backgroundImage: GRADIENTS,
      colors: merge(COLORS, RESERVED),
    },
  },
};
`;
}

export { CANON_OPEN, CANON_CLOSE };
