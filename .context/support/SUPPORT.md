# Support — the portfolio

`/support/` is the support URL in every app's store listing. It offers a Gmail
compose link and a mail-app link (`src/lib/mail.ts`), because a `mailto:` link
alone does nothing on a machine with no mail program. It links to `/legal/` for
the privacy policies.

Per-app replies, FAQs and review responses live in each app's own
`.context/support/`, not here.
