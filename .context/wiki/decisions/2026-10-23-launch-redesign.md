---
id: DECISION.2026-10-23.LAUNCH-REDESIGN
type: decision
status: draft
last-verified: 2026-10-23
supersedes: [DECISION.2026-10-23.ZENO-AND-UX-REDESIGN]
superseded-by: null
---

## Decision
The whole site gets a new look, LAUNCH, and a shorter story. zeno is told as a
productivity tool for the product lifecycle that keeps domain knowledge local
and enforces it. Owner's review of the first redesign, same day: "looks plain",
"wrong story", "too long / dense", and "what it caught should be about the
domain, not code".

## What changed
- **Look: dark first.** Near-black ground, a violet brand with a cyan accent,
  a glow and a faint grid behind each hero, gradient headlines, glass cards.
  Light is the same design remapped. `routes.js` lists `dark` first, so every
  screen opens dark. New role: `accent-400/500`.
- **Home is three parts**: who (one line, three buttons) → zeno (Know →
  Enforce → Ship, then three things it stopped) → Work (three large cards,
  then twelve small tiles).
- **The process board is gone.** The eight stages now live on the zeno page
  as "Across the whole lifecycle", each with what zeno keeps at that stage.
  `Process` leaves the header.
- **"What it caught" is about the domain**: a monthly price that contradicts a
  pricing decision, a feature that was shelved, deleting the user's only copy
  of their data, and a hosting move that would cost more. The first three are
  zeno's eval verdicts on a sample app and say so; the fourth is from the
  owner's products. No code paths, no terminal output.
- **The zeno page is five short sections**: hero with install, the problem,
  how it works, what it caught, the lifecycle, then one closing card. The
  principles list moved to a link.
- **Project pages and the résumé** take the glow, gradient title and glass cards.

## Not changed
- Reserved release-state colours and what they mean.
- Rules 1–6 in CLAUDE.md. Counts are still derived.

## Sources
- .context/designs/web/home/home.html
- .context/designs/web/work/zeno.html
- zeno-ai/evals (contradicts-adr, shelved-feature, irreversible-data)
