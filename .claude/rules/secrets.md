# Secrets

The backup folder is `~/git/local/secrets/`, with its `INVENTORY.md`. It is not
a repo and is never pushed.

- **Back a secret up in the same run** it is created, rotated or first needed:
  copy it into the folder and add its line to `INVENTORY.md`. Here that means
  `DESIGNS_TOKEN` and the `DEPLOY_KEY_*` deploy keys (`.context/ops/setup.md`).
- **`INVENTORY.md` holds key names only.** Never write a secret value in
  Markdown, a commit message or a chat reply.
- **Never commit a real secret.** Every wiki page is published, and
  `scripts/designs/secrets.mjs` is the scan; it must not start failing because
  of a new secret.
- **The folder is a snapshot.** Copy again after every rotation.
