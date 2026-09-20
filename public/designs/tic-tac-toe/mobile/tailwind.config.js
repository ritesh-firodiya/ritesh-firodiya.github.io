/* Tic Tac Toe wireframes — Tailwind Play CDN config
   ================================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   EVERY value here is `var(--token)`, never a literal hex. shared.css defines
   the tokens once in `:root` and remaps them inside `.phone--dark`, so a
   utility written against a var follows whichever theme scope it lands in.
   That is how one markup file renders both themes: the app ships
   `userInterfaceStyle: "automatic"`, so light and dark are equally real and a
   wireframe that only drew one of them would be drawing half the product.

   Token values mirror src/constants/theme.ts exactly. When they disagree, that
   file wins and this one is corrected in the same change — theme.ts is
   compiled and shipped; this is a drawing of it.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Surfaces. The screen is a gradient, not a flat fill —
           SCREEN_GRADIENT in theme.ts. `page`/`page2` are its two stops. */
        page:    'var(--page-bg)',
        page2:   'var(--page-bg-2)',
        surface: 'var(--surface)',
        sunken:  'var(--surface-sunken)',

        /* THE TWO MARKS — the most important colours in the product.
           X is the brand blue, O is the rose. Nothing else may resolve to
           either: a board is read in a glance from across a table, and if the
           blue can also mean "button" then the mark carries nothing. */
        mark: {
          x:   'var(--mark-x)',
          o:   'var(--mark-o)',
          /* The winning line. Amber in both themes — light fill on dark,
             dark fill on light — because it has to beat both marks at once. */
          win: 'var(--mark-win)',
        },

        /* Brand ramps, used only for the mode cards and the marks' gradients. */
        bx: { from: 'var(--brand-x-from)', to: 'var(--brand-x-to)' },
        bo: { from: 'var(--brand-o-from)', to: 'var(--brand-o-to)' },

        accent: 'var(--accent)',
        brand:  'var(--brand)',

        ink: {
          DEFAULT: 'var(--text-primary)',
          2:       'var(--text-secondary)',
          3:       'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
        },
        icon: { DEFAULT: 'var(--icon)', muted: 'var(--icon-muted)' },
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)' },

        /* Difficulty. A ramp, not three unrelated hues — the rows sit under
           one another and a reader compares them vertically. */
        diff: {
          easy:   'var(--diff-easy)',
          medium: 'var(--diff-medium)',
          hard:   'var(--diff-hard)',
        },
      },
      borderRadius: {
        sm: 'var(--r-sm)', DEFAULT: 'var(--r)', lg: 'var(--r-lg)',
        xl: 'var(--r-xl)', '2xl': 'var(--r-2xl)', pill: 'var(--r-pill)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)', DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)', card: 'var(--shadow-card)',
      },
      fontSize: {
        /* Annotation sizes for the wireframe sidebars */
        '2xs': ['10px',   { lineHeight: '1.3' }],
        xs:    ['11.5px', { lineHeight: '1.4' }],
        sm:    ['13px',   { lineHeight: '1.45' }],
        base:  ['14px',   { lineHeight: '1.5' }],
        /* PRODUCT sizes. A board cell glyph is read at arm's length by someone
           who is not holding the phone, which is why `cell` is the largest
           thing in the scale and nothing competes with it. */
        body: ['16px', { lineHeight: '1.5' }],
        lead: ['18px', { lineHeight: '1.45' }],
        h3:   ['22px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h2:   ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h1:   ['34px', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        cell: ['64px', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      letterSpacing: { label: '0.18em' },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
