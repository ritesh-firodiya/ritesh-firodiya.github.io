# ritesh-firodiya.github.io — design set

Built to `~/git/personal/STYLE-GUIDE.md`. Serve it over http and open
`web/index.html`:

```sh
cd .context && python3 -m http.server 8833
# → http://localhost:8833/designs/web/index.html
```

**Serve from `.context/`, not from `web/`** — the notes drawer fetches
`../../documents/wiki/surfaces/<slug>.md`, which resolves above `web/`. And
never `file://`: fetch is blocked there, and a server without
`Cache-Control: no-store` hands you a stale stylesheet and makes every visual
check a lie.

## Direction — INDEX

White ground, near-black ink, one vermilion. **The page is a list**: a
hairline, a number, a name, and the row inverting on hover. No cards, no boxes,
no shadows anywhere in the set.

The set this replaced kept the previous warm-paper and Fraunces identity and
only moved its bands around, which read as the same site rearranged. Type,
palette, layout system and central idea are all different here.

**Two reds, and the split is load-bearing.** `--brand-500` (#C2410C) passes AA
on white and is what links and small text use. `--accent-500` (#FF3B00) is
3.6:1 and fails AA outright — it is for **filled fields and display type only**,
never a sentence. The counts band is the one place it is spent. Keeping the
bright red off small text is the only way to keep the bright red.

## What is here

```
web/            the only surface. 1440x900, light and dark
  index.html        the flow chart
  screenshots.html  every screen at once, live
  routes.js         THE MANIFEST — 14 screens, 94 edges
  _chrome.js        copied byte for byte from charades/mobile
  _gallery.js       copied byte for byte from charades/mobile
  shared.css        CORE (byte for byte) + this set's palette + components
  tailwind.config.js
  <flow>/<screen>.html
```

Reasoning is in `../documents/wiki/surfaces/`, one page per screen, opened by
the ⓘ button in the bar.

## The voice

Specific over general — a number where there is one. Headings make a claim or
state a fact, never name a category the nav already named. Labels are nouns;
buttons say what happens next. The thing first, then the caveat. No unlock, no
empower, no seamless. Every gap is stated with its reason rather than left to
be noticed.

## The checks

All seven pass as of 2026-09-23. §12 lists five; the two extra were the publish
gate's.

| Check | Result |
|---|---|
| declared-screens | 14 screens, all accounted for |
| screen-identity | every screen declares its own `data-file` |
| pinned-cdns | tailwind 3.4.17, lucide 0.544.0 |
| links | every local `href` resolves |
| click-through | all 93 edges are real links |
| flow-complete | every screen-to-screen link is declared |
| acyclic | forward graph is a DAG |

Plus: no horizontal overflow across 14 screens × 390 and 1440, and
`pnpm contrast` asserts every pair in both palettes of both this file and the
app's `globals.css`.

## Two things worth knowing

**73 of the 94 edges are the header and footer.** Every screen but 404 carries
them. §12 says every link is a declared edge or the chart under-reports the
product, so they are declared — `side` for navigation that makes no progress,
`back` for returns to Home. They were **derived by scanning the real hrefs**,
not recalled; a set written from memory under-reports itself by about a quarter.

**`screenshots.html` was changed, and the change belongs in every set.** The
canonical copy hardcodes `195x422` tiles with a `390x844` iframe at
`scale(0.5)` — the phone numbers, baked in — so any non-phone surface renders
clipped. The tile now derives from `--frame-w`/`--frame-h`, which `_chrome.js`
already publishes. **A 390-wide set still computes exactly `195x422` at `0.5`**,
so it is safe to copy back over charades, aakalan, askcal and tic-tac-toe with
no visible change. Until that happens this set's copy differs from canonical.

## Gaps, stated

- **No mobile surface.** The site is responsive; the narrow screens are not
  drawn. The surface toggle renders `mobile` struck through rather than hiding
  it, so the gap looks like a gap.
- **No Support screen.** The live route exists and nothing describes it yet.
- `loading`, `error`, `offline` and `locked` are not drawn, each with its reason
  in `routes.js`.

## The live site does not implement this yet

Nothing in `src/` has changed. That happens only after this set is approved.
