---
name: design-gallery-wrapper-route
status: done
last-verified: 2026-11-02
source: backfill
outcome: discarded
---
# design-gallery-wrapper-route

## Summary
A site route, `/products/[slug]/designs`, that framed each product's own design gallery in an iframe.

## Hypothesis
Not written down at the time.

## Metric
Not written down at the time.

## Result
Live for about 25 minutes on 2026-09-20. The frame added a header and a back link, and took away full width, real scrolling and a useful address. Links went straight to the set's own gallery instead.

## Evidence
- de040e2: the route.
- 858fe9f: removed, and why.
