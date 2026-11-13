---
last-verified: 2026-11-10
---

# glossary

| Word | Meaning here |
|---|---|
| Product | One hobby project with a card on the home page and a row in `src/data/products.json`. |
| Slug | A product's URL-safe id; it is the route `/products/<slug>/`. |
| Platform | One place a product can be had: `web`, `android` or `ios`, each with a state. |
| Live | Anyone can open or install the production product today, on a store or its own domain. A staging site is not live. |
| Closed / beta | A platform open to testers only. It shows a "Join the test" button, not a store link. |
| Stage canvas | The "How it ships" diagram on a project page, derived from the product's own records ([how-it-ships](how-it-ships.md)). |
| Design set | A product's HTML screens under its `.context/designs/`. The site publishes them from the product repo. |
| Sync | `pnpm sync`: reads design sets, wikis and store art out of the product repos. |
| Forwarding address | An old URL that sends the visitor to its new page; it is noindex and has no canonical. |
| Withheld | A design size that failed the conformance gate; the project page lists the failed checks. |
| canon | The open-source Claude Code plugin and CLI (`ritesh-firodiya/canon-cli`) whose rules this repo followed until 2026-11-14, when it was retired. The site still shows it as a project. |
