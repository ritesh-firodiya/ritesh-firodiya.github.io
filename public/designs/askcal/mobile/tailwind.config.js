/* AskCal wireframes — Tailwind Play CDN config
   ==========================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   Every colour here mirrors a CSS variable in shared.css, so a token works
   either way:  class="bg-brand-500"  or  style="background:var(--brand-500)"

   Named by role, never by hue (`brand`, not `green`), so a repalette is a
   one-file change and no class ever lies about what it means.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Brand — deep green. Primary actions, on-track states, the calorie ring. */
        brand: {
          50:  '#e9f7f0',
          100: '#cdedde',
          200: '#9adcbe',
          400: '#3faa79',
          500: '#1f8b5c',
          700: '#136141',
          900: '#0a3a27',
        },

        /* Accent — amber. Reserved for the ASK moment and nothing else.
           When the app asks the user a question, it is amber. That is the
           product's one signature colour and overusing it would flatten it. */
        ask: {
          50:  '#fff8e8',
          100: '#ffefc6',
          200: '#ffdd8c',
          400: '#f7b731',
          500: '#e89c0d',
          700: '#9c650a',
        },

        /* Confidence — the core concept of this product. The user must be able
           to tell at a glance which numbers the camera actually established and
           which it guessed. Never show an estimate without one of these. */
        conf: {
          high:   '#1f8b5c', highbg:   '#e9f7f0',
          med:    '#e89c0d', medbg:    '#fff8e8',
          low:    '#e5484d', lowbg:    '#ffefef',
        },

        /* Macros — fixed hues, used in the ring, the bars and every legend.
           Once learned these must never swap. */
        macro: {
          protein: '#7c5cf0', proteinbg: '#f1edff',
          carbs:   '#f7b731', carbsbg:   '#fff8e8',
          fat:     '#e5757a', fatbg:     '#ffeff0',
        },

        /* Text */
        ink: { DEFAULT: '#16201c', 2: '#4d5b55', 3: '#7d8b85', 4: '#adb8b3' },

        /* Surfaces */
        page:    '#f4f6f5',
        surface: '#ffffff',
        muted:   '#fafbfa',
        sunken:  '#eceff0',

        /* Borders */
        line: { DEFAULT: '#e4e8e6', strong: '#d0d6d3' },

        /* Status */
        info:   { DEFAULT: '#0091ff', bg: '#e6f4ff', fg: '#006adc' },
        warn:   { DEFAULT: '#e89c0d', bg: '#fff8e8', fg: '#9c650a' },
        danger: { DEFAULT: '#e5484d', bg: '#ffefef', fg: '#c62a2f' },
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        phone: '40px',
      },
      boxShadow: {
        sm:   '0 1px 2px rgba(22,32,28,0.05)',
        DEFAULT: '0 4px 14px rgba(22,32,28,0.07)',
        lg:   '0 14px 34px -10px rgba(22,32,28,0.18)',
        fab:  '0 8px 20px -4px rgba(31,139,92,0.5)',
        phone: '0 0 0 1px #d0d6d3, 0 30px 60px -20px rgba(22,32,28,0.2)',
      },
      fontSize: {
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
