---
last-verified: 2026-10-30
---

# legal-publisher

`public/legal/` holds the privacy policies, deletion pages and terms. They are static files, deliberately not routes: **the paths are hardcoded in shipped app builds and in store listings and must never change**, and no legal text passes through a re-author. `public/legal/legal.css` is their one stylesheet.

**This repo publishes legal documents only for products without their own domain.** A product with one (Chitragupt, Babul, Scrvio, Dwarseva) publishes its own; this site only links to them from the product page. `ritvi-apps/legal` was deleted on 2026-10-12, so the old `ritvi-apps.github.io/legal/...` URLs are 404s. Builds older than Charades 1.0.32, Tic Tac Toe 1.0.11 and Aakalan 1.0.19 hardcode them and have lost their privacy link.

`ritvi-apps.github.io` still redirects here and is being retired; do not delete it until AdMob reads `app-ads.txt` from this host for the iOS Tic Tac Toe app (AdMob → Apps → app-ads.txt shows the host it crawls).

Chitragupt's old deletion path stays as a redirect, because the path must never move.

Related: [legal](../surfaces/legal.md), [policy](../surfaces/policy.md)
