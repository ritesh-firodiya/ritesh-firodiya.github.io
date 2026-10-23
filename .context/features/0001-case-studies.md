---
id: FEAT-0001
type: feature
status: planned
last-verified: 2026-10-23
---
## Summary
Case studies for Aakalan and Charades, the two projects that lead the home grid.

## Motivation
Both project pages show a feature list. A hiring reader wants the problem, the
choices made, and the result — a write-up, not a list.

## Acceptance scenarios
- Given a reader on `/products/aakalan/`, when the page loads, then it shows a
  case study: the problem, the decisions with their reasons, and what shipped.
- Given a reader on `/products/charades/`, the same holds.
- Given either case study, every claim it makes is backed by the product's own
  wiki or store listing, read at build time — nothing is copied into this repo.

## Out of scope
- Case studies for the other thirteen projects.

## Open questions
- Does the case study replace the feature list or sit above it?
