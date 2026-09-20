/* Charades wireframes — Tailwind Play CDN config
   =============================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   Every colour here mirrors a CSS variable in shared.css, so a token works
   either way:  class="bg-navy-500"  or  style="background:var(--navy-500)"

   `navy` and `gold` are this product's role names, not hue labels: navy is the
   brand (app icon, chrome, the history hero) and gold is the one accent that
   marks a paid action. They are spelled the same here and in the Expo app's
   `src/global.css` so a class never has to be re-chosen at build time.

   KNOWN DRIFT — the ramps here are offset one step from the app's:
     wireframe navy-500 (#2a4a85) === app navy-600
     wireframe navy-900 (#0B1A3A) === app navy-800
   These values match shared.css, which is what the 17 approved screens already
   render against. Reconciling the two ramps changes how those screens look, so
   it is a design decision, not a config fix.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Brand — navy. Chrome, the app shell, the history hero. */
        navy: {
          50:  '#eef2fb',
          100: '#dae2f4',
          200: '#b6c5e8',
          500: '#2a4a85',
          700: '#162a5e',
          900: '#0B1A3A',
        },

        /* Accent — gold. Reserved for paid actions: pack CTAs, the bundle
           sell, the locked-pack badge. Spending it elsewhere flattens the only
           signal that separates free content from paid. */
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },

        /* Text */
        ink: {
          DEFAULT: '#18181b',
          2: '#52525b',
          3: '#71717a',
          4: '#a1a1aa',
          inverse: '#ffffff',
        },

        /* Surfaces */
        page:    '#f4f4f5',
        phone:   '#ffffff',
        surface: '#ffffff',
        muted:   '#f9fafb',
        sunken:  '#f4f4f5',

        /* Borders */
        line: { DEFAULT: '#e4e4e7', strong: '#d4d4d8' },

        /* Status */
        success: { DEFAULT: '#10b981', bg: '#ecfdf5', fg: '#047857' },
        warning: { DEFAULT: '#f59e0b', bg: '#fffbeb', fg: '#b45309' },
        danger:  { DEFAULT: '#f43f5e', bg: '#fff1f2', fg: '#be123c' },

        /* SKIP — the game's third outcome, deliberately not `warning`.
           A skip is a neutral move, not a problem, and sharing a colour with
           warnings made players read it as a penalty. */
        skip:    { DEFAULT: '#f97316', bg: '#fff7ed', fg: '#c2410c' },
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        phone: '40px',
      },
      boxShadow: {
        sm:      '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 4px 12px rgba(24,24,27,0.06)',
        lg:      '0 10px 30px -8px rgba(24,24,27,0.15)',
        phone:   '0 0 0 1px #d4d4d8, 0 30px 60px -20px rgba(24,24,27,0.18)',
      },
      fontSize: {
        '2xs': ['10px',   { lineHeight: '1.3' }],
        xs:    ['11.5px', { lineHeight: '1.4' }],
        sm:    ['13px',   { lineHeight: '1.45' }],
        base:  ['14px',   { lineHeight: '1.5' }],
      },
      letterSpacing: { label: '0.15em' },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
};
