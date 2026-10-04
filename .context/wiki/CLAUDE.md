# Wiki — schema and rules

This folder is a **Claude-maintained knowledge base** for Chitragupt. The model is the LLM-Wiki pattern: `.context/raw/` holds immutable sources, `.context/wiki/` holds synthesised pages with `[[wikilinks]]`, this file defines the schema.

**Read this file before creating or editing any page under `.context/wiki/`.**

---

## Three layers

| Layer | Path | Mutability | Who writes |
|---|---|---|---|
| Raw | `.context/raw/`, `.context/designs/` | **Immutable** — never edit | Humans (or external systems) |
| Wiki | `.context/wiki/` | Mutable, schema-bound | Claude (via `/ingest`, `/ask`, `/wiki-lint`) |
| Index | `.context/wiki/index.md` | Auto-maintained | `/ingest` and `/wiki-lint` |

The wiki is the **only** layer Claude reads for `/ask`. Never answer from `.context/raw/` directly — the synthesis must be written down or it doesn't exist.

---

## Page types

Every page in `.context/wiki/` belongs to exactly one type. The folder name is the type.

| Type | Folder | What it owns | Example |
|---|---|---|---|
| `concept` | `concepts/` | An idea, principle, or invariant. Prose-shaped. | `upload-only`, `read-only-review`, `money-in-paise` |
| `entity` | `entities/` | A thing with canonical values (price, name, enum). Table-shaped. | `tier-self`, `pillar-tax` |
| `surface` | `surfaces/` | One screen / route / email / callable. Links to a raw wireframe. | `onboarding-consent` |
| `flow` | `flows/` | A user journey. Ordered list of `[[surface]]` steps. | `new-user-to-dashboard` |
| `decision` | `decisions/` | One ADR. Filename = `YYYY-MM-DD-slug.md`. Append-only. | `2026-06-24-sla-7-working-days` |
| `synthesis` | `synthesis/` | Cross-cutting page built from many entities/concepts. Refreshable. | `pricing`, `v1-launch-gate` |

A page cannot be two types. If it feels like it is, it's two pages — split it.

---

## Frontmatter (mandatory)

Every page begins with YAML frontmatter:

```yaml
---
id: TIER.SELF                 # Stable, uppercase, dot-separated. Never changes. Referenced from code.
type: entity                  # concept | entity | surface | flow | decision | synthesis
status: canonical             # canonical | draft | superseded
last-verified: 2026-06-24     # ISO date. /wiki-lint flags pages > 90 days.
supersedes: []                # IDs this page replaces (decisions only)
superseded-by: null           # If non-null, this page is no longer canonical
---
```

### ID conventions

| Type | ID shape | Example |
|---|---|---|
| concept | `CONCEPT.<SLUG>` | `CONCEPT.UPLOAD-ONLY` |
| entity | `<DOMAIN>.<NAME>` | `TIER.SELF`, `PILLAR.TAX` |
| surface | `SURFACE.<APP>.<PATH>` | `SURFACE.WEB.ONBOARDING.CONSENT` |
| flow | `FLOW.<SLUG>` | `FLOW.NEW-USER-TO-DASHBOARD` |
| decision | `DECISION.<YYYY-MM-DD>.<SLUG>` | `DECISION.2026-06-24.SLA-7-WORKING-DAYS` |
| synthesis | `SYNTHESIS.<SLUG>` | `SYNTHESIS.PRICING` |

Once assigned, an ID never changes. If a page is renamed, the ID stays. If the thing it describes is killed, mark `status: superseded` and set `superseded-by`; do not delete.

---

## Page body — required sections

Each type has a required section list. `/wiki-lint` fails the page if any are missing.

### `concept`
```markdown
## Summary
One sentence — what the concept is.

## Why it matters
Why this is a load-bearing idea. Tie it to a constraint, an incident, or a principle.

## Implications
Bulleted: what this forces / forbids in practice.

## Related
- [[other-concept]] — relationship
- [[entity-x]] — where this applies

## Sources
- .context/raw/<source> or .context/designs/<surface>/<flow>/<screen>.html
```

### `entity`
```markdown
## Summary
One sentence — what this entity is.

## Canonical values
| Key | Value | Last changed |
|---|---|---|
| PRICE.SELF.AY2026 | ₹249 | 2026-04-12 |
| STORAGE.SELF | 5 GB | 2026-04-12 |

## Related
- [[concept-x]] — concept this entity instantiates
- [[entity-y]] — sibling / upgrade-from

## Sources
- .context/raw/<source>
```

The `Canonical values` table is the single source of truth. Any value here that disagrees with the codebase is a bug — fix the code or update this page.

### `surface`
```markdown
## Summary
One sentence — what this screen does.

## Raw wireframe
- .context/designs/<surface>/<flow>/<screen>.html

## Copy
Verbatim user-visible strings. Each must pass the [[copy-voice]] rules.

## Flows that touch this surface
- [[new-user-to-dashboard]] — step 4

## Entities referenced
- [[tier-free]]
- [[concept-dpdp-consent]]

## Sources
- .context/raw/<source>
```

### `flow`
```markdown
## Summary
One sentence — what journey this is.

## Audience
end-user | CA | admin

## Entry
Where the user arrives from.

## Steps
| # | Step | Surface | Notes |
|---|---|---|---|
| 1 | Landing | [[landing]] | Hero + pricing |
| 2 | Sign up | [[sign-up]] | Email or Google |
| ... |

## Exit
The success state.

## Escapes
Back-button, skips, abandonment outcomes.

## Sources
- .context/raw/<source>
```

### `decision`
```markdown
## Decision
One-line statement.

## Why
The motivation. Cite the trigger — incident, user feedback, regulator, scope cut.

## Impact
What changes downstream. Which [[entities]] / [[surfaces]] / [[concepts]] update.

## Status
Active | Superseded by [[decision-id]]

## Sources
- .context/raw/<source>
```

Decisions are append-only. To reverse a decision, write a new one with `supersedes: [DECISION.<old>]` and mark the old one's `superseded-by`.

### `synthesis`
```markdown
## Summary
What this synthesis combines.

## Built from
- [[entity-x]]
- [[entity-y]]
- [[concept-z]]

## Body
The cross-cutting answer. Every claim links back to a source page.

## Last refresh
2026-06-24 — refresh when any "Built from" page changes.

## Sources
- (synthesis pages cite wiki pages, not raw files)
```

Synthesis pages are **derived**. If a source page changes, `/wiki-lint` marks the synthesis stale.

---

## Linking

- Use `[[page-slug]]` — the filename without `.md`. Match the file exactly (case-sensitive on case-sensitive filesystems).
- Cross-folder links use the slug, not the path: `[[tier-self]]`, not `[[entities/tier-self]]`.
- An `[[unknown-link]]` is a TODO marker — `/wiki-lint` reports it. Never silently delete a broken link; either create the target page or rename the link.
- The `Related` section is what makes the graph navigable. Every page must have at least two outbound links (or be flagged as orphan-source).

---

## Lint rules (what `/wiki-lint` enforces)

| Rule | Failure |
|---|---|
| Missing required section | Block — must be fixed |
| `[[wikilink]]` to a non-existent page | Block — create target or rename link |
| Orphan page (zero inbound links) | Warn |
| Two entities claim the same `id` | Block |
| Two entities have contradictory canonical values for the same key | Block |
| `last-verified` > 90 days | Warn |
| `status: superseded` without `superseded-by` | Block |
| Source file in `.context/raw/` not referenced by any wiki page | Warn |
| Synthesis page where a `Built from` page changed after `Last refresh` | Warn |
| Filename does not match the `id`'s slug portion | Block |

`/wiki-lint --fix` auto-fixes: filename ↔ id mismatches, missing `last-verified` (sets to today if the page is touched), index regeneration.

---

## What the wiki is NOT for

- **Not for code documentation.** Docstrings stay in code. The wiki is product-shaped, not API-shaped.
- **Not for transient task tracking.** Use `TaskCreate` / PR descriptions / commit messages for ephemeral work.
- **Not for chat logs.** If a chat produces a decision, write a `decision` page; throw the chat away.
- **Not for drafts of code.** If it would be a comment, it's a comment.

---

## Source of truth

`.context/wiki/` is the canonical knowledge base, and every page in it follows
the schema above — there are no plan-shaped exceptions. What is *next* lives in
`.context/features/`, and the ordered queue lives in `.context/tasks.md`; the
wiki describes what is, not what is planned. The repo root holds no
product-knowledge `.md` files.
