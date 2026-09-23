/* ritesh-firodiya.github.io — loaded AFTER the Tailwind CDN, which is what lets it
   replace the default palette rather than extend it.
   ============================================================================
   EVERY VALUE IS var(--token). Never a literal.

   A literal #ffffff compiled into `bg-surface` paints the dark preview white:
   the utility stops following the scope it lands in, and a `.phone--dark`
   remap can no longer reach it. Three sets used literals and therefore could
   not support a dark scope at all.

   The key path here and the variable name in shared.css are the same string
   with dots swapped for dashes. If you add one, add both, in the same edit —
   a class that resolves to nothing does not throw, it just quietly does not
   paint, and that is how `text-2xs` came to be used 186 times while declared
   in exactly one app.
   ============================================================================ */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Canonical set — present in every product, same names everywhere. */
        ink:     { DEFAULT: "var(--ink)", 2: "var(--ink-2)", 3: "var(--ink-3)", 4: "var(--ink-4)", inverse: "var(--ink-inverse)" },
        page:    "var(--page)",
        frame:   "var(--frame)",
        surface: "var(--surface)",
        muted:   "var(--muted)",
        sunken:  "var(--sunken)",
        line:    { DEFAULT: "var(--line)", strong: "var(--line-strong)" },
        /* An inverted band. See the note in shared.css — this is deliberately
           NOT ink + ink-inverse, which flip with the theme. */
        band:    { DEFAULT: "var(--band)", ink: "var(--band-ink)", 2: "var(--band-2)" },
        brand:   {
          50: "var(--brand-50)", 100: "var(--brand-100)", 200: "var(--brand-200)",
          400: "var(--brand-400)", 500: "var(--brand-500)",
          700: "var(--brand-700)", 900: "var(--brand-900)",
          DEFAULT: "var(--brand-500)",
        },
        /* The second red. §8 allows accent where a product has one, and this
           set does: #FF3B00 is 3.4:1 on white and fails AA outright, so it is
           for FIELDS and DISPLAY TYPE ONLY, never a sentence. Splitting it from
           brand is what lets the bright red exist at all. */
        accent:  {
          50: "var(--accent-50)", 100: "var(--accent-100)", 200: "var(--accent-200)",
          400: "var(--accent-400)", 500: "var(--accent-500)", 600: "var(--accent-600)",
          700: "var(--accent-700)", 900: "var(--accent-900)",
          DEFAULT: "var(--accent-500)",
        },
        /* An inverted band — the contact block and the footer. Deliberately
           NOT ink + ink-inverse, which flip with the theme. */
        band:    { DEFAULT: "var(--band)", ink: "var(--band-ink)", 2: "var(--band-2)" },

        success: { DEFAULT: "var(--success)", bg: "var(--success-bg)", fg: "var(--success-fg)" },
        warn:    { DEFAULT: "var(--warn)",    bg: "var(--warn-bg)",    fg: "var(--warn-fg)" },
        danger:  { DEFAULT: "var(--danger)",  bg: "var(--danger-bg)",  fg: "var(--danger-fg)" },
        info:    { DEFAULT: "var(--info)",    bg: "var(--info-bg)",    fg: "var(--info-fg)" },

        /* RESERVED · MONETIZATION MODEL — five, at equal visual weight.
           There is no good colour and no bad colour here. This is the scale
           the whole site exists to carry, and spending it on decoration would
           flatten the one signal that matters. */
        m: {
          free: { DEFAULT: "var(--m-free)", bg: "var(--m-free-bg)" },
          ads:  { DEFAULT: "var(--m-ads)",  bg: "var(--m-ads-bg)" },
          once: { DEFAULT: "var(--m-once)", bg: "var(--m-once-bg)" },
          sub:  { DEFAULT: "var(--m-sub)",  bg: "var(--m-sub-bg)" },
          year: { DEFAULT: "var(--m-year)", bg: "var(--m-year-bg)" },
        },

        /* RESERVED · RELEASE STATE — independent of the model above. A product
           has a price AND a release state; conflating them is how "coming
           soon" ends up meaning four things. No model colour may read as a
           warning, which is why neither scale borrows from `success`/`warn`. */
        live:  { DEFAULT: "var(--live)",  bg: "var(--live-bg)" },
        beta:  { DEFAULT: "var(--beta)",  bg: "var(--beta-bg)" },
        build: { DEFAULT: "var(--build)", bg: "var(--build-bg)" },
        idea:  { DEFAULT: "var(--idea)",  bg: "var(--idea-bg)" },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        "2xs":  ["var(--fs-2xs)",  { lineHeight: "var(--lh-2xs)" }],
        xs:     ["var(--fs-xs)",   { lineHeight: "var(--lh-xs)" }],
        sm:     ["var(--fs-sm)",   { lineHeight: "var(--lh-sm)" }],
        base:   ["var(--fs-base)", { lineHeight: "var(--lh-base)" }],
        body:   ["var(--fs-body)", { lineHeight: "var(--lh-body)" }],
        lead:   ["var(--fs-lead)", { lineHeight: "var(--lh-lead)" }],
        h3:     ["var(--fs-h3)",   { lineHeight: "var(--lh-h3)", letterSpacing: "var(--ls-h3)" }],
        h2:     ["var(--fs-h2)",   { lineHeight: "var(--lh-h2)", letterSpacing: "var(--ls-h2)" }],
        h1:     ["var(--fs-h1)",   { lineHeight: "var(--lh-h1)", letterSpacing: "var(--ls-h1)" }],
        display:["var(--fs-display)", { lineHeight: "var(--lh-display)", letterSpacing: "var(--ls-display)" }],
      },
      letterSpacing: { label: "var(--tracking-label)" },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        pill: "var(--radius-pill)",
        phone: "var(--radius-phone)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
        phone: "var(--shadow-phone)",
      },
      width:     { frame: "var(--frame-w)" },
      maxWidth:  { frame: "var(--frame-w)" },
      height:    { frame: "var(--frame-h)" },
    },
  },
};
