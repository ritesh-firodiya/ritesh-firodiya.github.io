# explore — pick a direction

Scratch. Three competing directions for the portfolio, home page only, nothing
wired to a framework.

```
index.html      start here — the critique, what is held constant, all three side by side
a-index.html    A · Index    white / Inter Tight / vermilion — the page is a list
b-system.html   B · System   near-black / JetBrains Mono / amber — the premise as interface
c-poster.html   C · Poster   cream / Space Grotesk / teal + coral — colour-blocked, asymmetric
```

Serve it, do not open it from `file://` — the previews are iframes:

```sh
cd ~/git/personal/ritesh-firodiya.github.io && python3 -m http.server 8844
# → http://localhost:8844/.context/explore/index.html
```

## Why this folder exists instead of a surface under designs/

§1 of STYLE-GUIDE.md allows only `brand/` and `<surface>/` under
`.context/designs/`. Three competing token sets cannot live there without one
of them pretending to be the set. `.context/designs/web/` stays exactly as it
is — it is the spec the live site currently implements — until a direction is
chosen, and then it is rebuilt in that direction and this folder is deleted.

Each direction inlines its own Tailwind config for the same reason: they are
competing palettes, and forcing three of them through one `shared.css` would
make them agree before anything has been decided. CDN versions are pinned to
§3 even here.

## Checked

No horizontal overflow at 360, 390, 768 or 1440 in any of the three. B's status
bar wraps to two rows on a phone rather than clipping — the strip is the point
of that direction, so hiding it narrow would remove the reason the bar exists.

## Not yet drawn

Home only. Every other screen follows once a direction is picked.
