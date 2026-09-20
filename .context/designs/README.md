# One site — designs

Pure HTML + Tailwind (Play CDN). Nothing is wired to a framework.

Open `index.html` — it is the gallery and links every screen.

```
tailwind.config.js   token scales, every value a var(--…)
shared.css           token definitions + frames, grain, table, gallery, print
index.html           gallery · start here
web/                 21 screens — products (+4 model variants), go, design ×4,
                     process ×3, notes ×2, home, work, hire, resume, legal,
                     support, 404
mobile/              11 screens at 390
```

Direction: **editorial light** — warm paper, near-black warm ink, one
burnt-sienna accent, Fraunces display over Inter text.

## Why this exists

The previous pass claimed "no ads in our games" and "one-time purchases, not
subscriptions". Both were false: one game ships an AdMob banner and
interstitial, and four of eight apps are subscriptions. A third page said
Chitragupt was free while its config defines three priced tiers. A fourth gave
Imposter a working install button while its `STATUS.md` said nothing was live.

The mistake was the *shape* of the claim, not the wording. This set replaces
every studio-wide promise with per-app facts.

## The four rules added here

1. The model is stated before the install button, always — and the five models
   render at equal visual weight.
2. No studio-wide promise.
3. Availability is never a euphemism; an unavailable platform renders disabled
   **with the reason**.
4. A missing asset is visibly missing.

Plus the five inherited from the previous set (three doors, picture above the
fold, status sorts the grid, tokens are variables, no component classes).

## Build target

**A single Next.js app + Tailwind v4. Not a monorepo, not Fresh.**

No monorepo because there is no second app and no shared package — the fact
generator reads *private sibling repos* from `~/git`, so it belongs next to
`bin/index` and `bin/check`, not in a workspace.

Next.js because Tailwind v4's `@theme` is CSS-first, so the `:root` block in
`shared.css` becomes the real theme nearly verbatim; file-system routing plus
`generateStaticParams()` removes the `fresh.gen.ts` + hardcoded-`ROUTES`
double-gotcha across ~20 routes and four dynamic families; MDX for `/notes` is
native; and Twind 0.16 is unmaintained while Fresh 2 drops the plugin anyway,
so a Tailwind port is owed regardless.

`output: 'export'` gives static HTML for Pages, and the repo keeps its name so
the absolute links stay valid.

## Known gap

The gallery's live iframes still show the development chrome carried by every
design file. The sync step has to strip it before anything is published. It is
left visible on `/design/gallery` rather than hidden.

## Next phase

A generator that reads the app repositories and **refuses to build when a
stated fact disagrees with source**. Until that exists, every number on
`/products` is hand-checked against the repos and dated.
