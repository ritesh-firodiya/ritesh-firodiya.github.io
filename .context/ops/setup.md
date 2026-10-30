# Setup

One-time setup: repo **Settings → Pages → Source = GitHub Actions**.

## Build secrets

GitHub repo secrets, all read-only on product repos. Copies are in
`~/git/local/secrets/personal/ritesh-firodiya.github.io/`.

| Secret | Reads | Kind |
|---|---|---|
| `DESIGNS_TOKEN` | the `ritvi-apps` repos in `scripts/designs/sources.mjs` with no `key:` | fine-grained PAT, Contents: read. **Expires 2027-10-05.** Its resource owner must be the org: a token owned by the user account cannot see org repos, which is what the first token got wrong |
| `DEPLOY_KEY_SCRVIO` | `ritvi-apps/scrvio` | deploy key, never expires |
| `DEPLOY_KEY_BABUL` | `ritvi-apps/babul` | deploy key (made 2026-10-23; the private half is in `~/git/local/secrets/personal/ritesh-firodiya.github.io/`) |
| `DEPLOY_KEY_DWARSEVA` | `ritvi-apps/dwarseva` | deploy key |
| `DEPLOY_KEY_CANON` | `ritesh-firodiya/canon` | deploy key: the repo is outside the org, so the token cannot reach it |

- `DESIGNS_TOKEN` is the PAT named "portfolio-context-ritvi-apps", created 2026-10-04. It is scoped to named repos, so a new product read with it means adding its repo to this token. The older "portfolio-designs" token is unused.
- A fine-grained PAT covers one owner, so a product under another owner gets a deploy key and a `key:` entry in `scripts/designs/sources.mjs`.
- The org setting "deploy keys" must stay enabled, or the keyed repos stop reading.

What happens when one fails: `.context/ops/runbooks/deploy.md`.
