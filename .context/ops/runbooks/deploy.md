# Runbook — deploy

Push to `main` → `.github/workflows/deploy.yml`: lint, typecheck, contrast, data
tests, sync tests, **`pnpm sync`**, build, export tests, then publish `out/`. A
pull request runs the same checks and publishes nothing.

- When any secret in `.context/ops/setup.md` is missing or dead, the sync step
  fails and the deploy stops, which is the intended failure: a site with its
  screens, wikis and pictures missing must not publish.
- `actions/checkout` runs with `persist-credentials: false`, or git sends the
  job's own token instead of these.
