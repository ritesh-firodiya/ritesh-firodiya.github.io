---
last-verified: 2026-10-30
---

# claims-and-facts

Rules that exist because they were broken once. An earlier version claimed **"no ads in our games"** and **"one-time purchases, not subscriptions"** on a page linked from live store listings. Both were false. A promise on behalf of every app is only as true as the least convenient app.

1. **No studio-wide claims.** Any statement not true of every app it covers is scoped to the apps it is true of, or cut.
2. **Prices are not published on this site.** The *model* (subscription, one-time, ads), the ads and the analytics are stated, because that is disclosure. `price`, `priceNote` and `tiers` stay in `products.json` as the record and are rendered nowhere. The store listing is where a price belongs.
3. **An unavailable platform renders disabled with its reason**, never hidden and never as a link most people cannot open.
4. **Facts live in `src/data/products.json`, never in a page.**
5. **A count is derived, never typed.** "15 projects", "3 live", "7 modules" come from the data. The canon strip on a project page reads the product's own `.claude/canon.yaml` (synced into `canon.json`); nobody edits this site to change it.
6. **A missing thing is visibly missing.** No screenshot is a hatched slot that says so. A withheld design set is a card that lists the failed checks.

Code and tests cite these by number ("CLAUDE.md rule 1"), so keep the numbers.

Related: [[data-model]], [[site-tests]]
