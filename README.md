# ritesh-firodiya.github.io

Ritesh Firodiya's portfolio. One job: get him hired.

**https://ritesh-firodiya.github.io/**

Next.js 16 + React 19 + Tailwind v4, statically exported to GitHub Pages.

```bash
pnpm install
pnpm sync     # pull design sets, wikis and store art out of the product repos
pnpm dev      # http://localhost:3000
pnpm check    # sync, contrast, lint, typecheck, tests, build
```

## What is on it

- **Work** — every project, with its release state, its screens and its wiki.
- **How I build** — the eight stages every product goes through, and where each
  project is on them.
- **A project page** for each — what it is, where to get it, how it was built.
- **Each project's wiki**, in full, and a link to its design set.
- **Résumé, About, Contact.**
- **Support and Legal** for people who use the apps.

## Nothing about a product is stored here

The design sets, the wikis, the screenshots and the icons live in each
product's own repository. `pnpm sync` reads them at build time into gitignored
folders. Re-shoot a store listing or add a wiki page there, and the next build
shows it here.

`.context/designs/web/` holds this site's own design set. It is the spec: when
a page and its wireframe disagree, the wireframe wins.

See `CLAUDE.md` for the rules, the data model and the deploy.
