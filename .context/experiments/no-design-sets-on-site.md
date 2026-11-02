---
name: no-design-sets-on-site
status: done
last-verified: 2026-11-02
source: backfill
outcome: discarded
---
# no-design-sets-on-site

## Summary
Remove the product design sets from the site completely, so the build reads nothing outside this repo and needs no token. Done on 2026-09-23 and reversed on 2026-09-26.

## Hypothesis
The site would be lighter and its deploys would stop failing on the token.

## Metric
Not written down at the time.

## Result
Reverted three days later. The reason for restoring them was not written down at the time. The commit that restores them says the old reasoning still holds, and accepts the token failure on purpose. The gate came back too, so only sets that pass are published. The same trade should not be reopened without new facts.

## Evidence
- aee146d: removal, and why.
- dac1b41: the reversal.
