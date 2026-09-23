/* Dev chrome for the wireframes — everything around the screen, and nothing in
 * it. Identical in every product, so learning one set teaches you all of them.
 * ============================================================================
 * A screen declares one thing:
 *
 *     <body data-chrome data-file="game/board.html">
 *
 * Everything else — siblings, states, prev/next, notes — comes from routes.js.
 * Depth is derived from data-file, so no screen knows or cares how deep it sits.
 *
 * This file owns TWO things:
 *
 *   1. window.WF — the derived model of the set: the flat route list, the
 *      state-to-screen collapse, the journey rank, and the main path. Every
 *      page loads _chrome.js, so this is the one place that derivation can
 *      live. It used to live in three: _chrome.js flattened the flows for
 *      back/next, _gallery.js rebuilt the same maps to draw the chart, and
 *      screenshots.html flattened them a third time for the contact sheet —
 *      and the three disagreed about what a state was.
 *   2. The bar itself.
 *
 * One bar, the same on every page — a screen, the flow chart, the screenshots.
 * Left to right, and this order does not vary:
 *
 *   LEFT    ⌘ all routes · ▦ screenshots · ‹ back · › next
 *   MIDDLE  every screen in this flow, then this screen's states
 *   RIGHT   ☀/☾ · ▭/▢ · ⓘ notes
 *
 * Navigation on the left and settings on the right, so the two never trade
 * places between a screen and the chart and you stop hunting for the control
 * you just used.
 *
 * The controls that mean the same thing on every page are ICONS, not words.
 * They are lucide — the same set the screens and the Expo app already use, so
 * nothing here is a second icon library and no SVG is hand-copied into this
 * file. A word is kept only where the word IS the content: the screen names in
 * the middle, and the state names beside them.
 *
 * The breadcrumb is gone. `mobile · /game ›` repeated the surface toggle on the
 * right and the flow tint in the chart, and it sat between the nav chips and
 * the screen chips pushing them apart for no information.
 *
 * The frame CLAMPS to what is left under the bar; it is never scaled. 390x844
 * is the logical size, and a fixed 844px frame plus a bar is taller than a
 * laptop viewport — but `transform: scale()` does not change layout height, so
 * the page still scrolled 844px to reveal a frame already drawn smaller. The
 * height is capped in shared.css instead, and all this publishes is how much
 * room the bar took.                                                          */

(function () {
  var R = window.ROUTES;
  if (!R) return;

  /* ======================================================================
     1. THE DERIVED MODEL — window.WF
     ====================================================================== */

  /* ---- flatten the manifest into route order, states inline ------------ */
  var flat = [];
  var meta = {}, baseOf = {}, order = {}, n = 0;
  R.flows.forEach(function (f) {
    f.screens.forEach(function (s) {
      meta[s.file] = { flow: f.flow, name: s.screen, screen: s.screen, file: s.file, base: s };
      order[s.file] = n++;
      flat.push({ flow: f.flow, base: s, file: s.file, screen: s.screen, state: null });
      Object.keys(s.states || {}).forEach(function (st) {
        baseOf[s.states[st]] = s.file;
        flat.push({ flow: f.flow, base: s, file: s.states[st], screen: s.screen, state: st });
      });
    });
  });

  /* A state is a variant of a screen, not a second screen. Every state file
     collapses onto the screen it is a state OF, so the chart draws one box per
     screen and the contact sheet shows one tile per screen. The chrome bar's
     state switcher is where you go to see the variants — that is the one place
     they belong, because there you are already looking at the screen. */
  var base = function (f) { return baseOf[f] || f; };

  /* ---- the graph, collapsed onto base screens -------------------------- */
  var links = [], seenEdge = {};
  ((R.flow || {}).edges || []).forEach(function (e) {
    /* `state: true` is not navigation. You reach a state through the bar's
       state switcher, and nothing in the product taps its way there, so it is
       not an edge of the chart and not a link the checks may ask for.

       It has to be dropped HERE rather than at render time, or it still counts
       for depth. A state file usually collapses onto its own base and is caught
       by the self-loop guard below; one whose links point at OTHER screens does
       not, and those edges then rank as steps forward. With one state edge in a
       set that never showed; with forty it stretched the chart to 185,000px and
       put a cycle in the ranking. */
    if (e.state) return;
    var from = base(e.from), to = base(e.to);
    /* Collapsing can turn an edge into a self-loop (Board → Board · loading)
       or into a duplicate of one already declared; both are dropped. */
    if (from === to || !meta[from] || !meta[to]) return;
    var kind = e.back ? "back" : e.side ? "side" : "fwd";
    var key = from + ">" + to + ">" + kind;
    if (seenEdge[key]) return;
    seenEdge[key] = true;
    links.push({ from: from, to: to, label: e.label, back: !!e.back, side: !!e.side });
  });

  /* `side` is a shortcut or an upsell: real navigation, but not a step
     forward. Counted for depth it drags the shop past the score and stretches
     the spine, so it is excluded from both the ranking and the main path. */
  var forward = links.filter(function (e) { return !e.back && !e.side; });

  var START = R.flow ? base(R.flow.start) : (flat[0] || {}).file;
  var ends = ((R.flow || {}).end || []).map(base);

  /* The happy path: start to the first end node, following declared edges.
     Drawn heavier than everything else in the chart, and pinned to row 0 —
     the one thing a flow chart has to answer first is "what is the normal way
     through this product". */
  var mainPath = {}, mainNodes = {};
  (function () {
    if (!START) return;
    var next = {};
    forward.forEach(function (e) { (next[e.from] = next[e.from] || []).push(e); });
    var seen = {}, path = [];
    (function walk(node) {
      if (seen[node]) return false;
      seen[node] = true;
      if (ends.indexOf(node) !== -1) return true;
      var outs = next[node] || [];
      for (var k = 0; k < outs.length; k++) {
        path.push(outs[k]);
        if (walk(outs[k].to)) return true;
        path.pop();
      }
      return false;
    })(START);
    path.forEach(function (e) {
      mainPath[e.from + ">" + e.to] = true;
      mainNodes[e.from] = mainNodes[e.to] = true;
    });
  })();

  /* ---- rank = longest path from the start, so an edge always points right ---
     Longest path is only defined on a DAG, and the collapsed forward graph is
     one BY CONSTRUCTION: `state: true` edges are dropped above, `back` and
     `side` never enter `forward`, and a state collapsing onto its own base
     becomes a self-loop and is dropped. That is not an accident of the data —
     it is what those three flags are FOR.

     When it is violated anyway the failure is silent and enormous. Relaxation
     round a cycle never settles, so it runs until the pass budget is spent and
     every screen in the loop ends up ranked by that budget rather than by the
     journey: aakalan once put 34 screens at column 727, drew a chart 185,385px
     wide, and looked merely "broken" rather than "mis-declared".

     So the cycle is detected rather than waited out, and the rank falls back to
     BFS depth — defined on any graph, always terminating, and wrong only in
     that it shortens a few columns. The chart stays readable and the console
     says which screen to go and look at. */
  var col = {};
  if (START) col[START] = 0;
  var settled = false;
  for (var pass = 0; pass <= forward.length; pass++) {
    var moved = false;
    forward.forEach(function (e) {
      if (col[e.from] == null) return;
      var d = col[e.from] + 1;
      if (col[e.to] == null || col[e.to] < d) { col[e.to] = d; moved = true; }
    });
    if (!moved) { settled = true; break; }
  }
  if (!settled) {
    console.warn("[routes] the forward graph has a cycle — ranking by BFS depth " +
                 "instead. A step that loops back is a `side` or a `back`, or an " +
                 "edge through a state screen that wants `state: true`.");
    col = {};
    if (START) {
      var next = {};
      forward.forEach(function (e) { (next[e.from] = next[e.from] || []).push(e.to); });
      var queue = [START];
      col[START] = 0;
      while (queue.length) {
        var cur = queue.shift();
        (next[cur] || []).forEach(function (to) {
          if (col[to] != null) return;
          col[to] = col[cur] + 1;
          queue.push(to);
        });
      }
    }
  }
  var last = 0;
  Object.keys(col).forEach(function (k) { last = Math.max(last, col[k]); });
  Object.keys(meta).forEach(function (f) { if (col[f] == null) col[f] = last + 1; });

  /* ---- the journey: base screens, grouped by flow, in the order the
     product actually reaches them -----------------------------------------
     Flows keep their grouping — a contact sheet read by flow is how you find
     the screen you are looking for — but the FLOWS are ordered by when the
     journey first reaches one, and the screens inside a flow by rank. So the
     sheet opens on Splash, then Home, then the game, rather than on whichever
     flow happened to be declared first. Manifest order breaks every tie, so
     two screens of equal rank stay in the order they were written. */
  var byFlow = {}, flowRank = {};
  Object.keys(meta).forEach(function (f) {
    var m = meta[f];
    (byFlow[m.flow] = byFlow[m.flow] || []).push(f);
    if (flowRank[m.flow] == null || col[f] < flowRank[m.flow]) flowRank[m.flow] = col[f];
  });
  var flowOrder = Object.keys(byFlow).sort(function (a, b) {
    if (flowRank[a] !== flowRank[b]) return flowRank[a] - flowRank[b];
    return order[byFlow[a][0]] - order[byFlow[b][0]];
  });
  var journey = [];
  flowOrder.forEach(function (fl) {
    byFlow[fl].sort(function (a, b) {
      if (col[a] !== col[b]) return col[a] - col[b];
      return order[a] - order[b];
    });
    journey.push({ flow: fl, screens: byFlow[fl].map(function (f) { return meta[f]; }) });
  });

  window.WF = {
    routes: R,
    flat: flat,            // every file, states inline, manifest order
    meta: meta,            // base file -> { flow, name, file, base }
    base: base,            // any file -> the screen it is a state of
    order: order,          // base file -> manifest index
    links: links,          // edges collapsed onto base screens, deduped
    col: col,              // base file -> column / journey rank
    mainPath: mainPath,    // "from>to" -> on the happy path
    mainNodes: mainNodes,
    start: START,
    ends: ends,            // every end screen, collapsed onto base files
    flows: flowOrder,      // the flow names this set uses, in journey order
    journey: journey,      // [{ flow, screens: [meta] }] — flows and screens in journey order
  };

  /* ======================================================================
     2. THE BAR
     ====================================================================== */

  var root = document.querySelector("[data-chrome]");
  if (!root) return;

  /* ?bare renders the screen with no chrome at all — what the contact sheet
     embeds, and what you want when screenshotting a single screen. The theme
     still applies, because that is a token scope rather than chrome. */
  var bare = /[?&]bare\b/.test(location.search);
  /* Published on the root so the stylesheet can drop the gutter and the
     device rounding — inside a tile both are framing for a screen nobody
     is looking at directly. */
  if (bare) document.documentElement.setAttribute("data-bare", "");

  var file = root.dataset.file || "";
  var depth = file.split("/").length - 1;     // 0 at the surface root
  var up = depth ? "../".repeat(depth) : "";

  var i = flat.findIndex(function (r) { return r.file === file; });
  var me = i >= 0 ? flat[i] : null;
  if (file && !me) console.warn("[chrome] " + file + " is not in routes.js — it will appear nowhere.");

  var rel = function (target) { return up + target; };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function chip(cls, text, href, title) {
    var n = el(href ? "a" : "span", cls, text);
    if (href) n.href = href;
    if (title) n.title = title;
    return n;
  }

  /* An icon control. lucide is the estate's one icon set — the screens use it,
     and so does the Expo app through lucide-react-native — so the bar asks for
     an icon BY NAME rather than carrying a copy of its path data. If the CDN
     did not load, the placeholder is still in the DOM at the end of this file
     and falls back to its own label: an unlabelled blank square is worse than
     a word. The label is never dropped, only made invisible — it is what the
     tooltip and the screen reader read. */
  function icon(name, label) {
    var i = el("i", "chrome-ico");
    i.setAttribute("data-lucide", name);
    i.setAttribute("data-label", label);
    return i;
  }
  function iconChip(cls, name, label, href) {
    var n = chip(cls + " chrome-chip--icon", null, href, label);
    n.appendChild(icon(name, label));
    n.setAttribute("aria-label", label);
    if (!href) n.setAttribute("aria-disabled", "true");
    return n;
  }

  var bar = el("div", "chrome");
  var row = el("div", "chrome-row");
  bar.appendChild(row);

  var page = root.dataset.page || "";        // "index" | "screenshots" | screen
  var isScreen = !page;

  /* ---- LEFT: where you can go ------------------------------------------ */
  var left = el("div", "chrome-group");
  left.appendChild(iconChip("chrome-chip" + (page === "index" ? " is-current" : ""),
                            "workflow", "All routes — the flow chart",
                            page === "index" ? null : rel("index.html")));
  left.appendChild(iconChip("chrome-chip" + (page === "screenshots" ? " is-current" : ""),
                            "layout-grid", "Screenshots — every screen at once",
                            page === "screenshots" ? null : rel("screenshots.html")));
  if (isScreen) {
    /* back / next step through the set in route order and are shown struck
       out at the ends rather than dropped, so the bar does not reflow as you
       walk it. They name their destination in the tooltip — an arrow with no
       hint of where it lands is a control you have to click to understand. */
    left.appendChild(i > 0
      ? iconChip("chrome-chip", "chevron-left", "Back — " + flat[i - 1].screen, rel(flat[i - 1].file))
      : iconChip("chrome-chip is-absent", "chevron-left", "Back — this is the first screen"));
    left.appendChild(i >= 0 && i < flat.length - 1
      ? iconChip("chrome-chip", "chevron-right", "Next — " + flat[i + 1].screen, rel(flat[i + 1].file))
      : iconChip("chrome-chip is-absent", "chevron-right", "Next — this is the last screen"));
  }
  row.appendChild(left);

  /* ---- MIDDLE: where you are -------------------------------------------
     Words, not icons: these are the screen's own name and its states, and a
     name is exactly the thing an icon cannot stand in for. */
  if (isScreen && me) {
    var flow = R.flows.find(function (f) { return f.flow === me.flow; });
    /* The screen names go in their own group rather than straight onto the
       row. The row used to wrap, which is fine for a six-screen flow and
       unusable for a twenty-three-screen one: chitragupt's settings pushed the
       bar onto a second line on a full-width window, and a bar in two stacked
       rows reads as two bars. The group scrolls instead, so the row stays one
       line and the left and right controls never move. */
    var mid = el("div", "chrome-group chrome-mid");
    row.appendChild(mid);
    flow.screens.forEach(function (s) {
      mid.appendChild(chip("chrome-chip" + (s === me.base ? " is-current" : ""), s.screen, rel(s.file)));
    });

    var states = Object.keys(me.base.states || {});
    if (states.length) {
      var seg = el("div", "seg seg--states");
      seg.appendChild(chip("seg-chip" + (me.state === null ? " is-current" : ""), "default", rel(me.base.file)));
      ["empty", "loading", "error", "offline", "locked"].forEach(function (st) {
        if (!me.base.states[st]) return;
        seg.appendChild(chip("seg-chip" + (me.state === st ? " is-current" : ""), st, rel(me.base.states[st])));
      });
      mid.appendChild(seg);
    }
  }

  /* ---- RIGHT: how it is shown ------------------------------------------ */
  var right = el("div", "chrome-group chrome-right");
  row.appendChild(right);

  /* ---- theme: a token remap, never a second set of utilities -------------
     Remembered across screens, and applied into any iframe on the page so the
     screenshots sheet follows the toggle instead of showing whatever theme was
     live when each tile loaded. */
  var themes = R.themes || ["light"];
  var KEY = "wf-theme";
  var theme = themes[0];
  try { var saved = localStorage.getItem(KEY); if (themes.indexOf(saved) >= 0) theme = saved; } catch (e) {}

  function applyTheme(doc) {
    (doc || document).querySelectorAll(".phone").forEach(function (ph) {
      themes.forEach(function (t) { ph.classList.toggle("phone--" + t, t === theme && t !== "light"); });
    });
    (doc || document).documentElement.dataset.wfTheme = theme;
  }
  function applyAll() {
    applyTheme(null);
    document.querySelectorAll("iframe").forEach(function (fr) {
      try { if (fr.contentDocument) applyTheme(fr.contentDocument); } catch (e) {}
    });
  }

  /* Both halves are always rendered, even when the product draws only one. A
     control that appears on some pages and not others moves everything beside
     it; and a theme the app ships but nobody has drawn is a gap, which has to
     look like a gap rather than like "there is no dark here". */
  var THEME_ICON = { light: "sun", dark: "moon" };
  var tw = el("div", "seg");
  ["light", "dark"].forEach(function (t) {
    if (themes.indexOf(t) === -1) {
      var dead = el("span", "seg-chip seg-chip--icon is-absent");
      dead.title = "No " + t + " palette drawn for this set";
      dead.setAttribute("aria-label", dead.title);
      dead.appendChild(icon(THEME_ICON[t], t));
      tw.appendChild(dead);
      return;
    }
    var b = el("button", "seg-chip seg-chip--icon" + (t === theme ? " is-current" : ""));
    b.type = "button";
    b.dataset.theme = t;
    b.title = t[0].toUpperCase() + t.slice(1) + " theme";
    b.setAttribute("aria-label", b.title);
    b.appendChild(icon(THEME_ICON[t], t));
    b.addEventListener("click", function () {
      theme = t;
      try { localStorage.setItem(KEY, t); } catch (e) {}
      applyAll();
      [].forEach.call(tw.children, function (c) { c.classList.toggle("is-current", c.dataset.theme === t); });
    });
    tw.appendChild(b);
  });
  right.appendChild(tw);
  applyAll();
  /* Tiles load lazily, so re-apply as they arrive. */
  document.querySelectorAll("iframe").forEach(function (fr) {
    fr.addEventListener("load", function () { try { applyTheme(fr.contentDocument); } catch (e) {} });
  });

  /* ---- surface ---------------------------------------------------------- */
  var SURFACE_ICON = { mobile: "smartphone", web: "monitor" };
  var surfaces = R.surfaces || [R.surface];
  var sw = el("div", "seg");
  ["mobile", "web"].forEach(function (sname) {
    var label = sname === "web" ? "Website" : "Mobile";
    function dead(why) {
      var d = el("span", "seg-chip seg-chip--icon is-absent");
      d.title = why;
      d.setAttribute("aria-label", why);
      d.appendChild(icon(SURFACE_ICON[sname], label));
      sw.appendChild(d);
    }
    if (sname === R.surface) {
      var cur = el("span", "seg-chip seg-chip--icon is-current");
      cur.title = label;
      cur.setAttribute("aria-label", label);
      cur.appendChild(icon(SURFACE_ICON[sname], label));
      return void sw.appendChild(cur);
    }
    if (surfaces.indexOf(sname) === -1) return void dead("This product draws no " + sname + " surface");
    if (isScreen && root.dataset.twin === "none") return void dead("Not drawn for " + sname);
    var href = isScreen ? up + "../" + sname + "/" + file
                        : "../" + sname + "/" + (page === "screenshots" ? "screenshots.html" : "index.html");
    var a = chip("seg-chip seg-chip--icon", null, href, label);
    a.setAttribute("aria-label", label);
    a.appendChild(icon(SURFACE_ICON[sname], label));
    sw.appendChild(a);
  });
  right.appendChild(sw);

  /* ---- notes: the rationale, from the wiki ------------------------------
     It lives in .context/documents/wiki/surfaces/ and only there — decisions,
     constraints, anything true of THIS page that the pixels do not show.

     Far right, past the display controls: it is the only control in the bar
     that opens something over the screen instead of changing which screen you
     are looking at, so it sits apart from the ones that navigate. */
  if (isScreen && me) {
    var slug = me.base.notes;
    var btn = el("button", "chrome-chip chrome-chip--icon chrome-info" + (slug ? "" : " is-absent"));
    btn.type = "button";
    btn.title = slug ? "Why this screen is drawn this way" : "No wiki page for this screen yet";
    btn.setAttribute("aria-label", btn.title);
    btn.appendChild(icon("info", "notes"));
    right.appendChild(btn);

    if (slug) {
      var drawer = el("aside", "notes");
      drawer.hidden = true;
      var head = el("div", "notes-head");
      head.appendChild(el("p", "notes-title", me.screen + " — why it is drawn this way"));
      var close = el("button", "notes-close", "✕");
      close.type = "button";
      close.setAttribute("aria-label", "Close notes");
      head.appendChild(close);
      var body = el("div", "notes-body");
      drawer.appendChild(head);
      drawer.appendChild(body);
      document.body.appendChild(drawer);

      var wikiRel = up + "../../documents/wiki/surfaces/" + slug + ".md";
      var loaded = false;
      function setOpen(open) {
        drawer.hidden = !open;
        btn.classList.toggle("is-current", open);
        if (!open || loaded) return;
        loaded = true;
        /* file:// blocks fetch, so fall back to a link rather than an empty box. */
        fetch(wikiRel)
          .then(function (r) { if (!r.ok) throw 0; return r.text(); })
          .then(function (md) { body.innerHTML = render(md); })
          .catch(function () {
            body.innerHTML = '<p>Open <a href="' + wikiRel + '"><code>' +
              slug + '.md</code></a> — the drawer needs the set served over http, not file://.</p>';
          });
      }
      btn.addEventListener("click", function () { setOpen(drawer.hidden); });
      close.addEventListener("click", function () { setOpen(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !drawer.hidden) setOpen(false);
      });
    }
  }

  if (!bare) document.body.insertBefore(bar, document.body.firstChild);
  if (me) document.title = R.product + " — " + me.screen + (me.state ? " · " + me.state : "");

  /* ---- draw the icons ---------------------------------------------------
     Scoped to the bar, and run here rather than left to the screen's own
     lucide.createIcons(): index.html and screenshots.html have no screen and
     so no such call, and the bar has to look the same on all three. Any
     placeholder still standing afterwards means the CDN did not load — those
     become their own label, because a blank square tells you nothing. */
  if (window.lucide && lucide.createIcons) {
    try { lucide.createIcons({ nameAttr: "data-lucide" }); } catch (e) {}
  }
  bar.querySelectorAll("i[data-lucide]").forEach(function (ph) {
    ph.textContent = ph.getAttribute("data-label") || "?";
    ph.classList.add("chrome-ico--text");
  });

  /* ---- measure the chrome so the frame can fit under it ----------------
     The bar wraps to two rows on a narrow window, so its height is measured
     rather than assumed — a guessed constant is wrong exactly when the window
     is small, which is when fitting matters. The frame clamps itself in CSS;
     all this has to publish is how much room the bar took. */
  function measure() {
    var h = bare ? 0 : bar.offsetHeight;
    document.documentElement.style.setProperty("--chrome-h", h + "px");
    document.documentElement.style.setProperty("--stage-pad", bare ? "0px" : "32px");
    /* The frame's logical size is the manifest's, not the stylesheet's. CORE is
       copied byte for byte between products and declares 390x844, which is the
       phone and is wrong for a web surface — so `frame: { w, h }` in routes.js
       is published here, the same way --chrome-h is. The CORE :root values stay
       as the fallback, so a mobile set that declares 390x844 is unchanged and a
       page loaded without the bar still lays out. */
    if (R.frame && R.frame.w) {
      document.documentElement.style.setProperty("--frame-w", R.frame.w + "px");
      document.documentElement.style.setProperty("--frame-h", R.frame.h + "px");
    }
  }
  measure();
  window.addEventListener("resize", measure);
  if (window.ResizeObserver && !bare) new ResizeObserver(measure).observe(bar);

  /* Minimal markdown — headings, bold, code, links, lists, paragraphs. Enough
     for a wiki surface page; anything richer belongs in the wiki viewer. */
  function render(md) {
    var esc = function (t) { return t.replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); };
    md = md.replace(/^---\n[\s\S]*?\n---\n/, "");            // drop frontmatter
    var out = [], list = false, para = [];
    /* Markdown hard-wraps a paragraph across lines. Emitting one <p> per line
       turned every paragraph in the wiki into four, so the drawer read as a
       list of fragments. Lines buffer until something ends the paragraph. */
    function flush() {
      if (!para.length) return;
      out.push("<p>" + inline(para.join(" ")) + "</p>");
      para = [];
    }
    function endList() { if (list) { out.push("</ul>"); list = false; } }
    md.split("\n").forEach(function (line) {
      var h = line.match(/^(#{1,4})\s+(.*)$/);
      var li = line.match(/^[-*]\s+(.*)$/);
      if (li) { flush(); if (!list) { out.push("<ul>"); list = true; } out.push("<li>" + inline(li[1]) + "</li>"); return; }
      if (h) { flush(); endList(); out.push("<h" + (h[1].length + 2) + ">" + inline(h[2]) + "</h" + (h[1].length + 2) + ">"); return; }
      if (!line.trim()) { flush(); endList(); return; }
      /* A continuation line inside a list item belongs to that item, not to a
         new paragraph. */
      if (list) { out[out.length - 1] = out[out.length - 1].replace("</li>", " " + inline(line.trim()) + "</li>"); return; }
      para.push(line.trim());
    });
    flush();
    endList();
    function inline(t) {
      return esc(t)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
        .replace(/\[\[([^\]]+)\]\]/g, "<i>$1</i>")
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    }
    return out.join("\n");
  }
})();
