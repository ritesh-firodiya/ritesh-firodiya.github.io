---
id: SURFACE.WEB.POLICY
type: surface
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Summary
One legal document. The same layout serves every privacy policy, deletion page and the terms.

## Route
`/legal/<app>/<doc>.html`

## Raw wireframe
- .context/designs/web/legal/policy.html

## Why it is drawn this way
**One narrow column and nothing beside it.** A policy is read top to bottom or searched; a sidebar helps neither.

**The summary is boxed at the top.** Most readers want one answer — what does this app collect — and the first paragraph gives it.

**These stay static files in `public/legal/`.** The path is byte-identical to the old URL, so no legal text passes through a re-author. Only the stylesheet changes.

## Related
- [[legal]]
- [[support]]

## Sources
- .context/designs/web/legal/policy.html
