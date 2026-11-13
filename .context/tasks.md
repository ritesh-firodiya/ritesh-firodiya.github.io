---
updated: 2026-11-10
horizon: 2026-11-17
---

# Tasks — ritesh-firodiya.github.io

## Now
1. [ ] T027 Rotate `DESIGNS_TOKEN` before 2027-10-05, and sooner if this session's transcript is ever shared — the value was pasted into chat once
2. [ ] T012 Set the Play website field to `/products/<slug>/` for charades and tic-tac-toe — both point at the site root today; their App Store listings are already right. Play Console → the app → Store settings → Website: https://play.google.com/console/u/0/developers/4747277435467425614/app-list
3. [ ] T028 https://chitragupt.ai/legal/delete-account now answers 200 (checked 2026-11-10): forward `public/legal/chitragupt/delete-account.html` to it as 0380f8b did, and point `legal.delete` in products.json there. Until the web deploy, this site keeps the full page

## Parallel
- [ ] T024 [P] Case studies for Aakalan and Charades  `feat:0001`
- [ ] T025 [P] Wiki pages ship ~125KB each because Next writes the page three times; 617 pages is 89MB of the 103MB export. Fine for Pages (1GB), worth trimming

## Canon removal
- [ ] T029 Finish removing canon (`canon check` passed with no warnings on 2026-11-14; nothing checks `.context/` now). Left on purpose, since they are site features, not tooling:
      the build still loads the design shell and `scan.mjs` from canon-cli (`scripts/sync-designs.mjs`, `scripts/designs/sources.mjs`, `scripts/designs/conformance.mjs`), and `.context/designs/shell.js` loads it from `unpkg.com/@freetesh/canon/shell/`.
      The "Checked by canon" strip on each project page (`src/lib/canon.ts`, `src/app/products/[slug]/page.tsx`) reads each product's `.context/context.yaml`, which the product repos have deleted, so every page now says "Not on canon yet". The stage canvas (`scripts/stages.mjs`) reads `pipelines.default` from the same file and goes blank. Decide: drop both, or read them from somewhere else.
      Wiki pages that describe that pipeline (`claims-and-facts`, `how-it-ships`, `nothing-copied`, `surfaces/project`) still name `canon pipeline`, `canon flow` and `context.yaml`; reword them when the strip and canvas are decided.
      The canon project page, résumé line, footer link and home card are published content about canon and stay.
