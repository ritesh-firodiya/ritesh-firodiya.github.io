---
id: PROB-0004
status: solving
source: backfill
priority: p2
last-verified: 2026-11-02
---
# Store facts go stale without notice

## Summary
`src/data/products.json` holds store status, links and versions by hand. The stores change without telling this repo, so the site drifts. Once it sent visitors to a TestFlight link after the app was live on the App Store, and neither this repo nor the app's own status file said so. Only the store did.

## Impact
Visitors get wrong links and wrong status. It keeps coming back: 2026-09-26, 2026-10-31 and 2026-11-01 all needed corrections.

## Expected
A build refuses to run when a declared fact disagrees with its source. That is the plan stated in the `$comment` of `products.json`. The script it names, `bin/products`, does not exist yet. Today a test only fails when `verifiedOn` is over 30 days old, and a person does the check against the stores themselves, not the app repos.

## Evidence
- a3424a1: the stale facts, and why the store is the source.
- 5b33b1e: the 30-day limit.
- 3d08565, 2326902: later corrections.
- `src/data/products.json`, `tests/data.test.mjs`.
