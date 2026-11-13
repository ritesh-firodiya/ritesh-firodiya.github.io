---
paths:
  - ".context/**/*.md"
---

# The wiki

`.context/wiki/` holds what an agent would get wrong without being told. Every
page is published on the site. Every fact has one home; `index.md` has one line
per page.

| Folder | Holds |
|---|---|
| `concepts/` | a rule, an invariant, a user journey; `purpose` and `glossary` |
| `decisions/` | one file per topic: the current choice |
| `surfaces/` | what a page's design cannot show, only for pages that have some |

- Not for the wiki: code docs (they sit beside the code), tasks, plans, chat
  logs, changelogs.
- A page carries `last-verified: YYYY-MM-DD`. Update it only after reading the
  fact again in its real source.
- Never write a secret, or a row that names a person.
- Write plainly: short sentences, concrete words, the answer first.
