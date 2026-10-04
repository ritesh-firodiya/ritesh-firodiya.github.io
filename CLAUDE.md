# CLAUDE.md

Guidance for Claude Code working in this repository.

**Before starting work, read `.context/tasks.md`.** It is the ordered queue.
After finishing, tick the task and append a Session Note.

## What this is

The single public site for Ritesh Firodiya, deployed to **GitHub Pages** at
https://ritesh-firodiya.github.io/ via GitHub Actions on every push to `main`.

**It has one job: get Ritesh hired** into a senior, staff or tech-lead role
(decided 2026-10-04). Every page is written for someone deciding whether to
interview him. People who use the apps, and store reviewers, get Support and
Legal — reached from the footer, never from the header.

Stack: **Next.js 16 (App Router) + React 19 + Tailwind v4**, statically exported.
Node 22, pnpm. No server, no request-time data.

## Commands

```bash
pnpm sync         # pull design sets, wikis and store art out of the product repos
pnpm dev          # dev server (run `pnpm sync` once first)
pnpm contrast     # WCAG AA on both palettes, in globals.css AND the design set
pnpm build        # static export → out/
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test:data    # data invariants — no build needed
pnpm test:export  # assertions on the exported HTML in out/ — needs a build
pnpm check        # sync + contrast + lint + typecheck + test:data + build + test:export
```

## Nothing about a product is copied into this repo

A design set, a wiki page, a screenshot and an icon each have **one home: the
product's own repo**, under its `.context/`. This site reads them at build time
and commits none of them.

| What | Read from the product repo | Written here (gitignored) |
|---|---|---|
| Design sets | `.context/designs/` | `public/designs/`, `public/products/<slug>/designs/` |
| Wiki | `.context/wiki/` | `src/data/generated/wiki/<slug>.json` |
| Store art | `.context/listing/…/screenshots` | `public/media/<slug>/*.webp` |
| Icon | `.context/designs/brand/icon.*` | `public/media/<slug>/icon.*` |
| Stage board | which `.context/` folders have files | `src/data/generated/context.json` |

- `scripts/sync-designs.mjs` copies each design set, vendors its CDN assets,
  and **withholds any surface that fails `STYLE-GUIDE.md`** — the reasons land
  in `designs.json` and the project page prints them.
- It also publishes each product's wiki surface pages as Markdown at
  `/designs/<slug>/wiki/surfaces/` and rewrites one path in the copied
  `_chrome.js`, so the bar's notes button works on the site.
- `scripts/sync-context.mjs` does the wiki, the pictures and the board. Run it
  second: a wiki page about a screen links to that screen, and only the design
  manifest knows which screens were published.
- `scripts/designs/sources.mjs` decides where a repo comes from: a sparse,
  blobless clone with `DESIGNS_TOKEN` in CI, `~/git/products/<repo>` locally.
- `scripts/designs/secrets.mjs` scans every design screen and every wiki page
  for credential shapes and **stops the build on a hit**. These bytes come out
  of private repos onto a public host and nothing else looks at them.
- `src/lib/generated.ts` reads the generated JSON off disk with a fallback, so
  a clean clone type-checks before the sync has run.

**Every wiki page is published** — all types, including entities and synthesis
(owner's decision, 2026-10-04). The secret scan is the only filter.

A picture is the product's store art. A product with none can name one of its
own design screens in `products.json` (`"embed": "web/tax/tax.html"`), and the
page embeds it live — which is why Chitragupt follows the theme toggle.

## Rules that exist because they were broken once

An earlier version claimed **"no ads in our games"** and **"one-time purchases,
not subscriptions"** on a page linked from live store listings. Both were false.
A promise on behalf of every app is only as true as the least convenient app.

1. **No studio-wide claims.** Any statement not true of every app it covers is
   scoped to the apps it is true of, or cut.
2. **Prices are not published on this site.** The *model* (subscription,
   one-time, ads), the ads and the analytics are stated, because that is
   disclosure. `price`, `priceNote` and `tiers` stay in `products.json` as the
   record and are rendered nowhere. The store listing is where a price belongs.
3. **An unavailable platform renders disabled with its reason**, never hidden
   and never as a link most people cannot open.
4. **Facts live in `src/data/products.json`, never in a page.**
5. **A count is derived, never typed.** "13 projects", "3 live", "529 screens"
   come from the data. The stage board's dots are counted from each product's
   `.context/` folders (`src/lib/board.ts`); nobody edits this site to move one.
6. **A missing thing is visibly missing.** No screenshot is a hatched slot that
   says so. A withheld design set is a card that lists the failed checks.

## Data model

`src/data/products.json` is the single source of truth for every app fact.
**Its array order is the running order of the site**: the first three lead the
home page. To change what leads, re-order the file.

- The release state pill is **derived** from `platforms` (`stageOf` in
  `src/lib/products.ts`): any `live` → live; any `beta`/`closed` → in testing;
  otherwise in build, or in design when `notBuilt`. Only the words
  (`stageLabel`) are typed, and a test checks the two agree.
- `shots` names a product's best store screenshots, best first. The listing's
  own order is written for a store page, and its tilted close-ups read badly
  at card size.
- A `closed` platform renders as a **"Join the test"** button: a pre-filled
  email asking to be added to the tester list. `none` renders disabled.
- A closed platform's steps offer **Gmail's compose page beside `mailto:`**
  (`src/lib/mail.ts`). A mailto link does nothing on a machine with no mail
  app, and the button then looks broken. `testUrl` is the store's own tester
  page, for after the account has been added.
- `embed` also gives a product with no store art a picture: one of its own
  design screens, live. A product with a build or a picture is a card on
  `/work/`; the rest are rows.
- `src/lib/case-studies.ts` holds the long-form text for a project page. A
  product without one shows its `features` instead.
- `src/data/profile.json` drives the home page, About and the résumé.
- `verifiedOn` is the date a human last checked every row. The tests fail once
  it is 30 days old. Check the **stores** and each product's
  `.context/ops/release.yml`, not memory.

## Routes

| Route | What it is |
|---|---|
| `/` | who, where, what, how — in that order |
| `/work/` | every project. Cards for what has a build, rows for what does not |
| `/products/[slug]/` | one project: what it is, where to get it, how far it has got, the case study |
| `/products/[slug]/wiki/`, `…/wiki/[type]/[page]/` | that project's wiki |
| `/products/[slug]/designs/` | that project's own design gallery — a static file, not a route |
| `/process/` | the eight stages, the board, every design set and wiki |
| `/about/`, `/resume/`, `/contact/` | the person |
| `/support/`, `/legal/` | for app users and store reviewers |
| `/go/[slug]/` | short links for QR codes and bios, `noindex` |
| `/products/`, `/hire/`, `/design/gallery/`, `/work/chitragupt/` | forwarding addresses (meta refresh), `noindex` |

Project pages stay at `/products/<slug>/` because store listings point there.

Dynamic families need `generateStaticParams` or they are not exported. A
forwarding address uses `src/components/forward.tsx`, not `redirect()` — under
a static export `redirect()` only works once the page's JavaScript has run.

## Design set and style

`.context/designs/web/` is this site's own design set, built to
`~/git/personal/STYLE-GUIDE.md`. **When a page and its wireframe disagree, the
wireframe wins**: fix the page, or change the wireframe first and say so in its
notes page (`.context/wiki/surfaces/`). `node scripts/designs/serve.mjs` serves
the set for review.

`src/app/globals.css` holds the theme in a Tailwind v4 `@theme` block, ported
from the set's `shared.css`: same role names, same values. `pnpm contrast`
checks both files and reports any role one declares and the other does not.

- Role names, never hues. A theme is a **token remap**, never a `dark:` prefix.
- The component classes (`.btn`, `.card`, `.state`, `.chip`, `.embed`, `.track`,
  `.dot`) are the set's, in `@layer components` so a utility beside one wins.
- **Reserved colours: the release state** (`live`, `test`, `build`, `draft`).
  Used for nothing else.
- Icons are lucide.

## Tests

`tests/data.test.mjs` reads `src/data/`: unique URL-safe slugs; an open
platform has a url and a closed one has a reason instead; an iOS link labelled
TestFlight is one; every local legal path exists; a product is called live only
when something is live; no price or rupee figure in `src/app`; no studio-wide
claim; generated folders are gitignored; `verifiedOn` is under 30 days old.

`tests/export.test.mjs` reads `out/`: every indexable page declares its own
canonical; the noindex set is exactly the short links and the forwarding
addresses; every old address still forwards to a page that exists; every wiki
page that was synced was exported; every picture a page shows is a file that
shipped; the sitemap matches; `app-ads.txt` survived; nothing over 100KB ships
unreferenced.

## Legal documents

`public/legal/` holds the privacy policies, deletion pages and terms. They are
static files, deliberately not routes: **the paths are hardcoded in shipped app
builds and in store listings and must never change**, and no legal text passes
through a re-author. `public/legal/legal.css` is their one stylesheet.

**`ritvi-apps/legal` must never be deleted, and Pages must stay enabled on it.**
Shipped builds hardcode the old URLs and two live Play listings use them. That
repo is a set of redirect pages pointing here.

## Gotchas

- **`public/app-ads.txt` is live AdMob revenue.** Never delete it. CI asserts
  it survived the export.
- `output: "export"`: no route handlers, no middleware, no image optimisation.
- `trailingSlash: true`, so internal links are written `/products/charades/`.
- pnpm reads settings from `pnpm-workspace.yaml`. A dependency published in the
  last 24 hours will not install (`minimumReleaseAge`).
- AskCal is a global app. Its own rule is that nothing a user reads brands it
  to one country, and that holds for its page here.

## Deploy

Push to `main` → `.github/workflows/deploy.yml`: lint, typecheck, contrast,
data tests, **`pnpm sync`**, build, export tests, then publish `out/`.

**Four secrets, all read-only on product repos:**

| Secret | Reads | Kind |
|---|---|---|
| `DESIGNS_TOKEN` | the eight repos under `ritvi-apps` | fine-grained PAT, Contents: read. **Expires 2027-10-05.** Its resource owner must be the org: a token owned by the user account cannot see org repos |
| `DEPLOY_KEY_SCRVIO` | `scrvio/scrvio` | deploy key, never expires |
| `DEPLOY_KEY_TRUNK` | `ritesh-firodiya/trunk` | deploy key |
| `DEPLOY_KEY_DWARSEVA` | `dwarseva/dwarseva` | deploy key |

A fine-grained PAT covers one owner, so a product under another owner gets a
deploy key and a `key:` entry in `scripts/designs/sources.mjs`. When any of
these is missing or dead the sync step fails and the deploy stops, which is the
intended failure: a site with its screens, wikis and pictures missing must not
publish. `actions/checkout` runs with `persist-credentials: false`, or git
sends the job's own token instead of these.

One-time setup: repo **Settings → Pages → Source = GitHub Actions**.
