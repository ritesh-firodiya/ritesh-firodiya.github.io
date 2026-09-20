/* Plan-Kid wireframes — Tailwind Play CDN config
   ==============================================
   Loaded AFTER https://cdn.tailwindcss.com on every screen.

   Every colour here mirrors a CSS variable in shared.css, so a token works
   either way:  class="bg-teal-500"  or  style="background:var(--teal-500)"

   `teal` and `coral` are role names, not hue labels: teal is the brand and
   carries all chrome and on-track states; coral is the single CTA colour.
   Keeping the split explicit is what stops a second call-to-action colour
   creeping in later and flattening the one that matters.

   No Expo app exists yet, so this file is the sole token source — when the app
   is scaffolded its UniWind theme must be generated from these values, not
   re-picked by eye.
*/
tailwind.config = {
  theme: {
    extend: {
      colors: {
        /* Brand — teal. Chrome, navigation, on-track and completed states. */
        teal: {
          50:  '#e6f2f0',
          100: '#c5e0dc',
          200: '#8ec4bc',
          500: '#3e8b7f',
          700: '#1f5f56',
          900: '#0f3a34',
        },

        /* CTA — coral. The one colour that means "act here". Primary buttons,
           the paywall, the add-plan FAB. Never decorative. */
        coral: {
          50:  '#fff3ee',
          100: '#ffe0d1',
          200: '#ffc4a8',
          400: '#ff8f6b',
          500: '#ff6f4c',
          600: '#e0522f',
          700: '#b83e1f',
        },

        /* Text — warm near-black, not pure grey, to sit on the cream page. */
        ink: {
          DEFAULT: '#1c2321',
          2: '#5c6461',
          3: '#8a9491',
          4: '#b5bdba',
          inverse: '#ffffff',
        },

        /* Surfaces — the cream ground is the product's signature. */
        page:    '#f7f3ed',
        phone:   '#ffffff',
        surface: '#ffffff',
        muted:   '#faf7f2',
        sunken:  '#f2ede4',

        /* Borders */
        line: { DEFAULT: '#ece5d8', strong: '#ddd4c2' },

        /* Status */
        success: { DEFAULT: '#10b981', bg: '#ecfdf5', fg: '#047857' },
        warning: { DEFAULT: '#f59e0b', bg: '#fffbeb', fg: '#b45309' },
        danger:  { DEFAULT: '#e11d48', bg: '#fff1f2', fg: '#be123c' },
        info:    { DEFAULT: '#7c3aed', bg: '#f5f3ff', fg: '#5b21b6' },
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
        sm:      '0 1px 2px rgba(0,0,0,0.04)',
        DEFAULT: '0 4px 12px rgba(28,35,33,0.06)',
        lg:      '0 10px 30px -8px rgba(28,35,33,0.14)',
        phone:   '0 0 0 1px #ddd4c2, 0 30px 60px -20px rgba(28,35,33,0.18)',
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
