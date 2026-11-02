---
id: BUG-0001
status: fixed
severity: medium
priority: p2
last-verified: 2026-11-02
source: backfill
---
# Checkout credential overrode the design token

## Summary
`actions/checkout` leaves the job's own token in the git config, and git sends that instead of the token in a clone URL. Do not remove `persist-credentials: false` from `deploy.yml`.

## Expected
The sync clones each product repo with `DESIGNS_TOKEN`.

## Actual
Every sync failed with "Repository not found" while the token was valid, which looks like a dead token. Fixed in the workflow, and in `scripts/designs/sources.mjs`, so the sync does not depend on how the repo was checked out.

## Evidence
- 783c64d: cause and fix.
- `.github/workflows/deploy.yml`, `.context/ops/runbooks/deploy.md`.
