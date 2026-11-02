---
id: PROB-0003
status: solved
source: backfill
priority: p2
last-verified: 2026-11-02
---
# Published design sets fell behind or broke the deploy

## Summary
The site shows each product's design screens, which live in private repos. Each way of doing this failed in turn: committed copies fell behind main, and pulling them at build time made deploys depend on a token and on those repos.

## Impact
- Copies: 2026-09-23 counts showed up to 31 screens missing for one product, and one deleted screen still live.
- Pull: four deploys were lost to the token, and three more failed on 2026-10-04.
- While a deploy stayed red, the live site kept serving an old build.

## Expected
What ships is what is merged, and a set that fails its checks is withheld with a stated reason. A dead token stops the deploy instead of publishing a site with holes. The token dependence was accepted on purpose (dac1b41). See [[nothing-copied]] and `.context/ops/runbooks/deploy.md`. The token's renewal is T027 in `tasks.md`.

## Evidence
- 2fecaa5: copies removed, the counts, and the red deploy.
- aee146d, dac1b41: the sets removed, then restored behind a gate.
- 783c64d, a53c08d: the later failed deploys.
