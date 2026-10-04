---
id: DECISION.2026-10-04.HIRING-FIRST-REDESIGN
type: decision
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Decision
The site has one job: get Ritesh hired into a senior, staff or tech-lead role.
The design set was deleted and redrawn for that reader, approved, and built.

## Why
The previous site served six goals in one scroll. The owner's verdict was that
it "does not help with my purpose at all".

## What changed
- **One reader.** Every page is written for a hiring manager. App users and
  store reviewers get Support and Legal, reached from the footer.
- **Work and Products are one index**, `/work/`. Project pages stay at
  `/products/<slug>/` because store listings point there.
- **Hire is gone.** Consulting is three lines on Contact. `/hire` redirects.
- **How I build is a top-level page**, listing every project's design set and
  wiki.
- **Every project's wiki is published in full** — all page types, including
  entities and synthesis. Chosen by the owner on 2026-10-04 over an allow-list.
  The build scans for credential shapes and stops on a hit.
- **New direction: PROOF.** Cool paper, navy ink, one blue, white cards with
  real screenshots. Replaces INDEX (white, vermilion, lists, no cards).
- **The wiki moved** from `.context/documents/wiki/` to `.context/wiki/`, the
  path the canonical `_chrome.js` now reads.

## After the first review (same day)
- **Order of importance: AskCal, Aakalan, Charades.** The hero, Selected work
  and the Work page all follow it. The project example is AskCal.
- **No picture is duplicated between this repo and a product.** Screenshots are
  the product's store art in `.context/listing/`, icons are in
  `.context/designs/brand/`, read at build time. The committed copies in
  `public/media/` go.
- **Chitragupt is shown as its own design screen, embedded live**, so it
  follows the light and dark toggle. It has no web screenshot; the old picture
  was a dark capture with a drawn browser bar. It also has an Android app.
- **Chitragupt is "Pre-launch", not "Live".** Its `ops/release.yml` says the
  web is deployed but not launched and the Android app is on the internal
  track. Live projects are three, not four. `products.json` still says
  otherwise and must be corrected.
- **The process is eight stages, not "design before code".** Idea, Research,
  Define, Design, Build, Release, Market, Operate. Each project is placed on
  them from what its repo actually holds.

## Not decided here
- Prices stay off the site (rule 2b, Sep 2026). Unchanged.
- No studio-wide claims. Unchanged.

## Status
Active. Built on 2026-10-04.

## Sources
- .context/designs/web/routes.js
