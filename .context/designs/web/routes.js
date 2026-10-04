/* The set's manifest — the ONE place a screen is declared.
 * ============================================================================
 * _chrome.js reads this once and publishes window.WF; the chart and the
 * screenshots sheet read that. A screen not in this file appears nowhere.
 *
 * This is the portfolio's own set. Each product's set lives in its own repo and
 * is pulled in at build time, never copied here.
 *
 * The edges were DERIVED by scanning the real hrefs in every screen, then
 * classified. 131 edges; most are the header and footer, which every screen
 * carries, so they are `side` (navigation, no progress) or `back` (to Home).
 */
window.ROUTES = {
  product: "Ritesh Firodiya",
  surface: "web",

  /* Web only. There is no separate mobile surface: every screen is responsive,
     and `?bare` in a 390px window is the phone layout. The surface toggle shows
     `mobile` struck through so the gap reads as a gap. */
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
      {file: "states/404.html", screen: "Not found", status: "built", notes: "not-found"},
    ]},
    { flow: "home", screens: [
      {file: "home/home.html", screen: "Home", status: "built", notes: "home"},
    ]},
    { flow: "about", screens: [
      {file: "about/about.html", screen: "About", status: "built", notes: "about"},
      {file: "about/resume.html", screen: "Résumé", status: "built", notes: "resume"},
    ]},
    { flow: "contact", screens: [
      {file: "contact/contact.html", screen: "Contact", status: "built", notes: "contact"},
    ]},
    { flow: "go", screens: [
      {file: "go/go.html", screen: "Short link", status: "built", notes: "go"},
    ]},
    { flow: "legal", screens: [
      {file: "legal/legal.html", screen: "Legal", status: "built", notes: "legal"},
      {file: "legal/policy.html", screen: "Policy", status: "built", notes: "policy"},
    ]},
    { flow: "process", screens: [
      {file: "process/process.html", screen: "How I build", status: "built", notes: "process"},
    ]},
    { flow: "support", screens: [
      {file: "support/support.html", screen: "Support", status: "built", notes: "support"},
    ]},
    { flow: "wiki", screens: [
      {file: "wiki/wiki.html", screen: "Wiki", states: {empty: "wiki/wiki-empty.html"}, status: "built", notes: "wiki"},
      {file: "wiki/page.html", screen: "Wiki page", status: "built", notes: "wiki-page"},
    ]},
    { flow: "work", screens: [
      {file: "work/work.html", screen: "Work", status: "built", notes: "work"},
      {file: "work/project.html", screen: "Project", status: "built", notes: "project"},
      {file: "work/unreleased.html", screen: "Unreleased project", status: "built", notes: "unreleased"},
    ]},
  ],

  /* No splash, so the chart starts where the site does. Contact is the end:
     the site exists to get one email sent. */
  flow: {
    start: "home/home.html",
    end: ["contact/contact.html"],
    edges: [
      {from: "states/404.html", to: "home/home.html", back: true},
      {from: "states/404.html", to: "work/work.html", side: true},
      {from: "states/404.html", to: "process/process.html", side: true},
      {from: "states/404.html", to: "about/about.html", side: true},
      {from: "states/404.html", to: "about/resume.html", side: true},
      {from: "states/404.html", to: "contact/contact.html", side: true},
      {from: "states/404.html", to: "support/support.html", side: true},
      {from: "states/404.html", to: "legal/legal.html", side: true},
      {from: "home/home.html", to: "work/work.html", label: "All work"},
      {from: "home/home.html", to: "process/process.html", label: "How I build"},
      {from: "home/home.html", to: "about/about.html", label: "About"},
      {from: "home/home.html", to: "about/resume.html", side: true},
      {from: "home/home.html", to: "contact/contact.html", side: true},
      {from: "home/home.html", to: "work/project.html", side: true},
      {from: "home/home.html", to: "support/support.html", label: "Support"},
      {from: "home/home.html", to: "legal/legal.html", label: "Legal"},
      {from: "about/about.html", to: "home/home.html", back: true},
      {from: "about/about.html", to: "work/work.html", side: true},
      {from: "about/about.html", to: "process/process.html", side: true},
      {from: "about/about.html", to: "about/resume.html", label: "Résumé"},
      {from: "about/about.html", to: "contact/contact.html", side: true},
      {from: "about/about.html", to: "wiki/wiki.html", side: true},
      {from: "about/about.html", to: "support/support.html", side: true},
      {from: "about/about.html", to: "legal/legal.html", side: true},
      {from: "about/resume.html", to: "home/home.html", back: true},
      {from: "about/resume.html", to: "work/work.html", side: true},
      {from: "about/resume.html", to: "process/process.html", side: true},
      {from: "about/resume.html", to: "about/about.html", side: true},
      {from: "about/resume.html", to: "contact/contact.html", label: "Get in touch"},
      {from: "about/resume.html", to: "support/support.html", side: true},
      {from: "about/resume.html", to: "legal/legal.html", side: true},
      {from: "contact/contact.html", to: "home/home.html", back: true},
      {from: "contact/contact.html", to: "work/work.html", side: true},
      {from: "contact/contact.html", to: "process/process.html", side: true},
      {from: "contact/contact.html", to: "about/about.html", side: true},
      {from: "contact/contact.html", to: "about/resume.html", side: true},
      {from: "contact/contact.html", to: "support/support.html", side: true},
      {from: "contact/contact.html", to: "legal/legal.html", side: true},
      {from: "go/go.html", to: "work/project.html", label: "About the app"},
      {from: "go/go.html", to: "work/work.html", side: true},
      {from: "legal/legal.html", to: "home/home.html", back: true},
      {from: "legal/legal.html", to: "work/work.html", side: true},
      {from: "legal/legal.html", to: "process/process.html", side: true},
      {from: "legal/legal.html", to: "about/about.html", side: true},
      {from: "legal/legal.html", to: "about/resume.html", side: true},
      {from: "legal/legal.html", to: "contact/contact.html", side: true},
      {from: "legal/legal.html", to: "legal/policy.html", label: "A document"},
      {from: "legal/legal.html", to: "support/support.html", side: true},
      {from: "legal/policy.html", to: "home/home.html", back: true},
      {from: "legal/policy.html", to: "work/work.html", side: true},
      {from: "legal/policy.html", to: "process/process.html", side: true},
      {from: "legal/policy.html", to: "about/about.html", side: true},
      {from: "legal/policy.html", to: "about/resume.html", side: true},
      {from: "legal/policy.html", to: "contact/contact.html", side: true},
      {from: "legal/policy.html", to: "legal/legal.html", side: true},
      {from: "legal/policy.html", to: "support/support.html", side: true},
      {from: "process/process.html", to: "home/home.html", back: true},
      {from: "process/process.html", to: "work/work.html", side: true},
      {from: "process/process.html", to: "about/about.html", side: true},
      {from: "process/process.html", to: "about/resume.html", side: true},
      {from: "process/process.html", to: "contact/contact.html", side: true},
      {from: "process/process.html", to: "work/project.html", side: true},
      {from: "process/process.html", to: "work/unreleased.html", side: true},
      {from: "process/process.html", to: "wiki/wiki.html", label: "Wiki"},
      {from: "process/process.html", to: "support/support.html", side: true},
      {from: "process/process.html", to: "legal/legal.html", side: true},
      {from: "support/support.html", to: "home/home.html", back: true},
      {from: "support/support.html", to: "work/work.html", side: true},
      {from: "support/support.html", to: "process/process.html", side: true},
      {from: "support/support.html", to: "about/about.html", side: true},
      {from: "support/support.html", to: "about/resume.html", side: true},
      {from: "support/support.html", to: "contact/contact.html", side: true},
      {from: "support/support.html", to: "legal/legal.html", side: true},
      {from: "wiki/wiki.html", to: "home/home.html", back: true},
      {from: "wiki/wiki.html", to: "work/work.html", side: true},
      {from: "wiki/wiki.html", to: "process/process.html", side: true},
      {from: "wiki/wiki.html", to: "about/about.html", side: true},
      {from: "wiki/wiki.html", to: "about/resume.html", side: true},
      {from: "wiki/wiki.html", to: "contact/contact.html", side: true},
      {from: "wiki/wiki.html", to: "work/project.html", side: true},
      {from: "wiki/wiki.html", to: "wiki/page.html", label: "A page"},
      {from: "wiki/wiki.html", to: "support/support.html", side: true},
      {from: "wiki/wiki.html", to: "legal/legal.html", side: true},
      {from: "wiki/wiki-empty.html", to: "home/home.html", state: true},
      {from: "wiki/wiki-empty.html", to: "work/work.html", state: true},
      {from: "wiki/wiki-empty.html", to: "process/process.html", state: true},
      {from: "wiki/wiki-empty.html", to: "about/about.html", state: true},
      {from: "wiki/wiki-empty.html", to: "about/resume.html", state: true},
      {from: "wiki/wiki-empty.html", to: "contact/contact.html", state: true},
      {from: "wiki/wiki-empty.html", to: "wiki/wiki.html", state: true},
      {from: "wiki/wiki-empty.html", to: "work/project.html", state: true},
      {from: "wiki/wiki-empty.html", to: "support/support.html", state: true},
      {from: "wiki/wiki-empty.html", to: "legal/legal.html", state: true},
      {from: "wiki/page.html", to: "home/home.html", back: true},
      {from: "wiki/page.html", to: "work/work.html", side: true},
      {from: "wiki/page.html", to: "process/process.html", side: true},
      {from: "wiki/page.html", to: "about/about.html", side: true},
      {from: "wiki/page.html", to: "about/resume.html", label: "Résumé"},
      {from: "wiki/page.html", to: "contact/contact.html", side: true},
      {from: "wiki/page.html", to: "wiki/wiki.html", side: true},
      {from: "wiki/page.html", to: "work/project.html", side: true},
      {from: "wiki/page.html", to: "support/support.html", side: true},
      {from: "wiki/page.html", to: "legal/legal.html", side: true},
      {from: "work/work.html", to: "home/home.html", back: true},
      {from: "work/work.html", to: "process/process.html", side: true},
      {from: "work/work.html", to: "about/about.html", side: true},
      {from: "work/work.html", to: "about/resume.html", side: true},
      {from: "work/work.html", to: "contact/contact.html", side: true},
      {from: "work/work.html", to: "work/project.html", label: "A shipped project"},
      {from: "work/work.html", to: "work/unreleased.html", label: "An unshipped project"},
      {from: "work/work.html", to: "support/support.html", side: true},
      {from: "work/work.html", to: "legal/legal.html", side: true},
      {from: "work/project.html", to: "home/home.html", back: true},
      {from: "work/project.html", to: "work/work.html", side: true},
      {from: "work/project.html", to: "process/process.html", side: true},
      {from: "work/project.html", to: "about/about.html", side: true},
      {from: "work/project.html", to: "about/resume.html", side: true},
      {from: "work/project.html", to: "contact/contact.html", side: true},
      {from: "work/project.html", to: "wiki/wiki.html", label: "Read the wiki"},
      {from: "work/project.html", to: "legal/policy.html", side: true},
      {from: "work/project.html", to: "support/support.html", side: true},
      {from: "work/project.html", to: "legal/legal.html", side: true},
      {from: "work/unreleased.html", to: "home/home.html", back: true},
      {from: "work/unreleased.html", to: "work/work.html", side: true},
      {from: "work/unreleased.html", to: "process/process.html", side: true},
      {from: "work/unreleased.html", to: "about/about.html", side: true},
      {from: "work/unreleased.html", to: "about/resume.html", side: true},
      {from: "work/unreleased.html", to: "contact/contact.html", side: true},
      {from: "work/unreleased.html", to: "wiki/wiki.html", label: "Read the wiki"},
      {from: "work/unreleased.html", to: "support/support.html", side: true},
      {from: "work/unreleased.html", to: "legal/legal.html", side: true},
    ],
  },

  updated: "2026-10-04",

  missing: [
    { what: "A product's own design set", why: "served as that set's own index.html at /products/<slug>/designs/ — it is the product's document, not a screen of this site" },
    { what: "Redirects for /hire, /products and /work/<slug>", why: "meta-refresh files with no visible layout" },
  ],

  states: {
    empty:   { drawn: "wiki/wiki-empty.html", note: "the wiki filter matching nothing — the only list a visitor can narrow to zero" },
    loading: { drawn: null, note: "static export; nothing is fetched after the page arrives" },
    error:   { drawn: null, note: "the only error a static site has is a missing page, which is states/404.html" },
    offline: { drawn: null, note: "no service worker and no runtime data" },
    locked:  { drawn: null, note: "nothing is behind a sign-in" },
  },
};
