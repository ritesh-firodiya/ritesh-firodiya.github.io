---
last-verified: 2026-10-30
---

# legal-publisher

`public/legal/` holds the privacy policies, deletion pages and terms. They are static files, deliberately not routes: **the paths are hardcoded in shipped app builds and in store listings and must never change**, and no legal text passes through a re-author. `public/legal/legal.css` is their one stylesheet.

**This repo is the only publisher of legal documents.** `ritvi-apps/legal` was deleted on 2026-10-12, so the old `ritvi-apps.github.io/legal/...` URLs are 404s. Builds older than Charades 1.0.32, Tic Tac Toe 1.0.11 and Aakalan 1.0.19 hardcode them and have lost their privacy link.

`ritvi-apps.github.io` still redirects here and is being retired; do not delete it until AdMob reads `app-ads.txt` from this host for the iOS Tic Tac Toe app (AdMob → Apps → app-ads.txt shows the host it crawls).

Chitragupt's Play Data safety links already name this host and go out with its first submission.

Related: [[legal]], [[policy]]
