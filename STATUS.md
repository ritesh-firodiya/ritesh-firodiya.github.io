Stage: live
Updated: 2026-09-26
Next: nothing blocking. The design set in .context/designs/web is approved and
      built; the live site implements it.
Note: products.json verified against the stores on 2026-09-26 — Play tracks read
      from the Play Developer API, iOS from the public App Store lookup. Tic Tac
      Toe is live on the App Store (was still described as a TestFlight beta).
      `tests/` now asserts the invariants CLAUDE.md states, and CI runs them.
Done:  - Charades' Play ads declaration was wrong ("Contains ads") and is
         fixed: changed to "No, my app does not contain ads" and sent for
         review on 2026-09-26. Verified against the shipped 1.0.32 AAB — no ad
         SDK in deps, no gms.ads.APPLICATION_ID in the manifest, no MobileAds/
         AdView/AdRequest in mapping.txt or the DEX, no WebView, and the only
         in-app promotion is its own IAP card packs. The "Contains ads" badge
         clears from the listing once Google approves.
Open:
       - products.json says askcal iOS is "TestFlight internal only". Unverified
         — App Store Connect was not reachable from the session that checked.
       - learning-platform is a live web demo with Login and Sign Up and no
         privacy policy. Pinned as a known exception in tests/data.test.mjs.
       - bin/products still does not exist. verifiedOn + the 30-day test are the
         only guarantee until it does.
