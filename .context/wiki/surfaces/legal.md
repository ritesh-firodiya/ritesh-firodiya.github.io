---
id: SURFACE.WEB.LEGAL
type: surface
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Summary
Every privacy policy, deletion page and terms document, for every app, in one table.

## Route
`/legal/`

## Raw wireframe
- .context/designs/web/legal/legal.html

## Why it is drawn this way
**A table, because the reader is a store reviewer or a user looking for one document.** Nobody browses this page.

**It is in the footer, not the header.** The header belongs to the hiring reader. App users and reviewers arrive by direct link from a store listing.

**Chitragupt's policy links out.** Its policy is a real page of its own product; only the deletion page lives here, because a reviewer must open it without signing in.

**The URLs under `/legal/` never change.** Shipped builds hardcode them.

## Related
- [[policy]]
- [[support]]

## Sources
- .context/designs/web/legal/legal.html
