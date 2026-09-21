# The design system

One skeleton, one palette per product, and a lint that makes drift a build
failure. Published at [/design](https://ritesh-firodiya.github.io/design/).

## Why it exists

There were eleven independent token systems in `~/git`, all built to the same
convention and sharing zero code. The convention was already written down in
`~/git/apps/CLAUDE.md` — role-named colours, a `var(--token)`-only Tailwind
config, `shared.css` holding the values, one HTML file per screen — and nothing
enforced it, so four of the nine app sets drifted and two never had a token
layer at all.

Copying a stylesheet into ten repos and hoping is what produced:

- `text-2xs` used **186 times** across aakalan, askcal and charades, and
  declared in exactly one app — imposter. Everywhere else it painted nothing.
- `text-tertiary` used **240 times** in plan-kid with no `tertiary` colour key
  anywhere. `--text-tertiary` existed as a CSS variable, which is not the same
  thing and does not make the class real.
- `tracking-label` used 9 times in askcal, declared nowhere.
- Three amber tokens referenced and never defined, so the shadow on 26 primary
  buttons silently resolved to nothing for months with no error anywhere.

None of those fail. They just quietly do not paint.

## How it is put together

```
core.json            layer 1 — everything that is NOT a colour. Hand-edited.
palettes/<name>.json layer 2 — the colours for one product. Hand-edited.
templates/           the structural CSS and runtime utilities, verbatim.
lib/                 the emitters and the lint checks.
dist/                GENERATED. Never edit.
VERSION              stamped into every emitted file.
```

Two commands:

```bash
node scripts/build-tokens.mjs          # emit into design-system/dist/
node scripts/build-tokens.mjs --check  # regenerate and diff; non-zero on drift
node scripts/lint-designs.mjs          # audit every set; writes design-audit.json
```

### Generate, don't copy

One source per product, four emitted files:

```
palettes/<name>.json
  ├─→ <app>/.context/designs/mobile/core.css          layer 1, identical everywhere
  ├─→ <app>/.context/designs/mobile/tokens.css        layer 2, this product's colours
  ├─→ <app>/.context/designs/mobile/tailwind.config.js layer 3, canon region byte-identical
  ├─→ <app>/src/global.css                            uniwind @theme + @variant scopes
  └─→ <app>/src/theme/tokens.ts                       the JS mirror
```

`shared.css` stays the file every screen links to and becomes a two-line shim
importing `core.css` and `tokens.css`. That matters: 452 screens carry
`<link rel="stylesheet" href="../shared.css">`, and adopting tokens should not
be a markup change.

A token cannot exist on one side and not the other, because both sides come out
of the same object. That is the whole point.

### The mechanical rule

> The CSS variable name is the Tailwind token path with dots as dashes.
> `line.strong` ↔ `--line-strong`. `ink.2` ↔ `--ink-2`. `brand.500` ↔ `--brand-500`.

This is the entire naming policy. It ends every naming argument, and — the
actual reason it is a policy — a script can check it. Before it, five sets broke
it in both directions at once: Tailwind key `line` with CSS var `--border`,
Tailwind key `ink` with CSS var `--text-primary`. Neither name could be trusted
to find the other.

askcal was the only set already consistent with it, so askcal's naming won and
the other five are renamed to match.

### Shared skeleton, per-product palette

Everything metric is shared and everything hued is not. A game and a legal app
should not look the same; they should look like they were built by the same
people. So the type scale, the radii, the shadow geometry, the spacing, the
component anatomy and the token **names** are fixed, and each product supplies
about thirty-five colours.

Two surfaces, because a 390px phone frame and a 1120px web page genuinely do
not want the same type scale — the phone wants fixed `px` steps, the page wants
fluid `rem` clamps. Forcing one on the other would be a worse system, not a more
unified one.

### Reserved colours

Rule 01, and the thing six of nine sets arrived at independently: one or two
colours are spoken for, and nothing else may use them.

In Imposter green means Civilian and black means Imposter, so no category plate
may be green. In Tic Tac Toe blue is X and rose is O. A player reads across a
noisy board in about two seconds — if green can also mean "Food & Drink" then
the one colour carrying the whole game carries nothing.

Each palette declares its reserved block, and `/design/system` renders it.

Two axes that look like one and are not: aakalan's `pos`/`neg` is money
direction, `success`/`danger` is correctness. An expense can be settled
correctly and still be money you owe. Same discipline on the site, where
`m-*` is the monetization model and `live|beta|build|design` is release state —
no model colour may read as a warning.

## Adopting it in an app

1. Add `palettes/<name>.json`. Copy the key set from an existing one; only
   `brand-500`, the ink ramp, `page`, `surface` and the two line tokens are
   required.
2. `node scripts/build-tokens.mjs --only <name>`.
3. Copy the four emitted files into place (phases 3–7 automate this).
4. `node scripts/lint-designs.mjs` and fix what it names.

Never edit an emitted file. `--check` regenerates and diffs, so a hand edit
fails the build rather than surviving as a twelfth source of truth.

## The rules, settled

| | |
|---|---|
| Component classes | **Banned.** Utilities only. The structural list in `templates/structural-mobile.css` is the whole allowance. |
| Dark mode | A **token scope**, never a `dark:` prefix. Optional per product. |
| `useColorScheme()` | **Banned.** tic-tac-toe's own `Themed.tsx` documents that it disagrees with uniwind on the static web build. Read `useUniwind().theme`. |
| Hue names | **Banned.** `brand`, not `green`. A repalette is then a one-file change and no class ever lies about what it means. |
| Literals in a config | **Banned.** Every value is `var(--token)`. |
| CDN URLs | **Pinned.** All 572 Tailwind loads and 159 lucide loads in the tree were unpinned. |
| The wireframe | Is the spec. One documented exception: charades, where the wireframe moves to the shipped app. It is stated on `/design/drift` rather than done quietly. |

## Publishing the failures

`/design/drift` is generated from `src/data/design-audit.json`, which
`lint-designs.mjs` writes. It was a hand-written table in the wireframe, which
means it was accurate the day it was drawn and decayed from then on.

A design system page that shows only the compliant examples is a portfolio
piece. The useful artifact is the one that says which rules got broken, by whom,
and what it would cost to fix — because that is the part another team
recognises.
