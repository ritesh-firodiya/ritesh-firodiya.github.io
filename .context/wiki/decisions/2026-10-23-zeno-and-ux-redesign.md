---
id: DECISION.2026-10-23.ZENO-AND-UX-REDESIGN
type: decision
status: draft
last-verified: 2026-10-23
supersedes: []
superseded-by: null
---

## Decision
The site is redesigned around a clear reading order, and zeno is the lead project. Owner's request on 2026-10-23: "refactor my portfolio to have good UX and also showcase zeno". zeno went public the same day.

## Why
Home showed fifteen equal cards and a 12×8 dot table. Nothing said what to look at first. zeno is the strongest staff-level signal on the site, and it was not on it.

## What changed
- **Home reads in order**: who → zeno → three selected projects → every project as a list → how I build.
- **A small stats row comes back** (projects, live, repos on zeno). This reverses one line of [[2026-10-04-four-pages-mobile-first]]. The numbers are derived, never typed.
- **The zeno strip** is the inverted band, with a real `zeno check` transcript.
- **Selected work is three large cards** in the 2026-10-04 order: AskCal, Aakalan, Charades.
- **All projects is a list with filters** by release state, not fifteen picture cards. Pictures stay on the three that lead and on each project page.
- **The process is eight stage cards**, each with what zeno holds it to. The per-project dot board moves into a collapsed "Where each project is".
- **A new zeno page** (`work/zeno.html`) and a **zeno nav link** in the header.
- **Each project page shows "Checked by zeno"** with its live module count and check result.
- **The résumé opens with zeno and the independent work**, then Experience.
- The header email button hides on a phone; the footer keeps the address.

## Not changed
- The palette, the tokens and the reserved release colours.
- Rules 1–6 in CLAUDE.md: no studio-wide claims, no prices, counts derived.

## Sources
- .context/designs/web/home/home.html
- .context/designs/web/work/zeno.html
