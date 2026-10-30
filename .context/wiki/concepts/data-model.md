---
last-verified: 2026-10-30
---

# data-model

`src/data/products.json` is the single source of truth for every app fact. **Its array order is the running order of the site.** To change the order, re-order the file.

- The release state pill is **derived** from `platforms` (`stageOf` in `src/lib/products.ts`): any `live` → live; any `beta`/`closed` → in testing; otherwise in build, or in design when `notBuilt`. Only the words (`stageLabel`) are typed, and a test checks the two agree.
- `shots` names a product's best store screenshots, best first. The listing's own order is written for a store page, and its tilted close-ups read badly at card size.
- A `closed` platform renders as a **"Join the test"** button: a pre-filled email asking to be added to the tester list. `none` is not shown.
- A closed platform's button opens **Gmail's compose page**, not `mailto:` (`src/lib/mail.ts`). A mailto link does nothing on a machine with no mail app, and the button then looks broken. `testUrl` is the store's own tester page, shown as a second button.
- `embed` also gives a product with no store art a picture: one of its own design screens, live. `embedMobile` names a phone screen to stand beside a web one. Every product is a card on the home page; one with no picture shows a hatched slot.
- **Mobile / Web tags** are derived (`surfaceTags` in `src/lib/products.ts`) from the surfaces a product draws and the platforms it has built. A product with both shows both.
- `src/lib/case-studies.ts` holds the long-form text for a project page. A product without one shows its `features` instead.
- `src/data/profile.json` drives the home page and the résumé.
- `verifiedOn` is the date a human last checked every row. The tests fail once it is 30 days old. Check the **stores** and each product's `.context/ops/release.yml`, not memory.

Related: [[how-it-ships]], [[claims-and-facts]], [[nothing-copied]]
