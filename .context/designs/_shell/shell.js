/* The shell — Babul's frame in View mode, around every page of a set.
 * ============================================================================
 *     bar        logo · product / size                               theme
 *     rail       Journey · Pages · Components · Styles
 *     list       pages by group, components by group, or style groups
 *     canvas     the page itself, untouched — or a view's drawing
 *     island     ‹ name › · states · sizes                         (pages)
 *
 * A page declares what it is on <body> and nothing else:
 *     data-page="game/play"                        a page, every state in it
 *     data-component="go-button"                   a component
 *     data-section="colors"                         a styles page
 *
 * The same files open three ways and look alike in each: from disk with this
 * shell, in Babul, or alone with ?bare, which the journey's thumbnails use. So
 * the shell only ever adds the frame around a page, never anything in it. Its
 * colours are --chrome-* only, never a product token.                        */
(function () {
  var S = window.BABUL_SHELL, M, product = (window.BABUL || {}).product || {};
  if (!S) return;
  var bare = S.bare;
  if (bare) document.documentElement.setAttribute("data-bare", "");

  var frame = product.frames && product.frames[S.size];
  if (frame) {
    document.documentElement.style.setProperty("--frame-w", frame.w + "px");
    document.documentElement.style.setProperty("--frame-h", frame.h + "px");
  }

  if (bare) S.expanded.then(drawIcons);
  else Promise.all([S.ready, S.expanded]).then(function () {
    M = window.BABUL_MODEL;
    build();
    document.documentElement.style.visibility = "";
  });

  /* An absolute address inside this size, so a link means the same thing from
     any folder depth. */
  var at = function (path) { return S.root + S.size + "/" + path; };
  S.at = at;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(cls, href, text) {
    var n = el(href ? "a" : "span", cls, text);
    if (href) n.href = href;
    return n;
  }
  /* lucide by name — the set the screens and the apps already use. A missing
     CDN leaves the label in place of the icon rather than a blank square. */
  function icon(name, label) {
    var i = el("i", "shell-ico");
    i.setAttribute("data-lucide", name);
    i.setAttribute("data-label", label || name);
    return i;
  }
  function iconLink(cls, name, label, href) {
    var n = link(cls + (href ? "" : " is-off"), href);
    n.title = label;
    n.setAttribute("aria-label", label);
    n.appendChild(icon(name, label));
    return n;
  }
  function drawIcons() {
    if (window.lucide && lucide.createIcons) {
      try { lucide.createIcons({ nameAttr: "data-lucide" }); } catch (e) {}
    }
    document.querySelectorAll(".shell-ico[data-lucide]").forEach(function (ph) {
      if (ph.tagName !== "I") return;
      ph.textContent = ph.getAttribute("data-label");
      ph.classList.add("shell-ico--text");
    });
  }
  S.el = el; S.icon = icon;

  /* ---- what this page is ---------------------------------------------------- */
  var body, section, me, component;
  function readPage() {
    body = document.body.dataset;
    if (body.page) {
      me = M.meta[body.page];
      if (!me) console.warn("[shell] " + body.page + " is reached from no other page — it will appear nowhere.");
      section = "pages";
    } else if (body.component) {
      component = M.components.filter(function (c) { return c.id === body.component; })[0];
      if (!component) console.warn("[shell] " + body.component + " is used by no page.");
      section = "components";
    } else {
      section = S.view;
    }
  }

  var STYLE_SECTIONS = [
    ["icons", "Icons", "shapes"],
    ["colors", "Colors", "palette"],
    ["typography", "Typography", "type"],
    ["spacing", "Spacing", "move-horizontal"],
    ["radius", "Radius", "square"],
    ["shadows", "Shadows", "layers"],
  ];

  function build() {
    readPage();
    var canvas = el("main", "shell-canvas");
    while (document.body.firstChild) canvas.appendChild(document.body.firstChild);
    document.body.classList.add("shell");
    document.body.appendChild(bar());
    document.body.appendChild(rail());
    var list = section === "pages" ? pageList() : section === "components" ? componentList() : section === "styles" ? styleList() : null;
    if (list) document.body.appendChild(list);
    document.body.appendChild(canvas);
    S.canvas = canvas;
    if (me) {
      document.body.appendChild(island());
      document.title = M.product.name + " — " + me.name + (S.state !== M.DEFAULT_STATE ? " · " + S.state : "");
    } else if (component) {
      document.title = M.product.name + " — " + component.name;
    }
    if (S.onBuild) S.onBuild();
    drawIcons();
    measure();
    window.addEventListener("resize", measure);
  }

  /* ---- bar ------------------------------------------------------------------- */
  function bar() {
    var b = el("header", "shell-bar");
    var logo = (M.assets.logos || [])[0];
    if (logo) {
      var img = el("img", "shell-logo");
      img.alt = "";
      img.src = S.root + logo.file;
      b.appendChild(img);
    }
    b.appendChild(el("span", "shell-product", M.product.name));
    b.appendChild(el("span", "shell-sep", "/"));
    b.appendChild(el("span", "shell-surface", S.size));
    b.appendChild(el("span", "shell-spacer"));

    var themes = M.product.themes || ["light"];
    if (themes.length > 1) {
      var ICON = { light: "sun", dark: "moon" };
      var seg = el("div", "shell-seg");
      themes.forEach(function (t) {
        var btn = el("button", "shell-seg-btn" + (t === document.documentElement.dataset.theme ? " is-on" : ""));
        btn.type = "button";
        btn.dataset.theme = t;
        btn.title = t[0].toUpperCase() + t.slice(1) + " theme";
        btn.setAttribute("aria-label", btn.title);
        btn.appendChild(icon(ICON[t] || "palette", t));
        btn.addEventListener("click", function () { setTheme(t, seg); });
        seg.appendChild(btn);
      });
      b.appendChild(seg);
    }
    return b;
  }
  /* The thumbnails are frames of their own; each reads the theme from storage
     as it loads, so changing it reloads them rather than reaching inside. */
  function setTheme(t, seg) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem("babul-theme", t); } catch (e) {}
    [].forEach.call(seg.children, function (c) { c.classList.toggle("is-on", c.dataset.theme === t); });
    document.querySelectorAll("iframe").forEach(function (fr) {
      try { fr.contentDocument.documentElement.dataset.theme = t; } catch (e) { fr.src = fr.src; }
    });
  }

  /* ---- rail ------------------------------------------------------------------ */
  function rail() {
    var r = el("nav", "shell-rail");
    var firstPage = M.groups.length ? M.groups[0].pages[0].file : null;
    var firstComponent = M.components.length ? "components/" + M.components[0].id + ".html" : null;
    [
      ["journey", "workflow", "Journey", "index.html"],
      ["pages", "file", "Pages", firstPage],
      ["components", "component", "Components", firstComponent],
      ["styles", "palette", "Styles", "styles/icons.html"],
    ].forEach(function (item) {
      var on = item[0] === section;
      var a = link("shell-rail-item" + (on ? " is-on" : "") + (item[3] ? "" : " is-off"), item[3] && !on ? at(item[3]) : null);
      a.title = item[3] ? item[2] : "No " + item[2].toLowerCase() + " in this set";
      a.appendChild(icon(item[1], item[2]));
      a.appendChild(el("span", "shell-rail-label", item[2]));
      r.appendChild(a);
    });
    return r;
  }

  /* ---- lists ----------------------------------------------------------------- */
  function listShell() { return el("aside", "shell-list"); }
  function listHead(list, name, count) {
    var h = el("div", "shell-list-head", name);
    h.appendChild(el("span", "shell-count", String(count)));
    list.appendChild(h);
  }
  function listItem(list, iconName, name, href, on) {
    var a = link("shell-list-item" + (on ? " is-on" : ""), href);
    a.appendChild(icon(iconName, name));
    a.appendChild(el("span", null, name));
    list.appendChild(a);
    return a;
  }
  function pageList() {
    var list = listShell();
    M.groups.forEach(function (g) {
      listHead(list, g.name, g.pages.length);
      g.pages.forEach(function (p) { listItem(list, "file", p.name, at(p.file), p === me); });
    });
    return list;
  }
  function componentList() {
    var list = listShell(), byGroup = {}, names = [];
    M.components.forEach(function (c) {
      if (!byGroup[c.group]) { byGroup[c.group] = []; names.push(c.group); }
      byGroup[c.group].push(c);
    });
    names.forEach(function (g) {
      listHead(list, g, byGroup[g].length);
      byGroup[g].forEach(function (c) { listItem(list, "component", c.name, at("components/" + c.id + ".html"), c === component); });
    });
    return list;
  }
  function styleList() {
    var list = listShell();
    var counts = S.styleCounts ? S.styleCounts() : {};
    STYLE_SECTIONS.forEach(function (s) {
      var a = listItem(list, s[2], s[1], at("styles/" + s[0] + ".html"), s[0] === body.section);
      if (counts[s[0]] != null) a.appendChild(el("span", "shell-count shell-count--end", String(counts[s[0]])));
    });
    return list;
  }

  /* ---- island: the page's controls, floating over the canvas ------------------ */
  function island() {
    var b = el("div", "shell-island");
    var walk = [].concat.apply([], M.groups.map(function (g) { return g.pages; }));
    var i = walk.indexOf(me);
    var prev = i > 0 ? walk[i - 1] : null, next = i >= 0 && i < walk.length - 1 ? walk[i + 1] : null;
    b.appendChild(iconLink("shell-icon", "chevron-left", prev ? "Back — " + prev.name : "First page", prev && at(prev.file)));
    b.appendChild(el("span", "shell-island-name", me.name));
    b.appendChild(iconLink("shell-icon", "chevron-right", next ? "Next — " + next.name : "Last page", next && at(next.file)));

    if (me.states.length > 1) {
      b.appendChild(el("span", "shell-divider"));
      var current = S.state;
      me.states.forEach(function (s) {
        var on = s.name === current;
        b.appendChild(link("shell-state" + (on ? " is-on" : ""), on ? null : at(s.file), s.name));
      });
    }

    /* A product drawn for more than one size switches between them here, the
       way Babul's size buttons switch between a page's designs. */
    var sizes = M.product.sizes || [S.size];
    if (sizes.length > 1 && !product.perSize) {
      var SIZE_ICON = { mobile: "smartphone", tablet: "tablet", web: "monitor" };
      b.appendChild(el("span", "shell-divider"));
      sizes.forEach(function (s) {
        var on = s === S.size;
        var a = iconLink("shell-icon" + (on ? " is-on" : ""), SIZE_ICON[s] || "square", on ? s : "Open on " + s,
                         on ? null : S.root + s + "/" + me.id + ".html" + (S.state !== M.DEFAULT_STATE ? "?state=" + S.state : ""));
        if (on) a.classList.remove("is-off");
        b.appendChild(a);
      });
    }
    return b;
  }

  /* The frame clamps to the canvas in CSS; this publishes how much of the
     window the bar and the island take, measured, since the bar can wrap. */
  function measure() {
    var barH = document.querySelector(".shell-bar").offsetHeight;
    document.documentElement.style.setProperty("--chrome-h", (barH + (me ? 64 : 0)) + "px");
    document.documentElement.style.setProperty("--stage-pad", "32px");
  }
})();
