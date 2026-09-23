# ritesh-firodiya.github.io — design set

Built to `~/git/personal/STYLE-GUIDE.md`. Serve it over http and open
`web/index.html`:

```sh
cd .context && python3 -m http.server 8866
# → http://localhost:8866/designs/web/index.html
```

**Serve from `.context/`, not from `web/`.** The notes drawer fetches
`../../documents/wiki/surfaces/<slug>.md`, which resolves above `web/`. And
never `file://` — fetch is blocked there and a server without
`Cache-Control: no-store` will hand you a stale stylesheet and make every
visual check a lie.

## What is here

```
web/            the only surface. 1440x900, light and dark
  index.html        the flow chart
  screenshots.html  every screen at once, live
  routes.js         THE MANIFEST — 14 screens, 95 edges
  _chrome.js        copied byte for byte from charades/mobile
  _gallery.js       copied byte for byte from charades/mobile
  shared.css        CORE (byte for byte) + this site's palette + components
  tailwind.config.js
  <flow>/<screen>.html
```

Reasoning lives in `../documents/wiki/surfaces/`, one page per screen, and is
what the ⓘ button in the bar opens.

## The seven checks

All pass as of 2026-09-23. §12 lists five; the two extra are the ones the
publish gate used to run.

| Check | Result |
|---|---|
| declared-screens | 14 screens, all accounted for |
| screen-identity | every screen declares its own `data-file` |
| pinned-cdns | tailwind 3.4.17, lucide 0.544.0 |
| links | every local `href` resolves |
| click-through | all 94 edges are real links |
| flow-complete | every screen-to-screen link is declared |
| acyclic | forward graph is a DAG |

## Two things worth knowing

**73 of the 95 edges are the site header and footer.** Every screen but 404
carries them, so each links to Work, Products, About, Hire, Contact, Legal and
Home. §12 says every link is a declared edge or the chart under-reports the
product — so they are declared, `side` for navigation that makes no progress
and `back` for returns to Home. They were **derived by scanning the real
hrefs**, not recalled; §13 warns a set written from memory under-reports itself
by about a quarter, and a header is the easiest thing in a design to stop
seeing.

**`screenshots.html` was changed, and the change belongs in every set.** The
canonical copy hardcodes `195x422` tiles with a `390x844` iframe at
`scale(0.5)` — the phone numbers, baked in — so any non-phone surface renders
clipped down its right edge. Since `--frame-w` / `--frame-h` are already
published by `_chrome.js` from `routes.js`, the tile now derives from them. **A
390-wide set still computes exactly `195x422` at `0.5`**, so the file is safe
to copy back over charades, aakalan, askcal and tic-tac-toe with no visible
change. Until it is, this set's copy differs from canonical — §13 says a
shared file that needs to behave differently is changed in every set, not
locally in one, and this is the "in every set" half still outstanding.

## Gaps, stated

- **No mobile surface.** The site is responsive; the narrow screens are not
  drawn. The surface toggle renders `mobile` struck through rather than hiding
  it, so the gap looks like a gap.
- **No Support screen.** The live route exists and nothing describes it yet.
- `loading`, `error`, `offline` and `locked` are not drawn, each with its
  reason in `routes.js` — a static export has no request to wait on, nothing
  posts, there is no service worker, and nothing is gated.

## Relationship to the live site

**The live site does not implement this yet.** `.context/designs-v1/` is the
set the deployed pages were built from and stays until this one is approved and
built. When a page and its wireframe disagree, the wireframe wins.
