---
last-verified: 2026-10-15
---

# testing

- A closed Android track that admits a Google Group gets two numbered buttons:
  join the group, then install from Play. Both are needed, because Play only
  lets group members opt in, so they are numbered rather than merged.
- The group button opens the group's `/about` page, not `/g/<group>`. The bare
  address opens the conversations, which are members-only, so a non-member got
  "You don't have permission to access this content" and no way to join. The
  about page is the one Google shows non-members, with the Join button.
  Since 2026-10-15 every tester group also lets anyone view conversations, so
  links shared before this change work too. Posting and the member list stay
  managers-only.
- iOS gets one button, the public TestFlight link.
- The steps are written out under the buttons, not left in a hover title.
  Phones have no hover, and testers kept getting stuck at the two places a
  title used to explain: a test app is not in Play search (Become a tester,
  then the page's own Google Play link), and an iPhone beta installs through
  TestFlight, not the App Store. Each line appears only for a platform the
  project actually offers that way.
- No email button. A written request is the fallback only for a track with no
  door of its own, and that case is not drawn here.
- Every button opens in a new tab: they all leave the site.
- The design link carries a phone or a monitor icon, opens in a new tab and
  lands on the screenshots sheet, where every screen is visible at once.
