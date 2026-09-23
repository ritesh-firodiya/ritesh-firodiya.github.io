# Portfolio v2 — designs

Pure HTML + Tailwind (Play CDN). Nothing is wired to a framework.

Open `index.html` — it carries the critique, the proposed IA, and live previews
of three directions.

```
index.html        start here · critique + IA + the three side by side
a-shelf.html      Direction A — light, Inter, product showroom
b-ledger.html     Direction B — dark, mono, data-first
c-editorial.html  Direction C — warm paper, Fraunces, structure fixed
```

Each direction inlines its own `tailwind.config`. That is deliberate and
temporary: they are competing token sets, and giving three of them one shared
`shared.css` would force them to agree before anything has been decided. The
winner gets extracted into `shared.css` + `tailwind.config.js` in the shape the
existing set uses, and then the usual rule applies — 100% Tailwind in the HTML,
no `style=`, no component classes.

## Status

**Waiting on a decision.** Only the home page is drawn, three times. Once a
direction is chosen the full set follows — every screen and every variant —
and only then does any Next.js code change.

## What all three fix

Six structural problems, listed with evidence in `index.html`:

1. The home page makes the reader pick a lane before showing them anything.
   The first product appears at band four.
2. `/products` is thirteen rows of text with no pictures, and six products have
   real screenshots sitting unused in `public/media/`.
3. `/work/chitragupt` — the one long-form case study — is linked from exactly
   one place, the bottom of one product page. There is no `/work` index.
4. 541 designed screens sit behind a nav item called "Screens", with no preview
   and no grouping.
5. Three nav links for eight destinations.
6. No dark mode, on a site read mostly by engineers — despite every token
   already being a CSS variable.

## What none of them change

The rule this site exists to enforce. The model is still stated above every
install button, no claim is made on behalf of every app, an unavailable
platform still renders disabled with its reason, and a missing asset is still
visibly missing rather than quietly cropped.

## Relationship to the existing set

`.context/designs/{web,mobile}` is the approved set the current site was built
from. It stays until a v2 direction is approved and drawn in full; then v2
supersedes it and the old set is archived, not deleted — it is the record of
what was approved when.
