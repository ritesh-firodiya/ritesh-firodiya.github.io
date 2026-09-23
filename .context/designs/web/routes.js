/* The set's manifest — the ONE place a screen is declared.
 * ============================================================================
 * _chrome.js, index.html and screenshots.html all read this. A screen not in
 * this file appears nowhere: not in the bar, not in the chart, not on the
 * contact sheet. Adding one is a single edit, and forgetting is visible
 * immediately rather than months later.
 *
 * This is the portfolio's own set. The products' sets live in the product
 * repos and are NOT duplicated here — that was done once, cost 2.8MB and a
 * build-time dependency on eight private repos, and was deleted.
 */
window.ROUTES = {
  product: "Ritesh Firodiya",
  surface: "web",

  /* Web only. Mobile is a GAP, not a decision — the site is responsive and
     nobody has drawn the narrow screens. §4 renders the unavailable half of
     the surface toggle struck through rather than hiding it, so the gap looks
     like a gap instead of like "there is no mobile here". */
  surfaces: ["web"],

  themes: ["light", "dark"],

  /* Not 390x844. The frame comes from here rather than from shared.css, whose
     defaults describe a phone; _chrome.js publishes these two as --frame-w /
     --frame-h. 1440x900 is the laptop this is designed against. */
  frame: { w: 1440, h: 900 },

  /* Reserved order: states · auth · onboarding · home · * · settings · store ·
     patterns. This set draws no auth, onboarding, settings or store — a
     portfolio signs nobody in and sells nothing directly. The `*` slot sorts
     alphabetically: about, contact, hire, legal, products, work. */
  flows: [
    { flow: "states", screens: [
      { file: "states/404.html", screen: "Not found", status: "built", notes: "not-found" },
    ]},

    { flow: "home", screens: [
      { file: "home/home.html", screen: "Home", status: "built", notes: "home" },
    ]},

    { flow: "about", screens: [
      { file: "about/about.html",  screen: "About",  status: "built", notes: "about" },
      { file: "about/resume.html", screen: "Résumé", status: "built", notes: "resume" },
    ]},

    { flow: "contact", screens: [
      { file: "contact/contact.html", screen: "Get in touch", status: "built", notes: "contact" },
    ]},

    { flow: "hire", screens: [
      { file: "hire/hire.html", screen: "Work together", status: "built", notes: "hire" },
    ]},

    { flow: "legal", screens: [
      { file: "legal/legal.html", screen: "Legal",  status: "built", notes: "legal" },
      { file: "legal/policy.html", screen: "Policy", status: "built", notes: "policy" },
    ]},

    { flow: "products", screens: [
      { file: "products/products.html", screen: "Products", status: "built", notes: "products",
        states: { empty: "products/products-empty.html" } },
      /* One product page, drawn at the hardest case: shipping on two stores,
         a subscription, and analytics to disclose. The five monetization
         models are a data difference, not five screens. */
      { file: "products/product.html", screen: "Product", status: "built", notes: "product" },
      /* NOT a state of Product. "Unreleased" is not in the closed set
         (empty · loading · error · offline · locked), and §5 says anything the
         closed set cannot name is its own screen. It is genuinely a different
         page: no install button to disable, and a reason where the stores go. */
      { file: "products/unreleased.html", screen: "Unreleased", status: "built", notes: "unreleased" },
    ]},

    { flow: "work", screens: [
      { file: "work/work.html",       screen: "Work",       status: "built", notes: "work" },
      { file: "work/case-study.html", screen: "Case study", status: "built", notes: "case-study" },
    ]},
  ],

  /* The chart.
   *
   * start is Home: this product has no splash, so it is the screen the site
   * actually opens on, and the column rank counts from it.
   *
   * The main path is FOUND, not declared — start to the first end node
   * following forward edges — so the spine here is
   *   Home → Work → Case study → Work together → Get in touch,
   * which is the journey this site is for: see the work, believe it, hire.
   */
  flow: {
    start: "home/home.html",
    end: ["contact/contact.html"],
    edges: [
      /* the spine */
      { from: "home/home.html",            to: "work/work.html",            label: "See the work" },
      { from: "work/work.html",            to: "work/case-study.html",      label: "Read it" },
      { from: "work/case-study.html",      to: "hire/hire.html",            label: "Work with me" },
      { from: "hire/hire.html",            to: "contact/contact.html",      label: "Start a conversation" },

      /* the other branches off Home — real navigation, real progress */
      { from: "home/home.html",            to: "products/products.html",    label: "Products" },
      { from: "home/home.html",            to: "about/about.html",          label: "About" },
      { from: "home/home.html",            to: "legal/legal.html",          label: "Legal" },
      { from: "products/products.html",    to: "products/product.html",     label: "A product" },
      { from: "products/products.html",    to: "products/unreleased.html",  label: "Not built yet" },
      { from: "about/about.html",          to: "about/resume.html",         label: "Résumé" },
      { from: "legal/legal.html",          to: "legal/policy.html",         label: "A policy" },

      /* shortcuts — real navigation, no progress, so they must not drag their
         target right. The header CTA jumps past the whole spine to Contact;
         counted as progress it would rank Contact at column 1 and collapse
         the journey the chart exists to show. */
      { from: "home/home.html",            to: "contact/contact.html",      label: "Get in touch", side: true },
      { from: "products/product.html",     to: "legal/policy.html",         label: "Privacy",      side: true },
      { from: "about/about.html",          to: "contact/contact.html",      label: "Email",        side: true },
      { from: "products/product.html",     to: "hire/hire.html",            label: "Work with me", side: true },

      /* returns — every screen goes home, so these all converge and would
         cross everything on the way. Hidden behind the toggle. */
      { from: "work/work.html",            to: "home/home.html",            back: true },
      { from: "products/products.html",    to: "home/home.html",            back: true },
      { from: "about/about.html",          to: "home/home.html",            back: true },
      { from: "legal/legal.html",          to: "home/home.html",            back: true },
      { from: "contact/contact.html",      to: "home/home.html",            back: true },
      { from: "states/404.html",           to: "home/home.html",            back: true },

      /* The empty variant of Products offers the same navigation the base
         screen already offers, so drawing it again would duplicate the step.
         Not a journey move — §6. */
      { from: "products/products-empty.html", to: "products/product.html",  state: true },

      /* ── PERSISTENT NAVIGATION ─────────────────────────────────────────
         Every screen but 404 carries the site header and footer, so each one
         links to Work, Products, About, Hire, Contact, Legal and Home. §12
         says every link is a declared edge or the chart under-reports the
         product, and these are 73 real links.

         They are DERIVED, not recalled — scanned out of the hrefs actually in
         the files, per §13 step 6. Written from memory a set under-reports
         itself by about a quarter, and this is exactly where that happens: a
         header is the easiest thing in a design to stop seeing.

         Classified the way §6 defines the flags, not for convenience:
           back  — anything returning to Home. Every screen goes there, so
                   drawn they would all converge and cross everything.
           side  — the rest. A header link is real navigation that makes no
                   progress; counted as progress it would drag its target
                   right and flatten the spine the chart exists to show. */
      { from: "about/about.html",               to: "hire/hire.html",                 side: true },
      { from: "about/about.html",               to: "legal/legal.html",               side: true },
      { from: "about/about.html",               to: "products/products.html",         side: true },
      { from: "about/about.html",               to: "work/work.html",                 side: true },
      { from: "about/resume.html",              to: "about/about.html",               side: true },
      { from: "about/resume.html",              to: "contact/contact.html",           side: true },
      { from: "about/resume.html",              to: "hire/hire.html",                 side: true },
      { from: "about/resume.html",              to: "home/home.html",                 back: true },
      { from: "about/resume.html",              to: "legal/legal.html",               side: true },
      { from: "about/resume.html",              to: "products/products.html",         side: true },
      { from: "about/resume.html",              to: "work/work.html",                 side: true },
      { from: "contact/contact.html",           to: "about/about.html",               side: true },
      { from: "contact/contact.html",           to: "hire/hire.html",                 side: true },
      { from: "contact/contact.html",           to: "legal/legal.html",               side: true },
      { from: "contact/contact.html",           to: "products/products.html",         side: true },
      { from: "contact/contact.html",           to: "work/work.html",                 side: true },
      { from: "hire/hire.html",                 to: "about/about.html",               side: true },
      { from: "hire/hire.html",                 to: "home/home.html",                 back: true },
      { from: "hire/hire.html",                 to: "legal/legal.html",               side: true },
      { from: "hire/hire.html",                 to: "products/products.html",         side: true },
      { from: "hire/hire.html",                 to: "work/work.html",                 side: true },
      { from: "home/home.html",                 to: "about/resume.html",              side: true },
      { from: "home/home.html",                 to: "hire/hire.html",                 side: true },
      { from: "home/home.html",                 to: "products/product.html",          side: true },
      { from: "home/home.html",                 to: "products/unreleased.html",       side: true },
      { from: "home/home.html",                 to: "work/case-study.html",           side: true },
      { from: "legal/legal.html",               to: "about/about.html",               side: true },
      { from: "legal/legal.html",               to: "contact/contact.html",           side: true },
      { from: "legal/legal.html",               to: "hire/hire.html",                 side: true },
      { from: "legal/legal.html",               to: "products/products.html",         side: true },
      { from: "legal/legal.html",               to: "work/work.html",                 side: true },
      { from: "legal/policy.html",              to: "about/about.html",               side: true },
      { from: "legal/policy.html",              to: "contact/contact.html",           side: true },
      { from: "legal/policy.html",              to: "hire/hire.html",                 side: true },
      { from: "legal/policy.html",              to: "home/home.html",                 back: true },
      { from: "legal/policy.html",              to: "legal/legal.html",               side: true },
      { from: "legal/policy.html",              to: "products/products.html",         side: true },
      { from: "legal/policy.html",              to: "work/work.html",                 side: true },
      { from: "products/product.html",          to: "about/about.html",               side: true },
      { from: "products/product.html",          to: "contact/contact.html",           side: true },
      { from: "products/product.html",          to: "home/home.html",                 back: true },
      { from: "products/product.html",          to: "legal/legal.html",               side: true },
      { from: "products/product.html",          to: "products/products.html",         side: true },
      { from: "products/product.html",          to: "work/work.html",                 side: true },
      { from: "products/products.html",         to: "about/about.html",               side: true },
      { from: "products/products.html",         to: "contact/contact.html",           side: true },
      { from: "products/products.html",         to: "hire/hire.html",                 side: true },
      { from: "products/products.html",         to: "legal/legal.html",               side: true },
      { from: "products/products.html",         to: "work/work.html",                 side: true },
      { from: "products/unreleased.html",       to: "about/about.html",               side: true },
      { from: "products/unreleased.html",       to: "contact/contact.html",           side: true },
      { from: "products/unreleased.html",       to: "hire/hire.html",                 side: true },
      { from: "products/unreleased.html",       to: "home/home.html",                 back: true },
      { from: "products/unreleased.html",       to: "legal/legal.html",               side: true },
      { from: "products/unreleased.html",       to: "products/products.html",         side: true },
      { from: "products/unreleased.html",       to: "work/work.html",                 side: true },
      { from: "states/404.html",                to: "about/about.html",               side: true },
      { from: "states/404.html",                to: "contact/contact.html",           side: true },
      { from: "states/404.html",                to: "hire/hire.html",                 side: true },
      { from: "states/404.html",                to: "legal/legal.html",               side: true },
      { from: "states/404.html",                to: "products/products.html",         side: true },
      { from: "states/404.html",                to: "work/work.html",                 side: true },
      { from: "work/case-study.html",           to: "about/about.html",               side: true },
      { from: "work/case-study.html",           to: "contact/contact.html",           side: true },
      { from: "work/case-study.html",           to: "home/home.html",                 back: true },
      { from: "work/case-study.html",           to: "legal/legal.html",               side: true },
      { from: "work/case-study.html",           to: "products/products.html",         side: true },
      { from: "work/case-study.html",           to: "work/work.html",                 side: true },
      { from: "work/work.html",                 to: "about/about.html",               side: true },
      { from: "work/work.html",                 to: "contact/contact.html",           side: true },
      { from: "work/work.html",                 to: "hire/hire.html",                 side: true },
      { from: "work/work.html",                 to: "legal/legal.html",               side: true },
      { from: "work/work.html",                 to: "products/products.html",         side: true },
    ],
  },

  updated: "2026-09-23",

  /* Gaps, stated rather than left to be noticed. */
  missing: [
    { what: "Mobile surface", why: "the site is responsive; the narrow screens are not drawn" },
    { what: "Support", why: "the live route exists and no screen describes it yet" },
  ],
  states: {
    loading: { drawn: null, note: "statically exported — there is no request to wait on" },
    error:   { drawn: null, note: "no form posts anywhere yet; 404 is the only failure" },
    offline: { drawn: null, note: "no service worker, so the browser's own page is what shows" },
    locked:  { drawn: null, note: "nothing on this site is gated" },
  },
};
