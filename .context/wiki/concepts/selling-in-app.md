---
last-verified: 2026-10-27
---

# Selling inside an app

Lessons from charades, imposter, askcal, aakalan and chitragupt. Prices live in each product's wiki entity, never here.

## Products and entitlements
1. **A product id is permanent; type it once, from code.** Play ids cannot be renamed or reused. A mismatch fails at purchase ("Product not found"), not at build.
2. **One entitlement per product, same id; read only `entitlements.active`**, so a refund removes access.
3. **One offering must be Current**, or `getOfferings().current` is null and the store screen shows its failed state.
4. **Same product ids on both stores**, so one entitlement covers both.
5. **Sell as few products as the model allows.** Charades' 32 products held its iOS paywall back; imposter sells one.
6. **The SKU carries what the store cannot pass** (chitragupt encodes year and tier in the id).

## Keys and builds
7. **`.env` reaches no cloud build.** Public RevenueCat keys go in `eas.json` build env or EAS secrets.
8. **An OTA needs its own copy of the keys** in the EAS environment; charades shipped `undefined` keys by OTA and every purchase looked like "owns nothing".
9. **A Test Store key never reaches a release build**; it grants entitlements for free. Each new product needs its Test Store slot set.
10. **RevenueCat's App Store app takes the In-App Purchase key**, not the App Store Connect API key. Apple lets the `.p8` download once.

## Server side
11. **"We could not check" is not "you have not paid".** Entitlement checks return `yes | no | unknown`; `unknown` moves no counter and shows Restore, never a price (askcal incident 2026-09-22).
12. **Log why an entitlement was denied.** First suspects: a v2 secret key on a v1 endpoint, and an id that is the display name.
13. **The webhook grants the purchase, not the device**, and records the amount from our own table.

## Paywall
14. **Never hardcode a price**; print the store's `priceString`, or no number until it answers.
15. **Price, renewal and cancel are visible without a tap**; "Not now" is a real button.
16. **Terms and Privacy links on the paywall** (guideline 3.1.2), with the auto-renew terms on screen.
17. **Restore Purchases is easy to find.**
18. **The plan table lists only what works today.** A false row is a false claim and a rejection.
19. **No unconditional free trial**; a returning subscriber is charged at once.
20. **No urgency devices**: no countdown, struck price, pre-selected plan or delayed close.
21. **A cancelled purchase shows no error; a failed one says why.**

## What to charge for
22. **The paid tier never sits inside the core loop.**
23. **Meter only what costs money, and show the meter early.**
24. **Pick the billing unit on purpose** (person, household, or one assessment year).
25. **On Android, app features sell through Play Billing**; Razorpay stays for the web and for real-person services.
26. **Ads only: the listing says so, and an ad never breaks the game.** Consent (GDPR, ATT) and `app-ads.txt` are separate console tasks.

## Store setup and rejections
27. **Play: BillDesk cross-border verification first**, or no subscription can be created.
28. **Price every region.** A Draft product cannot be bought; one territory priced leaves the rest in Missing Metadata.
29. **Apple subscription fields fail quietly**: 54-character description; a review screenshot per subscription, locked while in review.
30. **The App Store description must link the Terms**, or subscriptions are auto-rejected under 3.1.2. The live legal host is named in `~/git/products/CLAUDE.md`.
31. **Subscriptions go to review with the version, from the web UI only**: Add for Review on the group page, each subscription, then the version.
32. **Never submit the version alone**: approval without purchases ships dead buy buttons.
