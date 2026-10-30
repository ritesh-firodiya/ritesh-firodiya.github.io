---
last-verified: 2026-10-30
---

# site-tests

`tests/data.test.mjs` reads `src/data/`: unique URL-safe slugs; an open platform has a url and a closed one has a reason instead; an iOS link labelled TestFlight is one; every local legal path exists; a product is called live only when something is live; no price or rupee figure in `src/app`; no studio-wide claim; generated folders are gitignored; `verifiedOn` is under 30 days old.

`tests/export.test.mjs` reads `out/`: every indexable page declares its own canonical; the noindex set is exactly the short links and the forwarding addresses; every old address still forwards to a page that exists; every wiki page that was synced was exported; every picture a page shows is a file that shipped; the sitemap matches; `app-ads.txt` survived; nothing over 100KB ships unreferenced.

Related: [[claims-and-facts]], [[routes]]
