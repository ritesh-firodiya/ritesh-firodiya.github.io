/* Portfolio wireframes — Tailwind Play CDN config
   ==============================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   EVERY value here is `var(--token)`, never a literal. shared.css defines the
   tokens once in `:root`, so the markup can stay 100% Tailwind and the two
   files cannot drift. A token with no var here simply has no utility.

   Direction: EDITORIAL LIGHT. Warm paper, near-black ink, one burnt-sienna
   accent, Fraunces for display and Inter for text. Deliberately the opposite
   of the navy/mint sidebar template this replaces.

   When porting to Fresh, these scale names are the ones twind.config.ts gets.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Ground — warm paper, never pure white except on a lifted card. */
        paper:    'var(--paper)',
        'paper-2':'var(--paper-2)',
        'paper-3':'var(--paper-3)',
        surface:  'var(--surface)',

        /* Ink — three stops. ink-3 is the floor; nothing quieter is legible. */
        ink:      'var(--ink)',
        'ink-2':  'var(--ink-2)',
        'ink-3':  'var(--ink-3)',
        'ink-inv':'var(--ink-inv)',

        line:     'var(--line)',
        'line-2': 'var(--line-2)',

        /* Accent — burnt sienna. Links, rules, the one loud CTA. 7.3:1 on paper. */
        accent:   'var(--accent)',
        'accent-2':'var(--accent-2)',
        'accent-wash':'var(--accent-wash)',

        /* Monetization model — five, all at equal weight. See shared.css. */
        'm-free':      'var(--m-free)',
        'm-free-wash': 'var(--m-free-wash)',
        'm-ads':       'var(--m-ads)',
        'm-ads-wash':  'var(--m-ads-wash)',
        'm-once':      'var(--m-once)',
        'm-once-wash': 'var(--m-once-wash)',
        'm-sub':       'var(--m-sub)',
        'm-sub-wash':  'var(--m-sub-wash)',
        'm-year':      'var(--m-year)',
        'm-year-wash': 'var(--m-year-wash)',

        /* Status — a product is Live, in Beta, in Build, or in Design.
           Four states, four colours, and the grid is sorted by them. */
        live:       'var(--live)',
        'live-wash':'var(--live-wash)',
        beta:       'var(--beta)',
        'beta-wash':'var(--beta-wash)',
        build:      'var(--build)',
        'build-wash':'var(--build-wash)',
        design:      'var(--design)',
        'design-wash':'var(--design-wash)',
      },

      fontFamily: {
        display: 'var(--font-display)',
        sans:    'var(--font-sans)',
        mono:    'var(--font-mono)',
      },

      fontSize: {
        /* Editorial scale. The two display steps are fluid — a portfolio is
           read at 390 and at 1600 and the headline has to work at both. */
        'd1':    ['var(--fs-d1)',    { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'd2':    ['var(--fs-d2)',    { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        /* Fixed equivalents for the 390 review frames — see shared.css. */
        'd1-390':['var(--fs-d1-390)', { lineHeight: '0.98', letterSpacing: '-0.03em' }],
        'd2-390':['var(--fs-d2-390)', { lineHeight: '1.06', letterSpacing: '-0.02em' }],
        'h2':    ['var(--fs-h2)',    { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'h3':    ['var(--fs-h3)',    { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'lead':  ['var(--fs-lead)',  { lineHeight: '1.6' }],
        'body':  ['var(--fs-body)',  { lineHeight: '1.7' }],
        'small': ['var(--fs-small)', { lineHeight: '1.6' }],
        'xs2':   ['var(--fs-xs2)',   { lineHeight: '1.5' }],
        'label': ['var(--fs-label)', { lineHeight: '1.4', letterSpacing: '0.14em' }],
      },

      letterSpacing: {
        label: '0.14em',
      },

      maxWidth: {
        page:    'var(--w-page)',    /* 1120 — the whole canvas */
        prose:   'var(--w-prose)',   /* 68ch — About / case-study body */
        measure: 'var(--w-measure)', /* 58ch — hero sub, card copy */
      },

      borderRadius: {
        card: 'var(--r-card)',
        pill: 'var(--r-pill)',
      },

      boxShadow: {
        lift:  'var(--shadow-lift)',
        frame: 'var(--shadow-frame)',
      },

      spacing: {
        section: 'var(--sp-section)', /* vertical rhythm between bands */
        gutter:  'var(--sp-gutter)',
      },
    },
  },
}
