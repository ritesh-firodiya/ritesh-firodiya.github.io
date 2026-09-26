# ritesh-firodiya.github.io

One site: the portfolio, every app and how it is paid for, the screens each was
built from, and legal.

**https://ritesh-firodiya.github.io/**

Next.js 16 + React 19 + Tailwind v4, statically exported to GitHub Pages.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # data invariants + assertions on the exported HTML
pnpm check    # contrast + lint + typecheck + test:data + build + test:export
```

The product design sets are **not in this repo** and are not published here.
They live in their own repos, which is where they are reviewed.

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
from, following `~/git/personal/STYLE-GUIDE.md`. It is the spec — when a page
and its wireframe disagree, the wireframe wins.
