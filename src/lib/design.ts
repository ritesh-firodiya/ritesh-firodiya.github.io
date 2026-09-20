/**
 * The nine rules were not written as a manifesto. They were extracted by
 * reading nine design systems written months apart and noticing which arguments
 * kept being made independently. A rule one set follows is a preference; a rule
 * six sets arrived at separately is a finding — and `found` records which.
 */
export const RULES = [
  { n: "01", title: "One or two colours are reserved, and nothing else may use them",
    body: "In Imposter, green means Civilian and black means Imposter, so no category plate may be green. In Tic Tac Toe, blue is X and rose is O. A player reads across a noisy table in two seconds — if green can also mean “Food & Drink” then the one colour carrying the whole game carries nothing.",
    found: "Found in 6 of 9 sets" },
  { n: "02", title: "The wireframe is the spec",
    body: "When a screen and its wireframe disagree, the wireframe wins and the code is corrected. Exactly one project inverts this — and it writes the inversion down as an exception rather than quietly doing it.",
    found: "Found in 3 sets + the house rules" },
  { n: "03", title: "A screen with no HTML file does not ship",
    body: "Every state gets its own file — empty, loading, error, locked, offline. Not a note in a doc, a file. The one app that shipped to a store without a design set now treats its wireframes as the spec going forward.",
    found: "House rule, echoed in 2 sets" },
  { n: "04", title: "Tokens are defined once; a token with no variable has no utility",
    body: "The Tailwind config holds only var(--…); the CSS file holds the values. The two cannot drift, because a literal compiled into a utility would paint two scopes the same and nothing in the markup would say why.",
    found: "Found in 5 of 9 sets, near-verbatim" },
  { n: "05", title: "No component class Tailwind can already express",
    body: "No .btn, .card, .chip or .row. A component class Tailwind can already express is a second source of truth, and it drifts. This is the rule the older sets disagree with, and the disagreement is argued in writing on both sides.",
    found: "Contested — 4 sets for, 4 against" },
  { n: "06", title: "Name by role, never by hue",
    body: "brand, not green. A repalette becomes a one-file change and no class ever lies about what it means. Two sets break this and both are on the migration list.",
    found: "Found in 5 of 9 sets" },
  { n: "07", title: "A dark theme is a scope remap, not a second set of utilities",
    body: "The same token names are redefined inside a scope. A utility written against a variable follows whichever scope it lands in, so no markup changes and nothing can be dark in one place and light in another.",
    found: "Found in 4 sets" },
  { n: "08", title: "A missing asset must be visibly missing",
    body: "Every image slot is a labelled placeholder saying what belongs there and at what size. A slot that never got its asset is obvious at review, instead of shipping as a grey box nobody questions.",
    found: "Found in 2 sets — the newest two" },
  { n: "09", title: "Write down what was deleted, and why",
    body: "The best argument for rule 4 in this whole corpus is a deletion note. One set records that three amber tokens were referenced but never defined — so a shadow the original design called a core decision silently resolved to nothing on all 26 primary buttons, for months, with no error anywhere. Nobody noticed until the tokens were audited.",
    found: "The rule that justifies rule 4", wide: true },
] as const;

export type Verdict = "canonical" | "near" | "older" | "drifted" | "outside";

export const VERDICT: Record<Verdict, { label: string; fg: string; bg: string }> = {
  canonical: { label: "Canonical", fg: "text-live", bg: "bg-live-wash" },
  near: { label: "Near-clean", fg: "text-live", bg: "bg-live-wash" },
  older: { label: "Older generation", fg: "text-beta", bg: "bg-beta-wash" },
  drifted: { label: "Drifted", fg: "text-beta", bg: "bg-beta-wash" },
  outside: { label: "Outside the system", fg: "text-design", bg: "bg-design-wash" },
};

/** `null` = not applicable, because the set has no token config to check. */
export const DRIFT: {
  set: string; screens: number; vars: boolean | null; roles: boolean | null;
  nostyle: boolean; nocomp: boolean | null; verdict: Verdict; note?: string;
}[] = [
  { set: "Imposter", screens: 19, vars: true, roles: true, nostyle: true, nocomp: true, verdict: "canonical" },
  { set: "Tic Tac Toe", screens: 8, vars: true, roles: true, nostyle: false, nocomp: true, verdict: "near", note: "6 files" },
  { set: "Aakalan", screens: 29, vars: true, roles: true, nostyle: true, nocomp: false, verdict: "older", note: "238 classes" },
  { set: "AskCal", screens: 46, vars: false, roles: true, nostyle: false, nocomp: false, verdict: "drifted" },
  { set: "Charades", screens: 19, vars: false, roles: false, nostyle: false, nocomp: false, verdict: "drifted", note: "navy, gold" },
  { set: "Plan-Kid", screens: 57, vars: false, roles: false, nostyle: false, nocomp: false, verdict: "drifted", note: "teal, coral" },
  { set: "DwarSeva Property", screens: 86, vars: null, roles: null, nostyle: false, nocomp: null, verdict: "outside" },
];

/** Cheapest-to-change first, not worst first. A retoken on a set with no app
 *  behind it costs nothing downstream; a retoken on a shipped app means
 *  re-reviewing every screen someone already approved. */
export const MIGRATION = [
  { n: "01", title: "Plan-Kid — 57 screens, no app code",
    body: "The largest violating set and the cheapest to fix, because nothing has been built against it yet. Its own config already says the app's theme must be generated from these tokens rather than re-picked by eye — so fixing it now is the difference between that sentence being true and being aspirational." },
  { n: "02", title: "AskCal — 46 screens, shipping to internal track",
    body: "Literal hex throughout plus a second stylesheet for onboarding. No public release yet, so the screens can change without anyone having to be told." },
  { n: "03", title: "Charades — 19 screens, live, and it needs a decision first",
    body: "Hue names and literal hex, but the real problem is written in its own config under a heading that reads KNOWN DRIFT: the wireframe ramp sits one step off the app's, deliberately. Reconciling changes how 17 approved screens look. That is a design decision with an approval gate, not a lint fix." },
  { n: "04", title: "Aakalan — the argument, not the fix",
    body: "238 component classes, and its own notes defend them: thirty copies of one row's nine declarations is not consistency either. Both positions are argued in writing and both are reasonable. This one is a decision to make, not a violation to correct." },
  { n: "05", title: "DwarSeva Property — rebuild, do not migrate",
    body: "86 files, each with its own inline stylesheet and default palette, no token config at all. It is also the most ambitious set in the corpus — the only one with web, mobile and an admin surface. It gets rebuilt when the product is real, not patched now." },
];
