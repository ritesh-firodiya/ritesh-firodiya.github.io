---
id: PROB-0006
status: solving
source: backfill
priority: p2
last-verified: 2026-11-02
---
# Legal pages sat on a host being retired

## Summary
Legal documents lived on a host that was to be retired, and shipped builds and store listings hardcode their paths. They had to move without changing a path or a word.

## Impact
The old legal repo was deleted, so builds that hardcode the old address have lost their privacy link. [legal-publisher](../wiki/concepts/legal-publisher.md) lists which ones. An earlier note in the repo said that repo must never be deleted.

## Expected
Every shipped legal path answers, from this site or the product's own domain. The move is not finished: the old host is kept for `app-ads.txt` ([legal-publisher](../wiki/concepts/legal-publisher.md)), and one deletion page waits on its product's domain (T028 in `tasks.md`).

## Evidence
- 7e380b2: documents copied with identical paths.
- f546276: the note that the repo must stay.
- c206c93: this repo became the only publisher.
- 0380f8b: products with a domain publish their own.
- `.context/wiki/concepts/legal-publisher.md`.
