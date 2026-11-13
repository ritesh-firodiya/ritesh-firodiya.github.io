---
last-verified: 2026-11-10
---

# style-rules

**Mobile first.** Every base style and every unprefixed utility is the phone layout; `sm:`, `md:` and `lg:` only add to it. There is no `max-width` media query and no `max-*:` utility in this repo. Where a wide layout cannot shrink (a wide table), the phone gets its own markup and the table appears from `md` up, never a table that scrolls sideways.

**Keep it short.** The site was cut down on 2026-10-04 because it explained too much: no intro paragraphs, no closing call-to-action bands, no fact that appears twice on a page.

**The design set.** `.context/designs/` is a Babul design set: `.claude/rules/design-sets.md` says how it is built. No tool checks it, so read the diff against that file. The shell reads pages, links, journeys and components from the HTML itself; there is no data file to update. It opens from disk. It holds only designs; a screen's notes, design decisions and colour rules are in `.context/wiki/`.

**When a page and its wireframe disagree, the wireframe wins**: fix the page, or change the wireframe first and say so in its notes page (`.context/wiki/surfaces/`).

**The theme.** `src/app/globals.css` holds it in a Tailwind v4 `@theme` block, in step with the set's `tokens.js`: same role names, same values.

- Role names, never hues. A theme is a **token remap**, never a `dark:` prefix.
- The component classes (`.btn`, `.card`, `.state`, `.chip`, `.embed`) are the set's (`.context/designs/web/styles.css`), mirrored in `@layer components` so a utility beside one wins.
- **Reserved colours: the release state** (`live`, `test`, `build`, `draft`). Used for nothing else.
- **The stage canvas has its own four roles** (owner, 2026-11-02): `stage-problem` red, `stage-think` yellow, `stage-make` blue, `stage-ship` green. They colour stages only.
- Icons are lucide.

Related: [site](../decisions/site.md), [routes](routes.md)
