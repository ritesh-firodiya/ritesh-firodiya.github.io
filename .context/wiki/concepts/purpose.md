---
last-verified: 2026-11-10
---

# purpose

**What it is.** The single public site for Ritesh Firodiya at https://ritesh-firodiya.github.io/. It shows his hobby side projects (apps and tools), one page each, with screens, wiki and a "How it ships" stage canvas.

**Who it is for.**
- People who found an app and want to use it, or reviewers from a store: Support and Legal, reached from the footer.
- Colleagues and anyone curious about the work.

**The problem it solves.** One address for every app's store links, legal documents (`public/legal/`, paths never move) and `app-ads.txt`, with facts read from the products' own repos instead of typed twice.

**What it is not.**
- Not a job search: no hire pitch, no open-to-work wording ([site](../decisions/site.md)).
- Not a store: no prices are published.
- Not a copy of the products: their design sets, wikis and pictures are read at build time and never committed ([nothing-copied](nothing-copied.md)).

**Status.** Live on GitHub Pages. Deploys from `main` through GitHub Actions ([deploy runbook](../../ops/runbooks/deploy.md)).

Related: [glossary](glossary.md), [routes](routes.md)
