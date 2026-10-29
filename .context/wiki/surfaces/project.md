---
last-verified: 2026-10-29
---

# project

**One template for every product** (owner, 2026-10-23: "make product pages consistent"). The `testing` and `unreleased` states are the same page with other data.

**The email opens in Gmail**, not through `mailto:`, which does nothing on a machine with no mail app.

**No price anywhere on the page.**

**How it ships counts conversations, not features.** Every Claude conversation about the product, against the product's own stages (`pipeline:` in its `.claude/canon.yaml`); a conversation counts at every stage up to the furthest it reached. Warn marks the slowest step and the biggest drop. Numbers come from `~/git/bin/flow`, which runs locally (CI cannot read transcripts) and writes counts only to the product's `.context/metrics/flow.json`.

**A closed Android test that admits a Google Group** needs both steps (join the group, then install from Play), because Play only lets group members opt in. The group button opens the group's `/about` page: the bare `/g/<group>` address is members-only, so a non-member had no way to join.

**The test steps are written out, not in a hover title.** Phones have no hover, and testers got stuck at the two places a title explained.

**Nothing built: no buttons.** A disabled button says why; the state pill already says how far along it is.
