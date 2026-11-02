---
last-verified: 2026-11-02
---

# how-it-ships

**"How it ships" is derived, never typed.** `scripts/stages.mjs`, tested in `tests/stages.test.mjs`, builds the canvas during `pnpm sync`.

- The stages are `pipelines.default` in the product's `.context/context.yaml`. The forks are fixed rules: idea to research, experiment or dropped; plan to feature or bug; design can be skipped; release to each surface; live to marketing (then video, if the repo has videos) and result.
- The counts are the `status:` of each record in `problems/`, `ideas/`, `experiments/`, `plans/`, `features/` and `bugs/`. A tile opens to the count by status, never the titles: bug and problem titles can say more than a public page should (owner approved, 2026-11-02).
- Surfaces come from `ops/release.yml`. **Live opens only when a surface is live there**, because `canon pipeline` counts Live as started when a support folder exists.
- A dashed stage has nothing on disk yet. The Result stage stays dashed until a rule for it is written.
- The canon page draws `DEFAULT_PIPELINE` with no counts.
- A product not in `SETS` (`scripts/designs/sources.mjs`) has no canvas. Adding one needs `DESIGNS_TOKEN` to reach its repo, or the deploy stops.

Related: [[project]], [[data-model]]
