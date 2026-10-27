---
last-verified: 2026-10-27
---

# Adding store capture to an app

Store screenshots are captured from the running app by goldie, framed in the house style, and synced into fastlane's tree.

## Steps
1. **Find what makes two runs differ**: randomness, the clock, the network, ads, store SDKs, anything read from disk.
2. **`src/config/seams.ts` holds each difference as a plain default; `seams.screenshot.ts` beside it holds the capture value.** Copy the swap from any app's `metro.config.js` (under `EXPO_PUBLIC_SCREENSHOT_MODE=1`, `@/a/b` resolves to `src/a/b.screenshot.ts`) and copy `seams.test.ts`, which asserts the flag is in no `eas.json`, `.env*` or `app.config.ts` and that no app file reads it.
3. **App code never reads the flag.** Capture-only branches ship dead in every binary; App Review rejected imposter 1.0.3 under 5.6 for that.
4. **One seam per difference**, always including a separate storage id. To swap a whole function, `x.screenshot.ts` can `export * from "./x"` and replace one export. Import swapped modules as `@/…`, and keep variants out of `src/app/`. Prefer a deterministic app to seeded state; stop the clock, not just the data.
5. **Copy the shared scripts** and add the three `listing:*` commands.
6. **Write the flows in `.argent/flows/`.** Match on `text:` (an `accessibilityLabel` surfaces as text). After a timer, `await: { visible: … }`, never a fixed wait. Quote text with a comma. `keyboard` types nothing into an unfocused field.
7. **`goldie.config.ts`**: copy charades', change paths, ids, background, store block and scenes; leave the house style alone and mirror it in `goldie.design.json`.
8. **`pnpm listing:capture`, then look at the pictures**; `goldie verify` checks sizes, not content. Turn on `app_previews_path` in the Deliverfile once a preview exists.

## House style
`template: "showcase"`, `layout: "classic"`, `screenOnly: true`, Merriweather, the `17-pro-silver` frame. Only the background is the product's own. `canon check` fails when an app differs from charades.

## Traps
- `listing/` leaf names are fastlane's API; each store folder needs its own `metadata/` level.
- The mapper deletes the files it would regenerate; goldie's raw manifest holds absolute paths.
- A template that tilts the device breaks anything that reads the screen's edge.
- `deliver` names previews by file name, and uploads to whichever version record is editable.
- `precheck` cannot read IAPs with an API key, and runs after the upload.
- A stuck simulator reads exactly like an app bug; verify on the configuration that failed.
