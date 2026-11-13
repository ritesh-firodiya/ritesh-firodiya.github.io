---
paths:
  - ".context/designs/**"
---

# Design sets

How `.context/designs/` is built. Nothing checks these rules now, so read the
diff against them before calling design work done.

## Layout

```
.context/designs/
  design.js     the product: start page, logo, sizes, frames, themes, stack
  tokens.js     every colour, type style, space, radius and shadow (W3C tokens)
  shell.js      the one link to the viewer shell; never edited
  assets/       source art
  web/
    index.html            the journey
    styles/<group>.html   icons, colors, typography, spacing, radius, shadows
    components/<id>.html  definition in <head>, board in <body>
    <group>/<page>.html   one page, every state in it
    styles.css            only the classes components are built from
```

- `designs/` holds designs only. Notes and decisions go in `.context/wiki/`.
- `design.js` and `tokens.js` are the only hand-written data files: strict JSON
  behind `(window.BABUL ||= {}).<key> = `. Everything else is read from the HTML.
  Never keep a hand-written list of pages, links or components.

## Pages

- One file per page. A state is a `data-state` block, not a file.
- A theme is the toggle, not a state.
- No prose inside a page; markup comments are fine.
- `<body>` carries `data-page`, `data-route` (the app file that renders it) and
  `data-status` (`review`, `built`, `approved`).
- A note the drawing cannot show is a `<meta name="description">`, per page or
  per state.
- A link is a step forward unless marked: `data-link="side"` (shortcut),
  `data-link="back"` (Home, Back), `<link data-link="auto">` (not a tap).

## Components

- Defined once in the `<head>` of `components/<id>.html`, used by name
  (`<c-card>`). Anything a page repeats is a component.
- The id is the app component's name in kebab case.

## Styling

- Tailwind and `styles.css` only, no build step. `style="…"` only for what a
  class cannot express.
- Screens paint with token roles, never with a raw palette value.
- Icons are lucide, by the name the app imports.
- Every CDN is pinned to an exact version.

## The site is the fact

The site is shipped, so a drawing that disagrees with `src/` is wrong. Read the
source for copy, icons and colours (`src/app/globals.css`); never invent a page
or a string. `pnpm contrast` checks both palettes in `globals.css` and
`tokens.js`.
