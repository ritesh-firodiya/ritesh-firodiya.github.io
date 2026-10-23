---
id: SURFACE.WEB.ZENO
type: surface
status: draft
last-verified: 2026-10-23
supersedes: []
superseded-by: null
---

## Summary
zeno's own page: what it is, how to install it, the problem, how it works, what it caught, the decisions behind it, and the principles.

## Route
`/products/zeno/`

## Raw wireframe
- .context/designs/web/work/zeno.html

## Why it is drawn this way
**zeno is a tool, not an app**, so its page has no store buttons and no screenshots. The picture is a real verdict from the weigh gate, shortened. A terminal transcript shows a tool better than a screenshot does.

**The install is three commands** in a terminal block, under the GitHub button. A reader who wants to try it should not have to open the README.

**"What it caught" is real output.** The Scrvio Prisma breach is from `zeno check --all -q` on 2026-10-23. The Firebase verdict is from an eval run. Nothing on this page is a mock.

**A sticky in-page nav** (The problem · How it works · What it caught · Decisions · Principles). The page is long, and a hiring reader jumps to the part they care about.

**Counts are derived**: repos on zeno is the number of `.claude/zeno.yaml` files; principles is the constitution; eval cases is `evals/`.

## Related
- [[home]]
- [[project]]
- [[2026-10-23-zeno-and-ux-redesign]]

## Sources
- .context/designs/web/work/zeno.html
- https://github.com/ritesh-firodiya/zeno-ai
