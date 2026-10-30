/* Expands component instances (<c-go-button variant="got">) from their
 * definitions in <size>/components/<id>.js, and keeps only the page's blocks for
 * ?state= (default "data"). Runs once before the shell draws, so a page reads
 * the same in the shell, under ?bare, and to anything reading the drawn page.
 * The template syntax is the design-sets standard, §7.                       */
(function () {
  var S = window.BABUL_SHELL;
  if (!S) return;
  var PASS = /^(class|href|title|style|id|target|aria-.*|data-.*)$/;
  var defs = {}, loading = {};
  S.defSource = {};

  S.define = function (id, html) {
    var t = document.createElement("template");
    t.innerHTML = html;
    defs[id] = [].filter.call(t.content.children, function (c) { return c.localName === "template"; });
    S.defSource[id] = 'BABUL_SHELL.define("' + id + '", `' + html + "`);";
  };

  /* Each definition is a script beside the board, loaded when something uses it. */
  var usedIn = function (root) {
    var ids = [];
    [].forEach.call(root.querySelectorAll("*"), function (n) {
      if (n.localName.indexOf("c-") === 0 && ids.indexOf(n.localName.slice(2)) < 0) ids.push(n.localName.slice(2));
    });
    return ids;
  };
  S.loadDefs = function (ids) {
    return Promise.all(ids.map(function (id) {
      if (!loading[id]) loading[id] = new Promise(function (done) {
        var tag = document.createElement("script");
        tag.src = S.root + S.size + "/components/" + id + ".js";
        tag.onload = function () {
          var nested = [];
          (defs[id] || []).forEach(function (t) { nested = nested.concat(usedIn(t.content)); });
          S.loadDefs(nested).then(done);
        };
        tag.onerror = function () { console.warn("[expand] no definition for <c-" + id + ">"); done(); };
        document.head.appendChild(tag);
      });
      return loading[id];
    }));
  };

  /* ---- props --------------------------------------------------------------- */
  function propsOf(node, id) {
    var props = { state: "default" };
    [].forEach.call(node.attributes, function (a) {
      if (!PASS.test(a.name) && a.name !== "slot") props[a.name] = a.value;
    });
    return props;
  }
  /* "name" is set and not "false"; "name=value" equals; "!" negates either. */
  function holds(props, test) {
    var neg = test.charAt(0) === "!";
    var t = neg ? test.slice(1) : test, eq = t.indexOf("=");
    var v = props[eq < 0 ? t : t.slice(0, eq)];
    var ok = eq < 0 ? v != null && v !== "false" : v === t.slice(eq + 1);
    return neg ? !ok : ok;
  }
  function fill(text, props) {
    // {name}, {name|default}, {test?then:else}
    return text.replace(/\{(!?[a-z][a-z0-9-]*(?:=[^?|}]*)?)(?:\|([^}]*)|\?([^:}]*)(?::([^}]*))?)?\}/g, function (_, test, fallback, then, other) {
      if (then == null) return props[test] != null ? props[test] : fallback || "";
      return holds(props, test) ? then : other || "";
    });
  }

  function pick(id, props) {
    var best = null, score = -1;
    (defs[id] || []).forEach(function (t) {
      var attrs = [].slice.call(t.attributes);
      if (!attrs.every(function (a) { return props[a.name] === a.value; })) return;
      if (attrs.length > score) { best = t; score = attrs.length; }
    });
    return best;
  }

  /* ---- one instance -------------------------------------------------------- */
  function expand(node) {
    var id = node.localName.slice(2), props = propsOf(node, id), t = pick(id, props);
    if (!t) {
      console.warn("[expand] no template for <" + node.localName + ">", props);
      node.replaceWith.apply(node, [].slice.call(node.childNodes));
      return;
    }
    var out = t.content.cloneNode(true);

    [].slice.call(out.querySelectorAll("[data-if]")).forEach(function (n) {
      if (!holds(props, n.getAttribute("data-if"))) n.remove();
      else n.removeAttribute("data-if");
    });
    var walker = document.createTreeWalker(out, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === 3) n.nodeValue = fill(n.nodeValue, props);
      else [].forEach.call(n.attributes, function (a) { a.value = fill(a.value, props); });
    }
    [].slice.call(out.querySelectorAll("[class]")).forEach(function (n) {
      n.setAttribute("class", n.getAttribute("class").replace(/\s+/g, " ").trim());
    });

    [].slice.call(out.querySelectorAll("slot")).forEach(function (slot) {
      var name = slot.getAttribute("name");
      var given = [].filter.call(node.childNodes, function (c) {
        var to = c.nodeType === 1 ? c.getAttribute("slot") : null;
        return name ? to === name : !to;
      });
      var real = given.some(function (c) { return c.nodeType === 1 || c.nodeValue.trim(); });
      if (!real) return slot.replaceWith.apply(slot, [].slice.call(slot.childNodes));
      given.forEach(function (c) { if (c.nodeType === 1) c.removeAttribute("slot"); });
      slot.replaceWith.apply(slot, given);
    });

    var root = out.firstElementChild;
    if (root) {
      [].forEach.call(node.attributes, function (a) {
        if (!PASS.test(a.name)) return;
        if (a.name === "class") a.value.split(/\s+/).filter(Boolean).forEach(function (c) { root.classList.add(c); });
        else root.setAttribute(a.name, a.value);
      });
      root.setAttribute("data-instance", id);
      root.instanceProps = props;
    }
    node.replaceWith(out);
  }

  function nextInstance(scope) {
    var all = scope.getElementsByTagName("*");
    for (var i = 0; i < all.length; i++) if (all[i].localName.indexOf("c-") === 0) return all[i];
    return null;
  }
  S.expand = function (scope) {
    for (var n = nextInstance(scope); n; n = nextInstance(scope)) expand(n);
  };

  /* ---- page states ---------------------------------------------------------- */
  S.state = (/[?&]state=([^&#]+)/.exec(location.search) || [])[1] || "data";
  S.keepState = function (scope, state) {
    [].slice.call(scope.querySelectorAll("[data-state]")).forEach(function (n) {
      if (n.getAttribute("data-state").split(/\s+/).indexOf(state) < 0) n.remove();
    });
  };

  // Hidden until drawn, so an instance never shows as its bare text.
  document.documentElement.style.visibility = "hidden";
  S.expanded = new Promise(function (done) {
    document.addEventListener("DOMContentLoaded", function () {
      S.loadDefs(usedIn(document.body)).then(function () {
        if (document.body.dataset.page) S.keepState(document.body, S.state);
        S.expand(document.body);
        if (S.bare) document.documentElement.style.visibility = "";
        done();
      });
    });
  });
})();
