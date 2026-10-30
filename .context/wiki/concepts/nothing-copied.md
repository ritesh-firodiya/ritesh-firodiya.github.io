---
last-verified: 2026-10-30
---

# nothing-copied

A design set, a wiki page, a screenshot and an icon each have **one home: the product's own repo**, under its `.context/`. This site reads them at build time and commits none of them.

| What | Read from the product repo | Written here (gitignored) |
|---|---|---|
| Design sets | `.context/designs/` | `public/designs/`, `public/products/<slug>/designs/` |
| Wiki | `.context/wiki/` | `src/data/generated/wiki/<slug>.json` |
| Store art | `.context/listing/…/screenshots` | `public/media/<slug>/*.webp` |
| Icon | `.context/designs/assets/icon.*` | `public/media/<slug>/icon.*` |
| Stage counts | which `.context/` folders have files | `src/data/generated/context.json` |
| canon config | `.claude/canon.yaml` (version, modules) | `src/data/generated/canon.json` |
| Release state | `.context/features/*.md` (`status:`) and `.context/ops/release.yml` | `src/data/generated/funnel.json` |
| Conversation flow | `.context/metrics/flow.json` (written by `canon flow`) | `src/data/generated/flow.json` |

- `scripts/sync-designs.mjs` copies each Babul design set whole (`design.js`, `tokens.js`, `assets/`, `shell.js`, the size folders) and publishes canon's shell once at `/designs/_shell/` (canon-cli's working copy locally, a clone in CI), with the CDNs its `boot.js` names vendored. It **withholds any size that fails the gate** in `scripts/designs/conformance.mjs`: the files are there, `shell.js` is canon's loader, Tailwind and lucide are pinned, and canon's `scan.mjs` passes on the set. The reasons land in `designs.json` and the project page prints them. The screens list is that scan's pages and states.
- `scripts/sync-context.mjs` does the wiki, the pictures and the canon config. Run it second: a wiki page about a screen links to that screen, and only the design manifest knows which screens were published.
- `scripts/designs/sources.mjs` decides where a repo comes from: a sparse, blobless clone with `DESIGNS_TOKEN` in CI, `~/git/products/<repo>` locally.
- `scripts/designs/secrets.mjs` scans every design screen and every wiki page for credential shapes and **stops the build on a hit**. These bytes come out of private repos onto a public host and nothing else looks at them.
- `src/lib/generated.ts` reads the generated JSON off disk with a fallback, so a clean clone type-checks before the sync has run.

**Every wiki page is published**: all types, including entities and synthesis (owner's decision, 2026-10-04). The secret scan is the only filter.

A picture is the product's store art. A product with none can name one of its own design screens in `products.json` (`"embed": "web/tax/tax.html"`), and the page embeds it live, which is why Chitragupt follows the theme toggle.

Related: [[site]], [[data-model]]. Secrets: `.context/ops/setup.md`
