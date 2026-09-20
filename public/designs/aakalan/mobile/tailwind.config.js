/* Aakalan wireframes — Tailwind Play CDN config
   =============================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   EVERY value here is `var(--token)`, never a literal hex, and that is the
   whole point of this file. shared.css defines the tokens once in `:root` and
   redefines them inside `.phone--dark`, so a Tailwind utility written against
   a var follows whichever theme it lands in. A literal `#ffffff` compiled into
   `bg-surface` would paint the dark preview on account/appearance.html white,
   and nothing in the markup would say why.

   So: the markup is 100% Tailwind, the tokens live in exactly one place, and
   the two files cannot drift — a token with no var here simply has no utility.

   When porting to React Native, translate the vars in shared.css into
   src/theme/tokens.ts. The scale names below are the ones UniWind already uses
   in src/global.css.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Brand — indigo. Primary actions, active nav, links. */
        brand: {
          50:  'var(--indigo-50)',
          100: 'var(--indigo-100)',
          200: 'var(--indigo-200)',
          400: 'var(--indigo-400)',
          500: 'var(--indigo-500)',
          700: 'var(--indigo-700)',
          900: 'var(--indigo-900)',
        },
        /* Accent — saffron. Delight, upgrade, highlights. Never money. */
        saffron: {
          50:  'var(--saffron-50)',
          100: 'var(--saffron-100)',
          200: 'var(--saffron-200)',
          400: 'var(--saffron-400)',
          500: 'var(--saffron-500)',
          600: 'var(--saffron-600)',
          700: 'var(--saffron-700)',
        },

        /* Money direction — the two most important colours in the product.
           pos = you are owed. neg = you owe. settled = neither (rule 1). */
        pos:     { DEFAULT: 'var(--pos)', bg: 'var(--pos-bg)', fg: 'var(--pos-fg)' },
        neg:     { DEFAULT: 'var(--neg)', bg: 'var(--neg-bg)', fg: 'var(--neg-fg)' },
        settled: 'var(--settled)',

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

        /* Status. `danger` resolves to the same var as `neg` on purpose — a
           destructive action is the one carve-out in rule 1, because that
           convention is older and stronger than this design system. */
        info:    { DEFAULT: 'var(--info)',    bg: 'var(--info-bg)',    fg: 'var(--info-fg)' },
        warn:    { DEFAULT: 'var(--warning)', bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
        danger:  { DEFAULT: 'var(--danger)',  bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)' },

        /* Expense categories — icon pucks and the spending chart.
           No green and no rose on this wheel: rule 1 reserves those two for
           money direction, and `home` used to be the exact value of `pos`. */
        cat: {
          food:   'var(--cat-food)',   foodbg:   'var(--cat-food-bg)',
          travel: 'var(--cat-travel)', travelbg: 'var(--cat-travel-bg)',
          stay:   'var(--cat-stay)',   staybg:   'var(--cat-stay-bg)',
          home:   'var(--cat-home)',   homebg:   'var(--cat-home-bg)',
          fun:    'var(--cat-fun)',    funbg:    'var(--cat-fun-bg)',
          shop:   'var(--cat-shop)',   shopbg:   'var(--cat-shop-bg)',
          util:   'var(--cat-util)',   utilbg:   'var(--cat-util-bg)',
        },
      },
      borderRadius: {
        sm:      'var(--r-sm)',
        DEFAULT: 'var(--r)',
        lg:      'var(--r-lg)',
        xl:      'var(--r-xl)',
        '2xl':   'var(--r-2xl)',
        '3xl':   'var(--r-3xl)',
      },
      boxShadow: {
        sm:      'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg:      'var(--shadow-lg)',
      },
      fontSize: {
        /* Wireframes lean on small type a lot — name the common steps */
        '2xs': ['10px',   { lineHeight: '1.3' }],
        xs:    ['11.5px', { lineHeight: '1.4' }],
        sm:    ['13px',   { lineHeight: '1.45' }],
        base:  ['14px',   { lineHeight: '1.5' }],
      },
      letterSpacing: { label: '0.18em' },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
