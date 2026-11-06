# Wiki index

One line per page. Rules: `canon standards` → `wiki-schema`.

## Concepts
- [architecture](concepts/architecture.md) — One question per diagram: who uses it, how the site is built, what it relies on.
- [claims-and-facts](concepts/claims-and-facts.md) — The six rules that exist because they were broken once.
- [data-model](concepts/data-model.md) — `products.json`: its order and what each field does.
- [how-it-ships](concepts/how-it-ships.md) — The stage canvas is derived from `context.yaml`, the records and `release.yml`.
- [legal-publisher](concepts/legal-publisher.md) — This repo alone publishes legal documents; the paths never change.
- [marketing](concepts/marketing.md) — Marketing and measuring
- [nothing-copied](concepts/nothing-copied.md) — Product material is read at build time and never committed here.
- [routes](concepts/routes.md) — Every route, and the addresses that only forward.
- [selling-in-app](concepts/selling-in-app.md) — Selling inside an app
- [site-tests](concepts/site-tests.md) — What the data and export tests assert.
- [store-capture](concepts/store-capture.md) — Adding store capture to an app
- [store-listing-and-review](concepts/store-listing-and-review.md) — Store listings, review and testers
- [style-rules](concepts/style-rules.md) — Mobile first, keep it short, the wireframe wins, the theme.

## Decisions
- [site](decisions/site.md) — The portfolio site

## Surfaces
- [go](surfaces/go.md) — A page, not a bare redirect.
- [home](surfaces/home.md) — Cards follow `products.json`, with canon placed third.
- [legal](surfaces/legal.md) — Footer only, never the header.
- [not-found](surfaces/not-found.md) — Old addresses forward; the nav is the recovery.
- [policy](surfaces/policy.md) — Static files in `public/legal/`, byte-identical paths.
- [project](surfaces/project.md) — One template for every product.
- [resume](surfaces/resume.md) — A page first and a PDF second.
- [support](surfaces/support.md) — Footer only, beside Legal.
- [wiki-page](surfaces/wiki-page.md) — The article is the Markdown, unedited.
- [wiki](surfaces/wiki.md) — A filter, not a search.
