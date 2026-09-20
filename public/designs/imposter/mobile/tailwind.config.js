/* Imposter wireframes — Tailwind Play CDN config
   ==============================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   EVERY value here is `var(--token)`, never a literal hex, and that is the
   whole point of this file. shared.css defines the tokens once in `:root` and
   remaps them inside `.phone--flood`, so a Tailwind utility written against a
   var follows whichever scope it lands in. A literal `#ffffff` compiled into
   `bg-surface` would paint the dev chrome and the product screens the same,
   and nothing in the markup would say why.

   So: the markup is 100% Tailwind, the tokens live in exactly one place, and
   the two files cannot drift — a token with no var here simply has no utility.

   When porting to React Native, these scale names are the ones UniWind uses in
   src/global.css.

   v5 removed four scales, all of them dead or lying:
     coal.*      was `violet.*`, and held green in four of its seven slots
     magenta.*   zero uses
     cat.*       twenty variables holding the same two values, zero uses
     av.*        eight variables holding one value, zero uses
   The pack plate and the avatar are both a white plate carrying a lucide line
   icon. The drawing carries the meaning; the palette stays clean.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Coal — the ground and the greys lifted off it. Every stage bottoms
           out at coal-900; these are the stops above it. */
        coal: {
          300: 'var(--coal-300)',
          400: 'var(--coal-400)',
          500: 'var(--coal-500)',
          600: 'var(--coal-600)',
          700: 'var(--coal-700)',
          800: 'var(--coal-800)',
          900: 'var(--coal-900)',
        },

        /* Accent — the one light green. The CTA, and the Civilian role. */
        accent: {
          50:  'var(--accent-50)',
          100: 'var(--accent-100)',
          200: 'var(--accent-200)',
          300: 'var(--accent-300)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
          900: 'var(--accent-900)',
        },

        /* THE TWO ROLES — the most important colours in the product.
           Rule 1: nothing else in this config may resolve to the green or to
           the black plate. Mr. White was the third and he is gone; the game
           has two roles now, and two is what the palette can carry. */
        role: {
          civilian: { DEFAULT: 'var(--civilian)', bg: 'var(--civilian-bg)', fg: 'var(--civilian-fg)' },
          imposter: { DEFAULT: 'var(--imposter)', bg: 'var(--imposter-bg)', fg: 'var(--imposter-fg)' },
        },

        /* Text */
        ink: {
          DEFAULT: 'var(--text-primary)',
          2: 'var(--text-secondary)',
          3: 'var(--text-tertiary)',
          4: 'var(--text-quaternary)',
          inverse: 'var(--text-inverse)',
        },

        /* Surfaces */
        page:    'var(--page-bg)',
        surface: 'var(--surface)',
        muted:   'var(--surface-muted)',
        sunken:  'var(--surface-sunken)',

        /* Borders */
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)' },

        /* Ink for surfaces that do not follow the flood — the green CTA is the
           same green on every stage, so its label cannot follow the ink ramp
           or it turns white-on-green. */
        onaccent: 'var(--on-accent)',

        /* Paper — the one light surface. A pack plate, a card back. */
        paper:    'var(--paper)',
        paperink: 'var(--paper-ink)',

        /* Status. There is no red here, including for destructive actions:
           `danger` is a white outline and a plain word. */
        success: { DEFAULT: 'var(--success)', bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
        warn:    { DEFAULT: 'var(--warning)', bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
        danger:  { DEFAULT: 'var(--danger)',  bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)' },
        info:    { DEFAULT: 'var(--info)',    bg: 'var(--info-bg)',    fg: 'var(--info-fg)' },
      },
      borderRadius: {
        sm:      'var(--r-sm)',
        DEFAULT: 'var(--r)',
        lg:      'var(--r-lg)',
        xl:      'var(--r-xl)',
        '2xl':   'var(--r-2xl)',
        '3xl':   'var(--r-3xl)',
        card:    'var(--r-card)',
        pill:    'var(--r-pill)',
      },
      boxShadow: {
        sm:      'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg:      'var(--shadow-lg)',
        card:    'var(--shadow-card)',
        press:   'var(--shadow-press)',
      },
      backgroundImage: {
        mark:     'var(--mark)',
        cardback: 'var(--card-back)',
      },
      fontSize: {
        /* Annotation sizes for the wireframe sidebars */
        '2xs': ['10px',   { lineHeight: '1.3' }],
        xs:    ['11.5px', { lineHeight: '1.4' }],
        sm:    ['13px',   { lineHeight: '1.45' }],
        base:  ['14px',   { lineHeight: '1.5' }],
        /* PRODUCT sizes. The first pass had no display scale at all — its
           biggest type was 38px and almost everything else was 14px, which is
           why it read as a settings app. A secret word is read across a table
           at an angle by someone else's friend; a player name is read from a
           metre away. These are the sizes the 5M+ apps actually ship. */
        body:  ['16px', { lineHeight: '1.5' }],
        lead:  ['18px', { lineHeight: '1.45' }],
        h3:    ['22px', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        h2:    ['28px', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        h1:    ['36px', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        display: ['46px', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        hero:    ['60px', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
      },
      letterSpacing: { label: '0.18em', role: '0.22em' },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
