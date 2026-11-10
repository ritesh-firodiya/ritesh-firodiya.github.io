---
updated: 2026-11-10
horizon: 2026-11-17
---

# Tasks — ritesh-firodiya.github.io

## Now
1. [ ] T027 Rotate `DESIGNS_TOKEN` before 2027-10-05, and sooner if this session's transcript is ever shared — the value was pasted into chat once
2. [ ] T012 Set the Play website field to `/products/<slug>/` for charades and tic-tac-toe — both point at the site root today; their App Store listings are already right. Play Console → the app → Store settings → Website: https://play.google.com/console/u/0/developers/4747277435467425614/app-list
3. [ ] T028 https://chitragupt.ai/legal/delete-account now answers 200 (checked 2026-11-10): forward `public/legal/chitragupt/delete-account.html` to it as 0380f8b did, and point `legal.delete` in products.json there. Until the web deploy, this site keeps the full page

## Parallel
- [ ] T024 [P] Case studies for Aakalan and Charades  `feat:0001`
- [ ] T025 [P] Wiki pages ship ~125KB each because Next writes the page three times; 617 pages is 89MB of the 103MB export. Fine for Pages (1GB), worth trimming
