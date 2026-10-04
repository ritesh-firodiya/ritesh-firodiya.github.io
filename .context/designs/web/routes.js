/* The set's manifest — the ONE place a screen is declared.
 * ============================================================================
 * _chrome.js reads this once and publishes window.WF; the chart and the
 * screenshots sheet read that. A screen not in this file appears nowhere.
 *
 * This is the portfolio's own set. Each product's set lives in its own repo and
 * is pulled in at build time, never copied here.
 *
 * The edges were DERIVED by scanning the real hrefs in every screen, then
 * classified. 54 edges; most are the header and footer, which every screen
 * carries, so they are `side` (navigation, no progress) or `back` (to Home).
 */
window.ROUTES = {
  product: "Ritesh Firodiya",
  surface: "web",

  /* Web only, and written phone first: every unprefixed class is the 390px
     layout and sm: / md: / lg: add to it. `?bare` in a 390px window is the
     phone layout. There is no separate mobile surface, so the toggle shows
     `mobile` struck through. */
  surfaces: ["web"],
  themes: ["light", "dark"],

  /* The laptop this is designed against. _chrome.js publishes these as
     --frame-w / --frame-h. */
  frame: { w: 1440, h: 900 },

  /* Reserved order: states · auth · onboarding · home · * · settings · store ·
     patterns. No auth, onboarding, settings or store — the site signs nobody
     in and sells nothing. The `*` slot sorts alphabetically. */
  flows: [
    { flow: "states", screens: [
      {file: "states/404.html", screen: "Not found", status: "review", notes: "not-found"},
    ]},
    { flow: "home", screens: [
      {file: "home/home.html", screen: "Home", status: "review", notes: "home"},
    ]},
    { flow: "go", screens: [
      {file: "go/go.html", screen: "Short link", status: "review", notes: "go"},
    ]},
    { flow: "legal", screens: [
      {file: "legal/legal.html", screen: "Legal", status: "review", notes: "legal"},
      {file: "legal/policy.html", screen: "Policy", status: "review", notes: "policy"},
    ]},
    { flow: "resume", screens: [
      {file: "resume/resume.html", screen: "Résumé", status: "review", notes: "resume"},
    ]},
    { flow: "support", screens: [
      {file: "support/support.html", screen: "Support", status: "review", notes: "support"},
    ]},
    { flow: "wiki", screens: [
      {file: "wiki/wiki.html", screen: "Wiki", states: {empty: "wiki/wiki-empty.html"}, status: "review", notes: "wiki"},
      {file: "wiki/page.html", screen: "Wiki page", status: "review", notes: "wiki-page"},
    ]},
    { flow: "work", screens: [
      {file: "work/project.html", screen: "Project", status: "review", notes: "project"},
      {file: "work/unreleased.html", screen: "Project, no build", status: "review", notes: "unreleased"},
    ]},
  ],

  /* No splash, so the chart starts where the site does. The résumé is the
     end: the site exists to get it read. */
  flow: {
    start: "home/home.html",
    end: ["resume/resume.html"],
    edges: [
      {from: "states/404.html", to: "home/home.html", back: true},
      {from: "states/404.html", to: "resume/resume.html", side: true},
      {from: "states/404.html", to: "support/support.html", side: true},
      {from: "states/404.html", to: "legal/legal.html", side: true},
      {from: "home/home.html", to: "resume/resume.html", label: "Résumé"},
      {from: "home/home.html", to: "work/project.html", label: "A project with a build"},
      {from: "home/home.html", to: "work/unreleased.html", label: "A project with none"},
      {from: "home/home.html", to: "support/support.html", label: "Support"},
      {from: "home/home.html", to: "legal/legal.html", label: "Legal"},
      {from: "go/go.html", to: "work/project.html", label: "About the app"},
      {from: "go/go.html", to: "home/home.html", back: true},
      {from: "legal/legal.html", to: "home/home.html", back: true},
      {from: "legal/legal.html", to: "resume/resume.html", side: true},
      {from: "legal/legal.html", to: "legal/policy.html", label: "A document"},
      {from: "legal/legal.html", to: "support/support.html", side: true},
      {from: "legal/policy.html", to: "home/home.html", back: true},
      {from: "legal/policy.html", to: "resume/resume.html", side: true},
      {from: "legal/policy.html", to: "legal/legal.html", side: true},
      {from: "legal/policy.html", to: "support/support.html", side: true},
      {from: "support/support.html", to: "home/home.html", back: true},
      {from: "support/support.html", to: "resume/resume.html", side: true},
      {from: "support/support.html", to: "legal/legal.html", side: true},
      {from: "wiki/wiki.html", to: "home/home.html", back: true},
      {from: "wiki/wiki.html", to: "resume/resume.html", side: true},
      {from: "wiki/wiki.html", to: "work/project.html", side: true},
      {from: "wiki/wiki.html", to: "wiki/page.html", label: "A page"},
      {from: "wiki/wiki.html", to: "support/support.html", side: true},
      {from: "wiki/wiki.html", to: "legal/legal.html", side: true},
      {from: "wiki/wiki-empty.html", to: "home/home.html", state: true},
      {from: "wiki/wiki-empty.html", to: "resume/resume.html", state: true},
      {from: "wiki/wiki-empty.html", to: "wiki/wiki.html", state: true},
      {from: "wiki/wiki-empty.html", to: "work/project.html", state: true},
      {from: "wiki/wiki-empty.html", to: "support/support.html", state: true},
      {from: "wiki/wiki-empty.html", to: "legal/legal.html", state: true},
      {from: "wiki/page.html", to: "home/home.html", back: true},
      {from: "wiki/page.html", to: "resume/resume.html", side: true},
      {from: "wiki/page.html", to: "wiki/wiki.html", side: true},
      {from: "wiki/page.html", to: "work/project.html", side: true},
      {from: "wiki/page.html", to: "support/support.html", side: true},
      {from: "wiki/page.html", to: "legal/legal.html", side: true},
      {from: "resume/resume.html", to: "home/home.html", back: true},
      {from: "resume/resume.html", to: "support/support.html", side: true},
      {from: "resume/resume.html", to: "legal/legal.html", side: true},
      {from: "work/project.html", to: "home/home.html", back: true},
      {from: "work/project.html", to: "resume/resume.html", side: true},
      {from: "work/project.html", to: "wiki/wiki.html", label: "Wiki"},
      {from: "work/project.html", to: "legal/policy.html", side: true},
      {from: "work/project.html", to: "support/support.html", side: true},
      {from: "work/project.html", to: "legal/legal.html", side: true},
      {from: "work/unreleased.html", to: "home/home.html", back: true},
      {from: "work/unreleased.html", to: "resume/resume.html", side: true},
      {from: "work/unreleased.html", to: "wiki/wiki.html", label: "Wiki"},
      {from: "work/unreleased.html", to: "support/support.html", side: true},
      {from: "work/unreleased.html", to: "legal/legal.html", side: true},
    ],
  },

  updated: "2026-10-04",

  missing: [
    { what: "A product's own design set", why: "served as that set's own index.html at /products/<slug>/designs/ — it is the product's document, not a screen of this site" },
    { what: "Forwards for /work, /process, /about, /contact, /hire, /products and /work/<slug>", why: "meta-refresh files with no visible layout" },
  ],

  states: {
    empty:   { drawn: "wiki/wiki-empty.html", note: "the wiki filter matching nothing — the only list a visitor can narrow to zero" },
    loading: { drawn: null, note: "static export; nothing is fetched after the page arrives" },
    error:   { drawn: null, note: "the only error a static site has is a missing page, which is states/404.html" },
    offline: { drawn: null, note: "no service worker and no runtime data" },
    locked:  { drawn: null, note: "nothing is behind a sign-in" },
  },
};
