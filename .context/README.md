# .context — ritesh-firodiya.github.io

Non-code material for the portfolio site. Layout follows
`~/git/products/CLAUDE.md`.

| Folder | State |
|---|---|
| `designs/web/` | the site's own design set. Redrawn and built 2026-10-04 |
| `wiki/` | one notes page per screen, plus decisions |
| `raw/` | empty |
| `features/` | n/a — nothing planned beyond `tasks.md` |
| `listing/` | n/a — a website, not a store app |
| `marketing/` | n/a — the site is the marketing |
| `metrics/` | n/a — no analytics on this site |
| `support/` | n/a — support for the apps is a page of the site |
| `legal/` | n/a — the legal documents are shipped files in `public/legal/` |
| `ops/` | `release.yml` — what is live, and what is built and not yet deployed |

## Viewing the design set

    node scripts/designs/serve.mjs

Then open
http://localhost:8845/personal/ritesh-firodiya.github.io/.context/designs/web/index.html

The server root is `~/git`, not this repo, because **no picture is copied
here**. Every screenshot is the product's own store art from its
`.context/listing/`, every icon is from its `.context/designs/brand/`, and
Chitragupt's web picture is its own design screen embedded live. The server
allow-lists those folders and listens on localhost only.

`?bare` on any screen removes the bar and fills the window, so a 390px window
shows the phone layout.
