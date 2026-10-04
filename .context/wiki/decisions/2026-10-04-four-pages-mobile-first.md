---
id: DECISION.2026-10-04.FOUR-PAGES-MOBILE-FIRST
type: decision
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Decision
The site is Home, a project page, the wiki and the résumé. Every layout is
written for the phone first. The design set was redrawn to match.

## Why
The owner's review of the built site (round 4): over-explanatory, too much
white space, the same facts repeated, too many pages. "A portfolio is to
showcase my work, thinking and process, not to over-explain things."

## What changed
- **Work, Process, About and Contact are not pages.** Work and Process are
  sections of Home. The person is on the résumé. Their addresses forward.
  This reverses two lines of [[2026-10-04-hiring-first-redesign]]: Work is no
  longer its own index, and How I build is no longer a top-level page.
- **No sentence that explains the page.** No intro paragraphs, no closing
  call-to-action bands, no stats row, no facts row.
- **Mobile and Web tags** on every card and project page, derived from the
  surfaces a product draws and the platforms it has built. A product with both
  shows a phone beside its web screen.
- **The process is one board**: eight stages across, what each leaves behind,
  one row of dots per project.
- **Mobile first.** Unprefixed classes are the phone layout; `sm:`, `md:` and
  `lg:` add to it. No `max-width` query anywhere. The board is a list on a
  phone and a table from `md`; the wiki shows the article before its rail.

## Consequences
- Screens `about/about.html`, `contact/contact.html`, `process/process.html`
  and `work/work.html` are deleted with their notes pages.
  `about/resume.html` moved to `resume/resume.html`.
- `shared.css` in the design set carries the same component block as
  `src/app/globals.css`.

## Sources
- .context/designs/web/routes.js
- src/app/page.tsx
