---
id: SURFACE.WEB.HOME
type: surface
status: canonical
last-verified: 2026-09-23
supersedes: []
superseded-by: null
---

## Summary
The landing page, and the only screen all four readers see.

## Raw wireframe
- .context/designs/web/home/home.html

## Why it is drawn this way
**The page is a list.** Work and products are one index, because a reader cares
what a thing is and not which bucket someone filed it under. No cards, no
boxes, no shadows — a hairline, a number, a name, and the row inverting on
hover. Everything else on this site is built from that one component.

**The hot red appears exactly once.** The counts band is the only place
`--accent-500` is spent, and it carries display type only: at 3.6:1 on white it
fails AA outright and can never hold a sentence. Splitting the red in two —
`brand` readable, `accent` for fields — is what lets the bright one exist.

**No portrait, no badge, no stat row in the hero.** Those answer questions
nobody has asked yet. The statement is nine lines tall so the index is the next
thing on screen.

**The preview follows the pointer.** It is the only image on the page, so it
appears where the eye already is. A row with no screenshot shows nothing rather
than an empty frame chasing the cursor.

## The voice, which is the same on every screen
Specific over general — a number where there is one. Headings make a claim or
state a fact, never name a category. Labels are nouns; buttons say what happens
next. The thing first, then the caveat. No unlock, no empower, no seamless.
Every gap is stated with its reason rather than left to be noticed.

## Related
- [[home]]
- [[products]]

## Sources
- .context/designs/web/home/home.html
- ~/git/personal/STYLE-GUIDE.md
