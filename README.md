# ritesh-firodiya.github.io

One site: the portfolio, every app and how it is paid for, the screens each was
built from, and legal.

**https://ritesh-firodiya.github.io/**

Next.js 16 + React 19 + Tailwind v4, statically exported to GitHub Pages.

```bash
pnpm install
pnpm designs  # pull the product design sets out of the app repos
pnpm dev      # http://localhost:3000
pnpm check    # designs + lint + typecheck + build
```

The product design screens are **not in this repo**. They live in the private
app repos under `.context/designs/` and are pulled at build time — so a public
repo never stores private work, and a design set cannot go stale because
someone forgot to re-run a script. It had: the committed copy was short 42
screens and still published one that had been deleted upstream. See
`CLAUDE.md` § Designs.

## Why it looks like this

The previous version claimed "no ads in our games" and "one-time purchases, not
subscriptions" on a page linked from live store listings. Neither was true — one
game ships an ad banner and four of eight apps are subscriptions.

The fix was not better wording. A promise made on behalf of every product is only
as true as the least convenient product, and it decays silently. So every fact
now lives in `src/data/products.json` and is stated per app, and
[`/products`](https://ritesh-firodiya.github.io/products/) is a table rather than
a pitch.

`.context/designs/` holds the HTML + Tailwind design set **this site** was built
from. It is the spec — when a page and its wireframe disagree, the wireframe
wins. The products' own design sets are pulled from their repos, not stored here.
