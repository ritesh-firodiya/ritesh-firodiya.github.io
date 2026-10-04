---
id: SURFACE.WEB.GO
type: surface
status: canonical
last-verified: 2026-10-04
supersedes: []
superseded-by: null
---

## Summary
The short link for one app, for a bio, a QR code or a forwarded message. noindex.

## Route
`/go/<slug>/`

## Raw wireframe
- .context/designs/web/go/go.html

## Why it is drawn this way
**It is a page, not a bare redirect.** A wrong platform guess has to be recoverable in one tap, a platform with nothing to install has to say why, and a desktop visitor needs something other than a store they cannot install from.

**No site header.** Someone who scanned a QR code came for one app. The only ways out are the store, the app's page, and the work index.

**A closed platform is listed with its reason**, never hidden. That is the site-wide rule, and it matters most here, where the visitor expected to install something.

## Related
- [[project]]
- [[home]]

## Sources
- .context/designs/web/go/go.html
