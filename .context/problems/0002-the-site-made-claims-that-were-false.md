---
id: PROB-0002
status: solved
source: backfill
priority: p2
last-verified: 2026-11-02
---
# The site made claims that were false

## Summary
A page linked from live store listings made promises about every app, and two were false. Other pages disagreed with the app code on what an app cost and whether it could be installed.

## Impact
Users and store reviewers read these pages. The claim breaks silently, because what breaks it lives in another repo. This false claim is the stated reason for the 2026 rebuild, not a wish for a new stack.

## Expected
No claim is made for all apps, and facts have one home. The rules are in [claims-and-facts](../wiki/concepts/claims-and-facts.md); `tests/data.test.mjs` asserts them.

## Evidence
- 2047912: the claims and the rebuild.
- 8bce26d, 508e1ad: prices taken off the site, the disclosure kept.
- 5b33b1e: the rules became tests.
- `.context/wiki/concepts/claims-and-facts.md`, `tests/data.test.mjs`.
