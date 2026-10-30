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
pnpm contrast     # WCAG AA on both palettes, in globals.css AND the set's tokens.js
pnpm build        # static export → out/
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test:data    # data invariants — no build needed
pnpm test:sync    # the publish gates: secrets, links, the design-set gate and its scan sandbox
pnpm test:export  # assertions on the exported HTML in out/ — needs a build
pnpm check        # sync + contrast + lint + typecheck + test:data + test:sync + build + test:export
```

## Layout

```
src/
  app/          # routes: [[routes]]
  components/   # forward.tsx is how an old address forwards
  data/         # products.json (every app fact), profile.json; generated/ is gitignored
  lib/          # products.ts (stageOf, surfaceTags), mail.ts, case-studies.ts, generated.ts
scripts/        # sync-designs.mjs, sync-context.mjs, flow.mjs, funnel.mjs, designs/
tests/          # data, sync, export, funnel, flow
public/legal/   # legal documents: never move a path
public/app-ads.txt  # live AdMob revenue: never delete
.context/       # everything that is not code. designs/ is this site's own design set
```

## Conventions

- `output: "export"`: no route handlers, no middleware, no image optimisation.
- `trailingSlash: true`, so internal links are written `/products/charades/`.
- pnpm reads settings from `pnpm-workspace.yaml`. A dependency published in the
  last 24 hours will not install (`minimumReleaseAge`).
- Dynamic families need `generateStaticParams` or they are not exported. A
  forwarding address uses `src/components/forward.tsx`, not `redirect()`.
- **Mobile first.** Unprefixed is the phone; `sm:`, `md:`, `lg:` only add. No
  `max-width` media query, no `max-*:` utility, no table that scrolls sideways.
- **Keep it short.** No intro paragraphs, no closing call-to-action bands, no fact
  twice on a page. Do not add a page for something a section can hold.
- Role names, never hues. A theme is a token remap, never a `dark:` prefix.
  `globals.css` stays in step with the set's `tokens.js`. Reserved colours: the
  release state, used for nothing else. Icons are lucide.
- AskCal is a global app. Its own rule is that nothing a user reads brands it
  to one country, and that holds for its page here.

## Hard rules

**Nothing about a product is copied into this repo.** Design sets, wiki pages,
screenshots and icons have one home, the product's repo. This site reads them at
build time into gitignored folders and commits none of them: [[nothing-copied]].

**Public host.** Every wiki page is published, and `scripts/designs/secrets.mjs`
stops the build on a credential shape. It is the only filter: [[nothing-copied]].

**Claims** ([[claims-and-facts]]). Earlier false claims on a page linked from live
store listings are why these exist. Code and tests cite the numbers.

1. **No studio-wide claims.** A statement not true of every app it covers is scoped
   to the apps it is true of, or cut.
2. **Prices are not published on this site.** `price`, `priceNote` and `tiers` stay
   in `products.json` and are rendered nowhere.
3. **An unavailable platform renders disabled with its reason**, never hidden.
4. **Facts live in `src/data/products.json`, never in a page.**
5. **A count is derived, never typed.**
6. **A missing thing is visibly missing.**

**Data.** `products.json`'s array order is the running order of the site. The tests
fail once `verifiedOn` is 30 days old; check the **stores** and each product's
`.context/ops/release.yml`, not memory: [[data-model]].

**Wireframe.** When a page and its wireframe disagree, the wireframe wins: fix the
page, or change the wireframe first and say so in its notes page: [[style-rules]].

**Legal.** This repo is the only publisher of legal documents. The paths under
`public/legal/` are hardcoded in shipped app builds and store listings and **must
never change**. Do not delete `ritvi-apps.github.io` until AdMob reads `app-ads.txt`
from this host: [[legal-publisher]].

**Ad revenue. `public/app-ads.txt` is live AdMob revenue.** Never delete it. CI
asserts it survived the export.

**Deploy.** Push to `main` publishes. A missing or dead secret stops the deploy on
purpose: a site with its screens, wikis and pictures missing must not publish.
`DESIGNS_TOKEN` expires 2027-10-05. Keep `persist-credentials: false` on checkout:
`.context/ops/runbooks/deploy.md`.

## Where the detail lives

| Need | Read |
|---|---|
| A rule and its reason, any screen's notes | `.context/wiki/index.md` |
| Routes and forwarding addresses | [[routes]] |
| `products.json` fields | [[data-model]] |
| The "How it ships" section | [[how-it-ships]] |
| Design set, theme | [[style-rules]] |
| What the tests assert | [[site-tests]] |
| Deploying | `.context/ops/runbooks/deploy.md` |
| Secrets and Pages setup | `.context/ops/setup.md` |
| What is live now | `.context/ops/release.yml` |

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
