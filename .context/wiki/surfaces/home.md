---
id: SURFACE.WEB.HOME
type: surface
status: canonical
last-verified: 2026-10-12
supersedes: []
superseded-by: null
---

## Summary
The whole site on one page: who, then every project, then the eight stages each one goes through.

## Route
`/`

## Raw wireframe
- .context/designs/web/home/home.html

## Why it is drawn this way
**One page, three parts.** Who I am is one sentence and three buttons. Work is every project. Process is one board. Work, Process, About and Contact used to be four more pages that repeated what was here; their addresses forward (2026-10-04, review round 4).

**Every project is one card, all the same size** (2026-10-12). Four to a row from tablet up, two on a phone, in the order of `products.json`: the leads, then the phone apps, then the web products, then the rest. The picture fills the card (11:9), and a short see-through, blurred panel lies over its foot: name, state, tags and counts. The tagline is on the project page. The owner chose the see-through panel on 2026-10-12; its known cost is weaker text contrast over a dark picture, which is why the counts use `ink-2` here. A store screenshot with no device around it (Chess) is drawn inside a phone. A project with no picture keeps its card and shows a hatched slot.

**A card says what the project is before it is opened:** the release state, a Mobile or Web tag, and how many screens and wiki pages it left behind. A product with a site and an app carries both tags and shows a phone standing beside its web screen.

**The pictures are each product's own.** Store art from its listing, or one of its design screens embedded live. Nothing is copied into this repo.

**A project with nothing to show is a row**, not a card with an empty picture.

**The board is the process.** The eight stages head the columns, each with what it leaves behind, and every project is a row of dots counted from its own repository. On a phone it is a key and a list, not a table that scrolls sideways.

**Nothing is said twice.** No stats row, no closing band. The email is in the header and the footer, on every page.

## Related
- [[project]]
- [[unreleased]]
- [[resume]]

## Sources
- .context/designs/web/home/home.html
