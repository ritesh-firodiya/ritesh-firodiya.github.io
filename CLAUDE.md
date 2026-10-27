# CLAUDE.md

Guidance for Claude Code working in this repository.

**Before starting work, read `.context/tasks.md`.** It is the ordered queue.
After finishing, delete the task.

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
pnpm test:sync    # the publish gates: secrets, links, routes.js sandbox
pnpm test:export  # assertions on the exported HTML in out/ — needs a build
pnpm check        # sync + contrast + lint + typecheck + test:data + test:sync + build + test:export
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
| Stage counts | which `.context/` folders have files | `src/data/generated/context.json` |
| canon config | `.claude/canon.yaml` (version, modules) | `src/data/generated/canon.json` |
| Release state | `.context/features/*.md` (`status:`) and `.context/ops/release.yml` | `src/data/generated/funnel.json` |
| Conversation flow | `.context/metrics/flow.json` (written by `~/git/bin/flow`) | `src/data/generated/flow.json` |

- `scripts/sync-designs.mjs` copies each design set, vendors its CDN assets,
  and **withholds any surface that fails the `design-sets` standard** — the reasons land
  in `designs.json` and the project page prints them.
- It also publishes each product's wiki surface pages as Markdown at
  `/designs/<slug>/wiki/surfaces/` and rewrites one path in the copied
  `_chrome.js`, so the bar's notes button works on the site.
- `scripts/sync-context.mjs` does the wiki, the pictures and the canon config. Run it
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
5. **A count is derived, never typed.** "15 projects", "3 live", "7 modules"
   come from the data. The canon strip on a project page reads the product's own
   `.claude/canon.yaml` (synced into `canon.json`); nobody edits this site to change it.
6. **A missing thing is visibly missing.** No screenshot is a hatched slot that
   says so. A withheld design set is a card that lists the failed checks.

## Data model

`src/data/products.json` is the single source of truth for every app fact.
**Its array order is the running order of the site**: the first four are the
home page's large cards, the rest are tiles, in this order. To change the order,
re-order the file.

- The release state pill is **derived** from `platforms` (`stageOf` in
  `src/lib/products.ts`): any `live` → live; any `beta`/`closed` → in testing;
  otherwise in build, or in design when `notBuilt`. Only the words
  (`stageLabel`) are typed, and a test checks the two agree.
- `shots` names a product's best store screenshots, best first. The listing's
  own order is written for a store page, and its tilted close-ups read badly
  at card size.
- A `closed` platform renders as a **"Join the test"** button: a pre-filled
  email asking to be added to the tester list. `none` is not shown.
- A closed platform's button opens **Gmail's compose page**, not `mailto:`
  (`src/lib/mail.ts`). A mailto link does nothing on a machine with no mail
  app, and the button then looks broken. `testUrl` is the store's own tester
  page, shown as a second button.
- `embed` also gives a product with no store art a picture: one of its own
  design screens, live. `embedMobile` names a phone screen to stand beside a
  web one. Every product is a card on the home page; one with no picture shows
  a hatched slot.
- **Mobile / Web tags** are derived (`surfaceTags` in `src/lib/products.ts`)
  from the surfaces a product draws and the platforms it has built. A product
  with both shows both.
- **"How it ships" is derived, never typed.** Its numbers are the product's
  `.context/metrics/flow.json`, which `~/git/bin/flow` writes on the owner's
  machine from Claude transcripts and git (CI cannot read transcripts; counts
  and times only, never prompt text). The stages are the product's own — the
  `pipeline:` in its `.claude/canon.yaml`, which `canon pipeline` resolves —
  each with a one-line rule in `bin/flow` and `FLOW_STAGE`; each step's share and median time, the slowest step and the biggest drop
  (`scripts/flow.mjs`, `tests/flow.test.mjs`). Re-run `bin/flow <product>
  --write` and commit the file in the product repo to refresh it. Below it,
  each surface's state and the feature counts come from `scripts/funnel.mjs`
  (`release.yml` and `features/` statuses; a `verified: false` block is
  skipped). A product with no flow.json shows no section.
- `src/lib/case-studies.ts` holds the long-form text for a project page. A
  product without one shows its `features` instead.
- `src/data/profile.json` drives the home page and the résumé.
- `verifiedOn` is the date a human last checked every row. The tests fail once
  it is 30 days old. Check the **stores** and each product's
  `.context/ops/release.yml`, not memory.

## Routes

| Route | What it is |
|---|---|
| `/` | who (one line), then `#work` (four large cards, then a tile per project), then `#tools` (canon and canon, one line each) |
| `/products/canon/` | canon: the problem, how it works, what it caught, the lifecycle. Not in `products.json`; its content is `src/lib/canon.ts` |
| `/products/[slug]/` | one project: what it is, where to get it, its screens and wiki, its funnel ("How it ships"), the write-up |
| `/products/[slug]/wiki/`, `…/wiki/[type]/[page]/` | that project's wiki |
| `/products/[slug]/designs/` | that project's own design gallery — a static file, not a route |
| `/resume/` | the person |
| `/support/`, `/legal/` | for app users and store reviewers |
| `/go/[slug]/` | short links for QR codes and bios, `noindex` |
| `/work/`, `/process/`, `/about/`, `/contact/`, `/products/`, `/hire/`, `/design/gallery/`, `/work/chitragupt/` | forwarding addresses (meta refresh), `noindex` |

**Mobile first.** Every base style and every unprefixed utility is the phone
layout; `sm:`, `md:` and `lg:` only add to it. There is no `max-width` media
query and no `max-*:` utility in this repo. Where a wide layout cannot shrink
(a wide table), the phone gets its own markup and the
table appears from `md` up — never a table that scrolls sideways.

**Keep it short.** The site was cut down on 2026-10-04 because it explained too
much: no intro paragraphs, no closing call-to-action bands, no fact that
appears twice on a page. Work, About, Process and Contact were separate pages
and are now sections of Home or the résumé. Do not add a page for something a
section can hold.

Project pages stay at `/products/<slug>/` because store listings point there.

Dynamic families need `generateStaticParams` or they are not exported. A
forwarding address uses `src/components/forward.tsx`, not `redirect()` — under
a static export `redirect()` only works once the page's JavaScript has run.

## Design set and style

`.context/designs/web/` is this site's own design set, built to
the `design-sets` standard. **When a page and its wireframe disagree, the
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

**This repo is the only publisher of legal documents.** `ritvi-apps/legal` was
deleted on 2026-10-12, so the old `ritvi-apps.github.io/legal/...` URLs are
404s. Builds older than Charades 1.0.32, Tic Tac Toe 1.0.11 and Aakalan 1.0.19
hardcode them and have lost their privacy link. `ritvi-apps.github.io` still
redirects here and is being retired; do not delete it until AdMob reads
`app-ads.txt` from this host for the iOS Tic Tac Toe app — see
`~/git/products/invite.md` under "Not products".

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
| `DEPLOY_KEY_SCRVIO` | `ritvi-apps/scrvio` | deploy key, never expires |
| `DEPLOY_KEY_BABUL` | `ritvi-apps/babul` | deploy key (made 2026-10-23; the private half is in `~/git/local/secrets/personal/ritesh-firodiya.github.io/`) |
| `DEPLOY_KEY_DWARSEVA` | `ritvi-apps/dwarseva` | deploy key |

A fine-grained PAT covers one owner, so a product under another owner gets a
deploy key and a `key:` entry in `scripts/designs/sources.mjs`. When any of
these is missing or dead the sync step fails and the deploy stops, which is the
intended failure: a site with its screens, wikis and pictures missing must not
publish. `actions/checkout` runs with `persist-credentials: false`, or git
sends the job's own token instead of these.

One-time setup: repo **Settings → Pages → Source = GitHub Actions**.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
