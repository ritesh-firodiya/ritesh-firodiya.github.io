# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The single public site for Ritesh Firodiya, deployed to **GitHub Pages** at
https://ritesh-firodiya.github.io/ via GitHub Actions on every push to `main`.

It carries everything: the portfolio, every app and how it is paid for, the
screens each was built from, and legal.

Stack: **Next.js 16 (App Router) + React 19 + Tailwind v4**, statically exported.
Node 22, pnpm. No server, no request-time data, no client state.

Replaced a Deno Fresh 1.1.2 + Twind site in Sep 2026. Twind was unmaintained and
Fresh 2 drops the plugin, so a Tailwind port was owed either way; Tailwind v4's
CSS-first `@theme` meant the design tokens ported almost verbatim.

## Commands

```bash
pnpm dev          # dev server
pnpm contrast     # WCAG AA on both palettes, computed from globals.css
pnpm build        # static export → out/
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test:data    # data invariants — no build needed
pnpm test:export  # assertions on the exported HTML in out/ — needs a build
pnpm test         # both
pnpm check        # contrast + lint + typecheck + test:data + build + test:export
```

## Tests

`tests/` holds the rules on this page, asserted. Plain `node --test`, no
dependency and no config. A rule that is only written down decays exactly the
way the "no ads in our games" claim decayed, so anything checkable from inside
this repo is checked.

`tests/data.test.mjs` reads `src/data/`. Slugs unique and URL-safe; a
`live`/`beta` platform has a url and a `closed`/`none` one carries a reason
instead; an iOS url labelled TestFlight *is* a TestFlight url and one labelled
App Store is not; every local `legal.*` path resolves to a file in `public/`;
anything installable from a store has a privacy policy; every `media.json` src
exists and nothing in `public/media` is an orphan; **`verifiedOn` is at most 30
days old**; no `p.price`, `p.priceNote`, `p.tiers` or rupee figure appears
anywhere under `src/app` (rule 2b); no studio-wide ads or subscription claim
(rule 1).

`tests/export.test.mjs` reads `out/`, so it runs after a build. **Every
indexable page declares its own canonical**, no page but `/` claims to be `/`, a
noindex page declares none, the noindex set is exactly `/go/`, every page has a
title and a description, the sitemap matches what actually shipped, app-ads.txt
survived, every legal document exported, and nothing over 100KB ships
unreferenced.

Two of these exist because of bugs that were live:

- **The canonical.** The root layout declared `alternates: { canonical: "/" }`.
  Next inherits metadata, so the 35 pages that did not override it told search
  engines they were duplicates of the homepage — including every
  `/products/[slug]`, which are the pages this site exists to serve. **Every
  page now declares its own canonical and the root layout declares none.** No
  source-level test could have caught it; only the built HTML shows it.
- **The unreferenced asset.** `public/sample.png`, 604KB, referenced nowhere,
  shipped on every deploy for months.

The 30-day `verifiedOn` ceiling is a stopgap for `bin/products` not existing
yet. When re-verifying, check the **stores**, not the app repos alone — Tic Tac
Toe went live on the App Store while `products.json` was still sending visitors
to a TestFlight, and the app repo's own STATUS.md did not say otherwise.

## The rule this site exists to enforce

An earlier version claimed **"no ads in our games"** and **"one-time purchases,
not subscriptions"** on a page linked from live store listings. Both were false:
Tic Tac Toe ships an AdMob banner and interstitial, and four of eight apps are
subscriptions. A third page called Chitragupt free while its config defined
three priced tiers.

The mistake was the **shape of the claim** — a promise on behalf of every app is
only as true as the least convenient app, and it decays silently because the
thing that breaks it lives in a different repo.

So:

1. **No studio-wide claims.** Any statement not true of every app it covers is
   scoped to the apps it is true of, or cut.
2. **The model is stated above the install button.** Never below, never in a
   footnote, never softened into "unlock".
2b. **Prices are not published on this site** (decided Sep 2026). No figure,
   no tier card, no "You pay" column, anywhere in `src/app` — the *model*
   (one-time / subscription / free+ads), the ad surfaces and the analytics
   stay, because those are disclosure rather than pricing. `price`,
   `priceNote` and `tiers` remain in `products.json` as the verified record
   and are deliberately rendered nowhere; do not "fix" them by putting them
   back on a page. The store listing is where a price belongs.
   The design HTML under `.context/designs/` and the synced sets under
   `public/designs/` are exempt — those are historical artifacts, not the
   site's own claims.
3. **An unavailable platform renders disabled with the reason**, never hidden and
   never linked to a track most people cannot open.
4. **Facts live in `src/data/products.json`, never in a page.** If you find
   yourself typing a price into JSX, stop.

## Data model

`src/data/products.json` is the single source of truth for every app fact.
`src/lib/products.ts` types it and derives everything else (counts, filters,
model→token maps). `src/data/profile.json` drives `/`, `/work` and `/resume`.

`verifiedOn` is the date a human last checked every row against the app repos.
Update it whenever you touch a fact.

**Not yet built:** `bin/products` in `~/git`, which will re-derive each fact from
the (private) app repos and **refuse to emit when a declared fact disagrees with
source** — so an app that gains an ad SDK breaks a build rather than a promise.
Until that exists, `products.json` is hand-maintained and `verifiedOn` is the
only guarantee.

## Layout

```
src/app/         routes — App Router, all statically exported
src/components/  site-chrome (header/footer), pills
src/lib/         products, profile, case-studies — typed accessors
src/data/        products.json, profile.json
public/          app-ads.txt, resume.pdf, favicon, logo
tests/           data invariants + assertions on the exported HTML
.context/designs/  the approved HTML+Tailwind design set this site was built from
```

Routes, and the goal each serves:

| Route | Serves |
|---|---|
| `/` | all six goals, in one scroll — work first, contact last |
| `/work`, `/work/[slug]` | showcase the work |
| `/about`, `/resume` | showcase the experience |
| `/products`, `/products/[slug]`, `/legal`, `/support` | the brand and legal site for every product |
| `/hire` | work together |
| `/contact` | get in touch |
| `/go/[slug]` | QR and bio redirect targets, `noindex` |

Dynamic route families: `/products/[slug]`, `/work/[slug]`, `/go/[slug]`. Each
has `generateStaticParams`; a new one without it will not be exported.

**`/work` exists because the case study was orphaned** — it was linked from the
bottom of one product page, with no index and no nav entry.

## The style guide

`~/git/personal/STYLE-GUIDE.md` governs design sets, and **this repo has one of
its own** at `.context/designs/`. The product design sets are NOT here and must
never be copied here again — they live in their own repos, which is where they
are reviewed. `/design/` was deleted in Sep 2026 along with `sync-designs.mjs`,
`designs.json` and 2.8MB of duplicated product HTML: a portfolio is a brand
site, not a design-set viewer, and publishing someone's wireframes on it made
the site slower, the repo larger, and the build dependent on eight private
repos and a token that had to be kept alive.

What the guide asks of this repo:

- **§8 Tokens, in full.** `src/app/globals.css` declares the same palette
  contract every product set declares, so one vocabulary covers the estate.
  Role names never hues; the CSS variable is the Tailwind token path with dots
  as dashes; every value a `var(--token)`; a theme is a **token remap**, never
  a `dark:` prefix. Tailwind v4's `--color-` namespace prefix is the only
  unavoidable difference from a set's `shared.css`.
- **§1–§7 for `.context/designs/`** — the site's own design set follows the
  same layout, manifest, navbar and flow chart as any product's. The app
  implements it; when a page and its wireframe disagree, the wireframe wins.
- **One vocabulary.** `globals.css` and the set's `shared.css` declare the same
  role names with the same values, asserted by eye at review and by
  `pnpm contrast` for the ratios. `--band` is the one token the set needed that
  §8 does not name: an inverted band cannot be `ink` + `ink-inverse`, because
  those flip with the theme and turn a dark page's footer into a bright slab.
- **§3's spirit in the app** — lucide only, pinned versions, no class that
  resolves to nothing.

`pnpm contrast` asserts every foreground/background pair in **both** palettes
against WCAG AA, computed from `globals.css`. A palette comment claiming a
ratio is a claim, and the theme this replaced carried one that was false.

## Tokens

`src/app/globals.css` holds the entire theme in a Tailwind v4 `@theme` block,
ported from `.context/designs/shared.css`. **Every value is a variable.** A
token with no entry there has no utility — that is the enforcement.

Two independent scales carry meaning and must not be conflated:
`--color-m-*` is the monetization model, `--color-live|beta|build|design` is the
release state. No model colour reads as a warning.

## Legal documents

`public/legal/` holds the privacy policies, deletion pages and terms for every
app. This repo is their home now — they moved off `ritvi-apps.github.io` in
Sep 2026.

**`ritvi-apps/legal` must never be deleted, and Pages must stay enabled on it.**
Six shipped app source files hardcode the old URLs and installed builds never
update, and two live Play listings use them as their privacy-policy URL. A 404
there is grounds for an app to be pulled. That repo is now a set of redirect
pages, each keeping its original path and carrying a canonical to here.

Edit the documents here. Nothing syncs them back.

## Gotchas

- **`public/app-ads.txt` is live AdMob revenue.** AdMob only honours it on the
  domain in the Play listing's developer-website field, and a missing file
  silently marks the inventory unauthorised. CI asserts it survived the export.
  Never delete it.
- `output: "export"` means no server features: no route handlers, no middleware,
  no `next/image` optimisation, no `dynamic = "force-dynamic"`.
- `trailingSlash: true`, so internal links are written `/products/charades/`.
- pnpm 12 reads settings from `pnpm-workspace.yaml`, not package.json's `pnpm`
  field. The build-script allowlist key is `allowBuilds`.
- `/legal/<app>/<doc>.html` are static files in `public/`, deliberately not Next
  routes — the path suffix stays byte-identical to the old URL, so the redirect
  is a pure host swap and no legal text passes through a re-author.
- The design set in `.context/designs/` is this site's own spec. **When a page
  and its wireframe disagree, the wireframe wins** and the page is corrected.
- **Never copy a product's design set into this repo.** It was done once, cost
  2.8MB and a build-time dependency on eight private repos, and was deleted.

## Deploy

Push to `main` → `.github/workflows/deploy.yml` runs lint, typecheck, contrast,
build, the `app-ads.txt` assertion, then publishes `out/`. No staging
environment. **No secrets** — the build reads nothing outside this repo.

One-time setup: repo **Settings → Pages → Source = GitHub Actions**.
