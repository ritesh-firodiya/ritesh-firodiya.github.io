# Run, test, release

Needs Node 22 and pnpm. Product repos sit beside this one in `~/git/ritvi-apps/`.

```bash
pnpm install
pnpm sync       # once first: design sets, wikis, store art
pnpm dev        # dev server
pnpm check      # sync, contrast, lint, typecheck, data/sync/export tests, build
```

Cheapest proofs: `pnpm test:data` (no build), `pnpm typecheck`, `pnpm lint`. `pnpm test:export` needs a build.

**Release.** Push to `main`. GitHub Actions runs the same checks and publishes `out/` to GitHub Pages ([deploy runbook](runbooks/deploy.md)). The sync step needs the secrets in [setup](setup.md); without them the deploy stops on purpose.

**Never.** Move a path under `public/legal/`, delete `public/app-ads.txt`, or commit anything read out of a product repo.
