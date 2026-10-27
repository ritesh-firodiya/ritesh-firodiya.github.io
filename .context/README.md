# .context — ritesh-firodiya.github.io

Non-code material for the portfolio site. Layout follows the zeno
`context-layout` standard (`zeno standards` shows where it lives).

Legal: every app's legal documents are shipped from `public/legal/`.

## Viewing the design set

    node scripts/designs/serve.mjs

Then open
http://localhost:8845/personal/ritesh-firodiya.github.io/.context/designs/web/index.html

The server root is `~/git`, not this repo, because **no picture is copied
here**. Every screenshot is the product's own store art from its
`.context/listing/`, every icon is from its `.context/designs/brand/`, and
Chitragupt's web picture is its own design screen embedded live. The server
allow-lists those folders and listens on localhost only.

`?bare` on any screen removes the bar and fills the window, so a 390px window
shows the phone layout.
