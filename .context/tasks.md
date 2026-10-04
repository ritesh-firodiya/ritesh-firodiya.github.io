---
updated: 2026-10-04
horizon: 2026-10-18
---

# Tasks — ritesh-firodiya.github.io

## Now
1. [ ] T020 Owner reviews the built site locally, then commit and push `redesign/hiring-first`
2. [ ] T021 Before the first deploy: confirm `DESIGNS_TOKEN` has not expired and covers all eight product repos  needs:T020
3. [ ] T022 After deploy: open the live site, confirm a wiki page and a design gallery load, then fill `ops/release.yml`  needs:T021

## Parallel
- [ ] T011 [P] Copy the frame-derived `screenshots.html` back to the canonical charades set
- [ ] T023 [P] Re-verify every row of `products.json` against the stores and bump `verifiedOn` (due by 2026-10-26)
- [ ] T024 [P] Case studies for Aakalan and Charades — they lead the site and show a feature list, not a write-up
- [ ] T025 [P] Wiki pages ship ~125KB each because Next writes the page three times; 617 pages is 89MB of the 103MB export. Fine for Pages (1GB), worth trimming

## Blocked
- [ ] T012 Confirm store listings point at `/products/<slug>/`
      blocked-by: not verified against Play Console or App Store Connect  since:2026-10-04
      unblock: read each listing's website field  next-check:2026-10-11
- [ ] T026 Remote sync is untested: `sources.mjs` now sparse-checks the wiki and listing folders and reads the tree with `git ls-tree`
      blocked-by: needs DESIGNS_TOKEN, which only CI has  since:2026-10-04
      unblock: watch the first CI run's "Pull design sets…" step  next-check:on first push

## Done
- [x] T000 Delete the old design set and redraw it hiring-first  done:2026-10-04
- [x] T001 Owner reviewed the design set  done:2026-10-04
- [x] T002 Palette ported to `globals.css`; contrast passes both themes, both files  done:2026-10-04
- [x] T003 Every route built from the wireframes  done:2026-10-04
- [x] T004 Wiki sync and routes: 617 pages across 8 products  done:2026-10-04
- [x] T005 Forwarding addresses for `/hire`, `/products`, `/design/gallery`, `/work/chitragupt`  done:2026-10-04
- [x] T006 Legal documents share one stylesheet; text untouched  done:2026-10-04
- [x] T007 `CLAUDE.md` and `README.md` rewritten  done:2026-10-04
- [x] T008 `STATUS.md` split into this file and `ops/release.yml`  done:2026-10-04
- [x] T009 askcal design set now publishes (fixed upstream; all eight sets pass)  done:2026-10-04
- [x] T010 property-app design set now publishes (fixed upstream)  done:2026-10-04
- [x] T013 Pictures read from the product repos at build time; `public/media` untracked  done:2026-10-04
- [x] T014 Stage board derived from each product's `.context/` folders  done:2026-10-04
- [x] T015 `products.json`: Chitragupt is pre-launch with an Android app; AskCal is in App Store review  done:2026-10-04

## Session Notes
### 2026-10-04
- Done: T000. 15 screens + 1 state, light and dark, responsive to 390px.
- Learned: CORE's bare mode pins the frame width, so a web set needs
  `[data-bare] .phone { width: 100% }` in its components block to be viewed at
  phone width.
- The numbers on the screens (450 screens, 617 wiki pages) are placeholders
  counted on disk on 2026-10-04. The build must read them from generated data.
- Review round 1: AskCal > Aakalan > Charades; no duplicated pictures; Chitragupt
  shown as its live design screen; process redrawn as eight stages with a board.
- The board's dots were set by hand from a folder count on 2026-10-04
  (`raw`/`wiki/synthesis` = Research, `features` = Define, `listing` = Release,
  `marketing` = Market, `metrics`/`support` = Operate). T014 makes it derived.
- Build: the wireframes' component classes moved into `globals.css` under
  `@layer components`, so the JSX uses the same class names as the screens.
- Learned: `redirect()` under `output: "export"` only works once JavaScript has
  run, and the page it writes is indexable with no canonical. A forwarding
  address is `src/components/forward.tsx` — a meta refresh, noindex.
- Learned: every design set now passes the publish gate, so nothing is withheld
  today. The "Design set withheld" card and row are built and currently unused.
- Deviation from the wireframe: a legal document keeps no site header. It is a
  static file restyled by `public/legal/legal.css`, with a breadcrumb to Legal.
- Next: T020.
