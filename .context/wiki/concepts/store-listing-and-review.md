---
last-verified: 2026-10-27
---

# Store listings, review and testers

## Listing text
1. **One authored file, generated outputs.** `listing/listing.md` → `scripts/listing-from-md.mjs`, which checks every cap. Leaf names are fastlane's.
2. **Pull before you push**; the live listing and the repo drift both ways.
3. **Read which version deliver writes to**; it uploads to whichever is editable, rejected records included. A version waiting for review is locked.
4. **Every word is true of the shipped app.** Keep a "Do not claim" list.
5. **The title is what people type**; Apple indexes name, subtitle and keywords, not the description. Open the description with what the app does.
6. **The Android package name is frozen at first publish** and must not leak into copy.

## Screenshots and video
7. **Capture from the running app**: `pnpm listing:capture`. Names are `NN-<screen>.png`; Play uploads in name order.
8. **The mapper deletes what it would regenerate**, hand-made `NN-…` shots included.
9. **No fake rating in the art** (`rating: null` until there are ratings).
10. **Tablets**: Play leaves an app out of tablet search without tablet shots; goldie has no tablet device, so these are made by hand.

## Declarations
11. **Copy the age rating from the live record**; Apple adds questions.
12. **Play's content rating counts AI output**, and Play declarations are console-only; `400 FAILED_PRECONDITION` on promote is a refusal, not a missing step.
13. **Reviewers need a working account and a deletion page that opens without signing in.**
14. **Privacy answers come from the code**; `legal/declaration.yml` is the one source.

## App Review
15. **A new account gets a 2.1 information request.** Put a real-device recording, purpose, setup, services and a purchase walkthrough in the review notes up front.
16. **Test on the newest OS and on iPad** (charades crashed on iOS 27 at launch; the fix was scene support).
17. **Reuse a rejected version record**; a new one loses screenshots, notes and video.
18. **Rejection reasons are only in the web UI** (Resolution Center).
19. **One team API key serves every app**; it is kept with imposter's secrets.
20. **App Store Connect can fail a save silently**; reload to confirm.
21. **`eas submit` can queue for 25+ minutes**; `xcrun altool` with the team key is faster.
22. **Approval is not release** when release type is Manual. Leave What's New unset on a first version.
23. **A Play upload can sit as a draft** and never reach users.

## Testers and launching
24. **Play's gate**: a personal account needs 12 testers opted in for 14 continuous days; an uninstall resets that person. Only the console shows the count.
25. **Follow-through is the bottleneck**: re-ping admitted testers before finding new ones. Swap groups are fastest; never buy testers.
26. **Email lists and Google Groups are a radio, not a checkbox**: switching drops everyone on the other.
27. **TestFlight's public link serves the External group's build**, and a build joins no group by itself.
28. **Testers cannot test a paywall with no products**; say so in the notes.
29. **When the EAS quota is spent, build Android locally** with `scripts/release-android.mjs` (upload key, channel, version code, Gradle memory).
30. **A native change cannot ship as an OTA**, and an OTA reaches only installs on the same version.
31. **"Live" is read from a console, not assumed.**
32. **Tester links live in the portfolio's `products.json`** (`testUrl`, `groupUrl`) and show on each product page. Send that page, not a copied list.
33. **A track that selects by email list needs the tester's account email**: the Google account for Android, the Apple ID for iPhone. Ask for that exact address. A live Play app needs no opt-in; send the store link.
34. **Where the links come from.** Play: Test and release → Testing → the track → Testers → "Copy link"; stable per app and track. TestFlight: the External group → Enable Public Link. `imposter` wraps it: `pnpm tf:status`, `pnpm tf:add <email>`.

## Play API
35. **One service account serves the Play account**, `play-service-account.json`, gitignored in each app and backed up under `local/secrets/products/<app>/`. On 2026-09-19 it could not reach chess or chitragupt (403); grant it per app under Users and permissions.
36. **Read a track without touching it**: open an edit, `GET .../edits/{id}/tracks`, then `DELETE` the edit. `askcal/scripts/play-upload-aab.py` already has the signing code (`token()`); reuse it.
37. **Price subscriptions with `pricing:convertRegionPrices`**: pass back the `regionVersion` it returns ("Invalid currency for region code BG" means an old one), and create a subscription with at least one base plan in the same call.
