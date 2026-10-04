---
id: SURFACE.WEB.WIKI-PAGE
type: surface
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Summary
One wiki page, rendered from the project's Markdown.

## Route
`/products/<slug>/wiki/<type>/<page>/`

## Raw wireframe
- .context/designs/web/wiki/page.html

## Why it is drawn this way
**The article is the Markdown, unedited.** Headings, bold leads and lists render as written. The site adds nothing to the text.

**The frontmatter becomes the line under the title.** Type, status and the last-verified date are what tell a reader how far to trust the page, so they are shown rather than dropped.

**A surface page shows its screen.** The right rail embeds the wireframe itself, live, and links to it, because a page about a screen is half an answer without the screen.

**`[[links]]` become real links**, and the pages they point to are listed again in the rail, so the wiki can be walked.

**It ends on the résumé.** A reader three pages into a wiki is interested; the next step is offered once, at the bottom.

## Related
- [[wiki]]
- [[process]]
- [[resume]]

## Sources
- .context/designs/web/wiki/page.html
