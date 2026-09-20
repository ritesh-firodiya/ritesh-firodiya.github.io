# CLAUDE.md

Guidance for Claude Code working in this repository.

## What this is

The single public site for Ritesh Firodiya, deployed to **GitHub Pages** at
https://ritesh-firodiya.github.io/ via GitHub Actions on every push to `main`.

It carries everything: the portfolio, every app with its real price, the
published design system, the development and marketing process, and legal.

Stack: **Next.js 16 (App Router) + React 19 + Tailwind v4**, statically exported.
Node 22, pnpm. No server, no request-time data, no client state.

Replaced a Deno Fresh 1.1.2 + Twind site in Sep 2026. Twind was unmaintained and
Fresh 2 drops the plugin, so a Tailwind port was owed either way; Tailwind v4's
CSS-first `@theme` meant the design tokens ported almost verbatim.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # static export → out/
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm check        # lint + typecheck + build — run this before pushing
```

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
src/lib/         products, profile, design, notes, process — typed accessors
src/data/        products.json, profile.json
public/          app-ads.txt, resume.pdf, favicon, logo
.context/designs/  the approved HTML+Tailwind design set this was built from
```

Dynamic route families: `/products/[slug]`, `/go/[slug]`, `/notes/[slug]`. Each
has `generateStaticParams`; a new one without it will not be exported.

**`/products/<slug>/designs/` is not a route.** It is a static file written by
`scripts/sync-designs.mjs` into `public/products/`, and its contents are the app
repo's own `.context/designs/index.html` — the gallery the screens were designed
and reviewed against — byte-identical apart from an injected `<base href>` that
keeps its relative links pointing at the real screens under `/designs/`. Do not
wrap it in a Next route: a header, a back link and a scroll container of ours
around a document that already has its own is a second gallery that drifts. A
set with two surfaces also gets `/products/<slug>/designs/<surface>/`.

The same script neutralises links a gallery makes to screens that were never
drawn — the href goes, the label and a `title` stay — so the gap is visible
rather than a 404.

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
- The design set in `.context/designs/` is the spec. **When a page and its
  wireframe disagree, the wireframe wins** and the page is corrected.

## Deploy

Push to `main` → `.github/workflows/deploy.yml` runs lint, typecheck, build, the
`app-ads.txt` assertion, then publishes `out/`. No staging environment.

One-time setup: repo **Settings → Pages → Source = GitHub Actions**.
