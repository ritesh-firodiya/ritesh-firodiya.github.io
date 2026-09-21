/**
 * Rename tokens inside string constants that ARE class lists.
 *
 * tic-tac-toe keeps its primary button as
 *
 *   PRIMARY_BUTTON = "bg-sky-700 active:opacity-80"
 *
 * in `constants/styles.ts` rather than as a component, so a rename scoped to
 * class attributes never saw it and five raw-palette classes survived the
 * migration. Several sets do something similar — charades re-declares its gold
 * CTA in five hand-rolled shapes, and trunk ships precomposed CHIP_* constants.
 *
 * The guard is that EVERY space-separated part must look like a utility, and
 * at least one must carry a colour-bearing prefix. Without it a blind replace
 * rewrites prose, element ids and URLs — which is how an earlier pass turned
 * part of `play.google.com` into a token.
 */

/** A Tailwind-shaped word: optional variants, a name, an optional [arbitrary]. */
const UTILITY = /^-?(?:[a-z][\w.-]*:)*[a-z][\w./-]*(?:\[[^\]]*\])?$/;

/** At least one part has to be the kind of utility a token can appear in. */
const COLOUR_BEARING =
  /^(?:[a-z-]+:)*(?:bg|text|border|rounded|shadow|ring|fill|stroke|from|via|to|tracking|divide|outline|placeholder|accent|decoration)-/;

/**
 * @param {string} text      source file contents
 * @param {object} map       token rename map
 * @param {Function} rename  renameClasses from ./codemod.mjs
 */
export function renameClassStrings(text, map, rename) {
  let changed = 0;
  const out = text.replace(/(["'])([^"'\n]{3,300})\1/g, (whole, quote, body) => {
    const parts = body.trim().split(/\s+/);
    if (!parts.length || !parts.every((p) => UTILITY.test(p))) return whole;
    if (!parts.some((p) => COLOUR_BEARING.test(p))) return whole;

    const next = rename(`class="${body}"`, map).match(/class="([^"]*)"/)[1];
    if (next !== body) changed++;
    return `${quote}${next}${quote}`;
  });
  return { text: out, changed };
}
