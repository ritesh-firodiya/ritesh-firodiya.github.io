---
id: SURFACE.WEB.WIKI
type: surface
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Summary
One project's wiki: every page, grouped by type.

## Route
`/products/<slug>/wiki/`

## Raw wireframe
- .context/designs/web/wiki/wiki.html

## Why it is drawn this way
**Grouped by type, because that is how the wiki is written.** Concepts, entities, surfaces, flows, decisions and synthesis each answer a different question, and a reader usually wants one kind.

**The second column says what each page owns.** A list of slugs tells a stranger nothing; the wiki's own index already carries a one-line "owns", so it is shown.

**A filter, not a search.** Chitragupt has 328 pages. The filter narrows by name in the page; there is no server to search with.

**The project picker stays in the rail** so moving between wikis never goes back through Work.

**The whole wiki is published**, read from the project's repo at build time. Nothing is copied into this repo.

**On a phone the pages come first and the rail follows them.** The rail is navigation between wikis; the reader came for this one.

## Related
- [[wiki-page]]
- [[home]]
- [[project]]

## Sources
- .context/designs/web/wiki/wiki.html
