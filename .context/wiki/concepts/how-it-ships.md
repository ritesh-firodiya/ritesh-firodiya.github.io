---
last-verified: 2026-10-30
---

# how-it-ships

**"How it ships" is derived, never typed.**

- Its numbers are the product's `.context/metrics/flow.json`, which `canon flow` writes on the owner's machine from Claude transcripts and git (CI cannot read transcripts; counts and times only, never prompt text).
- The stages are the product's own: the `pipeline:` in its `.context/context.yaml`, which `canon pipeline` resolves. Each has a one-line rule in canon-cli's `cli/src/flow/` and in `FLOW_STAGE` (`src/lib/flow.ts`).
- Each step's share and median time, the slowest step and the biggest drop come from `scripts/flow.mjs`, tested in `tests/flow.test.mjs`.
- To refresh, re-run `canon flow <product> --write` and commit the file in the product repo.
- Below it, each surface's state and the feature counts come from `scripts/funnel.mjs` (`release.yml` and `features/` statuses; a `verified: false` block is skipped).
- A product with no flow.json shows no section.

Related: [[project]], [[data-model]]
