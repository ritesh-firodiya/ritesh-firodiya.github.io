---
last-verified: 2026-10-30
---

# routes

| Route | What it is |
|---|---|
| `/` | who (one line), then `#work` (a card per project) |
| `/products/canon/` | canon, the private docs site: a product in `products.json` like the rest. Its page adds one section, `#cli`: canon-cli, the free CLI and plugin canon is built on (`src/components/canon-cli.tsx`, content in `src/lib/canon.ts`). canon-cli is never listed on its own |
| `/products/[slug]/` | one project: what it is, where to get it, its screens and wiki, its funnel ("How it ships"), the write-up |
| `/products/[slug]/wiki/`, `…/wiki/[type]/[page]/` | that project's wiki |
| `/products/[slug]/designs/` | forwards to that project's design journey (`/designs/<slug>/<size>/index.html`): a static file, not a route |
| `/resume/` | the person |
| `/support/`, `/legal/` | for app users and store reviewers |
| `/go/[slug]/` | short links for QR codes and bios, `noindex` |
| `/work/`, `/process/`, `/about/`, `/contact/`, `/products/`, `/hire/`, `/design/gallery/`, `/work/chitragupt/`, `/products/trunk/`, `/products/dwarseva-property/`, `/products/dwarseva-societies/` | forwarding addresses (meta refresh), `noindex` |

- Project pages stay at `/products/<slug>/` because store listings point there.
- Dynamic families need `generateStaticParams` or they are not exported.
- A forwarding address uses `src/components/forward.tsx`, not `redirect()`: under a static export `redirect()` only works once the page's JavaScript has run.
- Work, About, Process and Contact were separate pages and are now sections of Home or the résumé. Do not add a page for something a section can hold.

Related: [[site]], [[style-rules]], [[site-tests]]
