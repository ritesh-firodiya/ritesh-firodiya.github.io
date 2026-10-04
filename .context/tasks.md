---
updated: 2026-10-04
horizon: 2026-10-18
---

# Tasks — ritesh-firodiya.github.io

## Now
1. [ ] T027 Rotate `DESIGNS_TOKEN` before 2027-10-05, and sooner if this session's transcript is ever shared — the value was pasted into chat once

## Parallel
- [ ] T028 [P] Redraw `home/home.html`, `work/project.html` and `work/unreleased.html` to match the built pages. The site was changed first on 2026-10-04 (review round 3); each screen's notes page records the departure
- [ ] T011 [P] Copy the frame-derived `screenshots.html` back to the canonical charades set
- [ ] T023 [P] Re-verify every row of `products.json` against the stores and bump `verifiedOn` (due by 2026-10-26)
- [ ] T024 [P] Case studies for Aakalan and Charades — they lead the site and show a feature list, not a write-up
- [ ] T025 [P] Wiki pages ship ~125KB each because Next writes the page three times; 617 pages is 89MB of the 103MB export. Fine for Pages (1GB), worth trimming

## Blocked
- [ ] T012 Confirm store listings point at `/products/<slug>/`
      blocked-by: not verified against Play Console or App Store Connect  since:2026-10-04
      unblock: read each listing's website field  next-check:2026-10-11

## Done
- [x] T020 Committed, pushed and merged to main  done:2026-10-04
- [x] T021 New org-owned `DESIGNS_TOKEN` created and set  done:2026-10-04
- [x] T022 Deployed and verified live  done:2026-10-04
- [x] T026 Remote sync proven, locally with the token and in CI  done:2026-10-04
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
- Deploy: three failures before it went live, each a different cause.
  (1) The first token's resource owner was the user account, which cannot see
  org repos. (2) A value piped into `gh secret set` through the shell hook
  arrived mangled; `gh secret set -f <env file>` is the reliable form.
  (3) `actions/checkout` leaves the job token in the git config as an
  Authorization header, and git sends it instead of the token in the URL —
  fixed with `persist-credentials: false` and by clearing the header in
  `sources.mjs`. All three report as "Repository not found".
- Review round 3, on the live site: leads are AskCal, Chitragupt, Aakalan;
  a product names its own best screenshots (`shots` in products.json) because
  the listing's tilted close-ups read badly small; a closed platform is now a
  "Join the test" button (a pre-filled email) instead of a disabled one; the
  project page is flat — hero, one facts row, two links, the write-up; type
  and spacing are tighter everywhere.
- Next: T028, T012, T023.
