---
id: BUG-0002
status: fixed
severity: medium
priority: p2
last-verified: 2026-11-02
source: backfill
---
# Every page declared the homepage as canonical

## Summary
The root layout set a canonical of `/`, and Next passes metadata down to child pages. Each page that did not override it told search engines it was a copy of the home page.

## Expected
Each indexable page declares its own canonical.

## Actual
35 of 38 pages pointed at the home page, including every product page. The page looked right alone and was wrong only once built, so the check reads the export. Keep the canonical out of the root layout.

## Evidence
- 1ba9978: the fix and the count.
- 5b33b1e: `tests/export.test.mjs` asserts it.
