/* The set described from its own HTML: pages, links, journeys, components and
 * icons. No data file holds them; this reads the drawing every time.
 *
 * The same code runs in two places. In the browser, crawl.js feeds it each
 * page and board as a hidden frame describes itself (a page opened from disk
 * cannot read another file, but a frame can post its own markup). In Node,
 * scan.mjs feeds it the files on disk for canon check, and fails on any file
 * the crawl cannot reach — so the browser never misses one.
 *
 * What a drawing cannot show is written on it: design-sets §2.             */
(function (G) {
  /* ---- markup as a plain tree: { tag, attrs, children } or { text } -------- */
  // shortcut: a regex tokenizer for Node — no ">" inside attribute values.
  var VOID = { area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1, link: 1, meta: 1, source: 1, track: 1, wbr: 1 };
  var ENTITY = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
  function decode(s) {
    return s.replace(/&(#x?[0-9a-f]+|\w+);/gi, function (m, e) {
      if (e[0] === "#") return String.fromCodePoint(e[1] === "x" ? parseInt(e.slice(2), 16) : +e.slice(1));
      return ENTITY[e] != null ? ENTITY[e] : m;
    });
  }
  function parse(html) {
    var root = { tag: "#root", attrs: {}, children: [] }, stack = [root];
    var re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>|([^<]+)|</g, m;
    while ((m = re.exec(html))) {
      var top = stack[stack.length - 1];
      if (m[5] !== undefined) { top.children.push({ text: decode(m[5]) }); continue; }
      if (!m[2]) continue;
      var tag = m[2].toLowerCase();
      if (m[1]) {
        var at = stack.map(function (n) { return n.tag; }).lastIndexOf(tag);
        if (at > 0) stack.length = at;
        continue;
      }
      var attrs = {}, a, are = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      while ((a = are.exec(m[3]))) attrs[a[1].toLowerCase()] = decode(a[2] != null ? a[2] : a[3] != null ? a[3] : a[4] != null ? a[4] : "");
      var node = { tag: tag, attrs: attrs, children: [] };
      top.children.push(node);
      if (!VOID[tag] && !m[4]) stack.push(node);
    }
    return root;
  }
  function fromDom(node) {
    if (node.nodeType === 3) return { text: node.nodeValue };
    if (node.nodeType !== 1 && node.nodeType !== 9) return null;
    var out = { tag: node.nodeType === 1 ? node.localName : "#root", attrs: {}, children: [] };
    [].forEach.call(node.attributes || [], function (a) { out.attrs[a.name] = a.value; });
    [].forEach.call(node.localName === "template" ? node.content.childNodes : node.childNodes, function (c) {
      var t = fromDom(c);
      if (t) out.children.push(t);
    });
    return out;
  }
  function elements(node, up, out) {
    up = up || []; out = out || [];
    (node.children || []).forEach(function (c) {
      if (!c.tag) return;
      out.push([c, up]);
      elements(c, up.concat([c]), out);
    });
    return out;
  }
  function find(node, tag) { var hit = elements(node).filter(function (e) { return e[0].tag === tag; })[0]; return hit ? hit[0] : null; }
  function textOf(node) {
    return (node.text != null ? node.text : (node.children || []).map(textOf).join(" ")).replace(/\s+/g, " ").trim();
  }

  /* ---- paths: a page is "game/play", a board "components/go-button" -------- */
  function normalize(path) {
    var out = [];
    path.split("/").forEach(function (p) {
      if (p === "..") { if (out.length && out[out.length - 1] !== "..") out.pop(); else out.push(".."); }
      else if (p && p !== ".") out.push(p);
    });
    return out.join("/");
  }
  var dir = function (id) { return id.split("/").slice(0, -1).join("/"); };
  function resolve(from, href) {
    if (/^(https?:|#|mailto:|tel:|sms:|\{)/.test(href)) return null;
    var path = normalize((dir(from) ? dir(from) + "/" : "") + href.split(/[?#]/)[0]);
    if (!/\.html$/.test(path) || /^\.\./.test(path) || path === "index.html" || /^styles\//.test(path)) return null;
    var state = (/[?&]state=([^&#]+)/.exec(href) || [])[1];
    return { id: path.slice(0, -5), board: /^components\//.test(path), state: state && state !== "data" ? state : null };
  }

  /* ---- the template language a definition is written in (expand.js) ------------ */
  // {name}, {name|default}, {test?then:else}; a test is name, name=value, either after !.
  var HOLE = /\{(!?)([a-z][\w-]*)(?:=([^?|}]*))?(?:\|([^}]*)|\?([^:}]*)(?::([^}]*))?)?\}/g;
  var PASS = /^(class|href|title|style|id|target|aria-.*|data-.*|slot)$/;
  var titleCase = function (n) { return n[0].toUpperCase() + n.slice(1).replace(/-/g, " "); };
  var pascal = function (id) { return id.replace(/(^|-)(\w)/g, function (_, __, c) { return c.toUpperCase(); }); };
  function holes(value) { var out = [], h; HOLE.lastIndex = 0; while ((h = HOLE.exec(value))) out.push(h); return out; }
  var DEFINE = /^\s*BABUL_SHELL\.define\("([\w-]+)", `([\s\S]*)`\);\s*$/;

  /* What a page, board or definition points at, so the crawl can follow it. */
  function refs(from, tree) {
    var pages = [], components = [];
    elements(tree).forEach(function (e) {
      var n = e[0];
      if (n.tag.indexOf("c-") === 0) components.push(n.tag.slice(2));
      Object.keys(n.attrs).forEach(function (k) {
        var t = /\.html([?#]|$)/.test(n.attrs[k]) && resolve(from, n.attrs[k]);
        if (t) (t.board ? components : pages).push(t.board ? t.id.slice(11) : t.id);
      });
    });
    return { pages: pages, components: components };
  }

  /* ---- the collector: fed files as they arrive, then asked for the model ---- */
  /* A size's start page: one for every size, or one per size when the sizes draw different pages. */
  function startOf(product, size) { return typeof product.start === "object" ? (product.start || {})[size] : product.start; }

  function Collector(product, tokens, lucideVersion, size) {
    var pages = {}, boards = {}, defs = {}, errors = [];
    var fail = function (m) { errors.push(m); };
    return {
      errors: errors,
      pages: pages, boards: boards, defs: defs,
      addPage: function (id, tree) { pages[id] = tree; return refs(id, tree); },
      addBoard: function (id, tree) { boards[id] = tree; return refs("components/" + id, tree); },
      addDef: function (id, source) {
        var m = DEFINE.exec(source);
        if (!m || m[1] !== id) { fail("components/" + id + '.js is not BABUL_SHELL.define("' + id + '", `…`);'); return { pages: [], components: [] }; }
        defs[id] = { source: m[2], tree: parse(m[2]) };
        return refs("components/" + id, defs[id].tree);
      },
      finish: function () { return model(product, tokens, lucideVersion, startOf(product, size), pages, boards, defs, fail, errors); },
    };
  }

  function model(product, tokens, lucideVersion, start, trees, boards, defs, fail, errors) {
    /* ---- components: how each definition uses its props, and its board ---- */
    function readProps(id) {
      var d = defs[id], seen = {}, order = [];
      function use(name) {
        if (name === "state") return null;
        if (!seen[name]) { seen[name] = { variant: [], truthy: false, value: false, icon: false, nested: [], token: null, tested: false }; order.push(name); }
        return seen[name];
      }
      var addVariant = function (p, v) { if (p.variant.indexOf(v) < 0) p.variant.push(v); };
      elements(d.tree).forEach(function (e) {
        var n = e[0];
        if (n.tag === "template") Object.keys(n.attrs).forEach(function (k) { var p = use(k); if (p) addVariant(p, n.attrs[k]); });
        if (n.attrs["data-if"]) {
          var t = /^!?([a-z][\w-]*)(?:=(.*))?$/.exec(n.attrs["data-if"]), p = t && use(t[1]);
          if (p) { if (t[2] !== undefined) { addVariant(p, t[2]); p.tested = true; } else p.truthy = true; }
        }
        Object.keys(n.attrs).forEach(function (attr) {
          var value = n.attrs[attr];
          holes(value).forEach(function (h) {
            var p = use(h[2]);
            if (!p) return;
            if (h[3] !== undefined) { p.tested = true; return addVariant(p, h[3]); }
            if (h[5] !== undefined) { p.truthy = true; return; }
            p.value = true;
            if (h[4] !== undefined) p.default = h[4];
            if (attr === "data-lucide") p.icon = true;
            if (n.tag.indexOf("c-") === 0 && value === h[0]) p.nested.push([n.tag.slice(2), attr]);
            // Part of a class name (bg-industry-{industry}): one of the colours that exist.
            var cls = (attr === "class" || attr === "tint") && new RegExp("[a-z]+-([a-z0-9-]+)-\\{" + h[2] + "[}|]").exec(value);
            if (cls) p.token = cls[1];
          });
        });
      });
      holes(d.source.replace(/<[^>]*>/g, " ")).forEach(function (h) {
        var p = use(h[2]);
        if (p && h[3] === undefined && h[5] === undefined) p.value = true;
      });
      var slots = [];
      elements(d.tree).forEach(function (e) {
        var s = e[0].tag === "slot" && (e[0].attrs.name || "content");
        if (s && slots.indexOf(s) < 0) slots.push(s);
      });
      return { seen: seen, order: order, slots: slots };
    }
    var ids = Object.keys(defs).sort(), raw = {}, components = {};
    ids.forEach(function (id) { raw[id] = readProps(id); });
    var kindOf = function (id, name) { var c = components[id], p = c && c.props[name]; return p && p.kind; };
    for (var pass = 0; pass < 3; pass++) {
      ids.forEach(function (id) {
        var props = {};
        raw[id].order.forEach(function (name) {
          var p = raw[id].seen[name];
          var kind = p.variant.length || p.token ? "variant" : p.icon ? "instance" : p.value ? "text" : "boolean";
          p.nested.forEach(function (x) { if (kind === "text" && kindOf(x[0], x[1]) === "instance") kind = "instance"; });
          props[name] = { name: name, kind: kind, used: p.variant, default: p.default, token: p.token, optional: p.truthy, tested: p.tested };
        });
        components[id] = { id: id, props: props, order: raw[id].order, slots: raw[id].slots };
      });
    }
    ids.forEach(function (id) {
      var c = components[id], board = boards[id];
      if (!board) { fail("components/" + id + ".js has no board, components/" + id + ".html"); c.states = [{ name: "default", status: "made" }]; return; }
      var body = find(board, "body") || { attrs: {} };
      var cells = elements(body).filter(function (e) { return e[0].tag === "c-" + id; }).map(function (e) { return e[0].attrs; });
      if (!cells.length) fail("components/" + id + ".html draws no <c-" + id + ">");
      c.order.forEach(function (name) {
        var p = c.props[name];
        if (p.kind !== "variant") return;
        if (p.token) {
          var group = p.token.split("-").reduce(function (node, k) { return node && node[k]; }, tokens.color);
          p.options = Object.keys(group || {}).filter(function (k) { return k[0] !== "$"; });
          if (!p.options.length) fail("components/" + id + ".js builds a class from " + name + ", and color." + p.token + " has no colours");
          // A prop the definition tests for (data-if) is optional: no default, or it is never absent.
          p.default = p.optional ? undefined : p.options[0];
          return;
        }
        p.options = [];
        cells.forEach(function (cell) {
          if (cell[name] === undefined) fail("components/" + id + ".html: a <c-" + id + "> without " + name + " — the board spells out every variant");
          else if (p.options.indexOf(cell[name]) < 0) p.options.push(cell[name]);
        });
        p.used.forEach(function (v) { if (p.options.indexOf(v) < 0) fail("components/" + id + ".js uses " + name + '="' + v + '", which its board never draws'); });
        p.default = p.options[0];
      });
      var made = ["default"];
      cells.forEach(function (cell) { if (cell.state && made.indexOf(cell.state) < 0) made.push(cell.state); });
      var notNeeded = (body.attrs["data-not-needed"] || "").split(/\s+/).filter(Boolean);
      c.states = made.map(function (s) { return { name: s, status: "made" }; })
        .concat(notNeeded.map(function (s) { return { name: s, status: "not needed" }; }));
      c.group = body.attrs["data-group"];
      c.source = body.attrs["data-source"];
      var meta = elements(board).filter(function (e) { return e[0].tag === "meta" && e[0].attrs.name === "description"; })[0];
      c.note = meta && meta[0].attrs.content;
      if (!c.group) fail("components/" + id + ".html: <body> has no data-group");
    });

    function checkInstances(where, tree) {
      elements(tree).forEach(function (e) {
        var n = e[0];
        if (n.tag.indexOf("c-") !== 0) return;
        var c = components[n.tag.slice(2)];
        if (!c) return fail(where + ": <" + n.tag + "> — no such component");
        // A test like {variant=plain?…} cannot see a default, so the instance names the variant.
        c.order.forEach(function (name) {
          var p = c.props[name];
          if (p.kind === "variant" && p.tested && !p.optional && n.attrs[name] == null) fail(where + ": <" + n.tag + "> sets no " + name + " — its definition tests it, so name it");
        });
        Object.keys(n.attrs).forEach(function (name) {
          var value = n.attrs[name];
          if (PASS.test(name) || value.indexOf("{") >= 0) return;
          if (name === "state") {
            if (!c.states.some(function (s) { return s.name === value; })) fail(where + ": <" + n.tag + ' state="' + value + '"> — not a state its board draws');
            return;
          }
          var p = c.props[name];
          if (!p) fail(where + ": <" + n.tag + " " + name + "> — not a property of " + c.id);
          else if (p.kind === "variant" && p.options.indexOf(value) < 0) fail(where + ": <" + n.tag + " " + name + '="' + value + '"> — not one its board draws (' + p.options.join(", ") + ")");
        });
      });
    }

    /* ---- pages ---------------------------------------------------------------- */
    var pageIds = Object.keys(trees).sort(), pages = {};
    var bodyOf = function (id) { return find(trees[id], "body") || { attrs: {}, children: [] }; };
    var isModal = function (id) {
      return !!trees[id] && elements(trees[id]).some(function (e) { return (e[0].attrs.class || "").split(/\s+/).indexOf("phone--modal") >= 0; });
    };
    pageIds.forEach(function (id) {
      var tree = trees[id], body = bodyOf(id), titleNode = find(tree, "title");
      var title = titleNode ? textOf(titleNode) : id;
      if (body.attrs["data-page"] !== id) fail(id + '.html: <body data-page="' + id + '"> is missing');
      var states = [];
      elements(body).forEach(function (e) {
        (e[0].attrs["data-state"] || "").split(/\s+/).forEach(function (s) { if (s && s !== "data" && states.indexOf(s) < 0) states.push(s); });
      });
      var notes = {};
      elements(find(tree, "head") || tree).forEach(function (e) {
        var n = e[0];
        if (n.tag === "meta" && n.attrs.name === "description") notes[n.attrs["data-state"] || "data"] = n.attrs.content;
      });
      Object.keys(notes).forEach(function (s) { if (s !== "data" && states.indexOf(s) < 0) fail(id + ".html describes state " + s + ", which no block draws"); });
      var page = { id: id, name: title.indexOf(" — ") >= 0 ? title.split(" — ").slice(1).join(" — ") : title, route: body.attrs["data-route"] || null };
      if (notes.data) page.note = notes.data;
      page.states = states.map(function (s) { return notes[s] ? { name: s, note: notes[s] } : { name: s }; });
      page.status = body.attrs["data-status"] || "review";
      pages[id] = page;
      checkInstances(id + ".html", tree);
    });
    ids.forEach(function (id) {
      checkInstances("components/" + id + ".js", defs[id].tree);
      if (boards[id]) checkInstances("components/" + id + ".html", boards[id]);
    });

    /* ---- links: every href, read with the states it sits in ------------------- */
    // A prop a definition puts in an href is a link (screen-header's back).
    var linkProps = {};
    ids.forEach(function (id) {
      elements(defs[id].tree).forEach(function (e) {
        var h = /^\{([a-z][\w-]*)\}$/.exec(e[0].attrs.href || "");
        if (h) (linkProps[id] = linkProps[id] || {})[h[1]] = { kind: e[0].attrs["data-link"], title: e[0].attrs.title };
      });
    });
    function fillTitle(template, attrs, id) {
      return (template || "").replace(HOLE, function (_, __, name, ___, fallback) {
        var p = components[id] && components[id].props[name];
        return attrs[name] != null ? attrs[name] : p && p.default != null ? p.default : fallback || "";
      });
    }
    var links = [], seenLinks = {};
    function addLink(from, to, label, kind) {
      if (from === to) return;
      var key = from + ">" + to + ">" + (kind || "");
      if (seenLinks[key]) return;
      seenLinks[key] = true;
      var link = { from: from, to: to, label: label };
      if (isModal(to.split(".")[0])) link.action = "overlay";
      if (kind === "auto") link.tap = false;
      if (kind === "back") link.back = true;
      if (kind === "side") link.side = true;
      links.push(link);
    }
    function target(id, href) {
      var t = resolve(id, href);
      if (!t || t.board) return null;
      if (!pages[t.id]) { fail(id + ".html links to " + t.id + ".html, which is no page"); return null; }
      if (t.state && !pages[t.id].states.some(function (s) { return s.name === t.state; })) fail(id + ".html links to " + t.id + " state " + t.state + ", which it does not draw");
      return t.state ? t.id + "." + t.state : t.id;
    }
    pageIds.forEach(function (id) {
      elements(trees[id]).forEach(function (e) {
        var n = e[0], up = e[1], found = [];
        if (n.tag === "link" && n.attrs["data-link"] === "auto") found.push([n.attrs.href, n.attrs.title, "auto"]);
        else if (n.attrs.href && n.tag !== "link") {
          var a = n.attrs;
          found.push([a.href, a["data-label"] || a.title || a.label || a.heading || a.name || textOf(n), a["data-link"]]);
        }
        if (n.tag.indexOf("c-") === 0) {
          var cid = n.tag.slice(2);
          Object.keys(linkProps[cid] || {}).forEach(function (prop) {
            if (n.attrs[prop]) found.push([n.attrs[prop], fillTitle(linkProps[cid][prop].title, n.attrs, cid), linkProps[cid][prop].kind]);
          });
        }
        if (!found.length) return;
        var states = null;
        up.concat([n]).forEach(function (x) {
          var only = x.tag !== "body" && x.attrs["data-state"] && x.attrs["data-state"].split(/\s+/);
          if (only) states = states ? states.filter(function (s) { return only.indexOf(s) >= 0; }) : only;
        });
        // A link the default state has is the page's; a state adds only links the page lacks.
        found.forEach(function (f) {
          var to = target(id, f[0]);
          if (!to) return;
          var label = f[1] || pages[to.split(".")[0]].name;
          if (!states || states.indexOf("data") >= 0) addLink(id, to, label, f[2]);
          else states.forEach(function (s) { if (!seenLinks[id + ">" + to + ">" + (f[2] || "")]) addLink(id + "." + s, to, label, f[2]); });
        });
      });
    });

    /* ---- the order pages are reached in, and the journeys -------------------- */
    if (!pages[start]) fail("babul.js names start " + start + ", which is no page");
    var order = [], queue = pages[start] ? [start] : [];
    while (queue.length) {
      var id = queue.shift();
      if (order.indexOf(id) >= 0) continue;
      order.push(id);
      links.forEach(function (l) {
        var from = l.from.split(".")[0], to = l.to.split(".")[0];
        if (from === id && !l.back && !l.side && l.tap !== false && order.indexOf(to) < 0) queue.push(to);
      });
    }
    pageIds.forEach(function (id) { if (order.indexOf(id) < 0) order.push(id); });
    var named = [];
    order.forEach(function (id) {
      (bodyOf(id).attrs["data-journeys"] || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (name) {
        var j = named.filter(function (x) { return x.name === name; })[0];
        if (!j) named.push((j = { name: name, pages: [] }));
        j.pages.push(id);
      });
    });

    /* ---- usedOn, through other components too --------------------------------- */
    var usesIn = function (tree) {
      var set = {};
      elements(tree).forEach(function (e) { if (e[0].tag.indexOf("c-") === 0) set[e[0].tag.slice(2)] = true; });
      return set;
    };
    var defUses = {}, pageUses = {};
    ids.forEach(function (id) { defUses[id] = usesIn(defs[id].tree); });
    order.forEach(function (id) { pageUses[id] = usesIn(trees[id]); });
    function onPage(id, page, seen) {
      if (pageUses[page][id]) return true;
      seen = seen || {}; seen[id] = true;
      return ids.some(function (o) { return !seen[o] && defUses[o][id] && onPage(o, page, seen); });
    }

    /* ---- the art the pages show, and every icon anything draws ---------------- */
    var icons = {}, images = {};
    function iconsIn(value) {
      holes(value).forEach(function (h) { [h[4], h[5], h[6]].forEach(function (v) { if (v && v.indexOf(" ") < 0) icons[v] = true; }); });
      if (value && value.indexOf("{") < 0) icons[value] = true;
    }
    var all = pageIds.map(function (id) { return [id, trees[id]]; })
      .concat(ids.map(function (id) { return ["components/" + id, boards[id]]; }))
      .concat(ids.map(function (id) { return ["components/" + id, defs[id].tree]; }));
    all.forEach(function (x) {
      if (!x[1]) return;
      elements(x[1]).forEach(function (e) {
        var n = e[0];
        if (n.attrs["data-lucide"]) iconsIn(n.attrs["data-lucide"]);
        var c = n.tag.indexOf("c-") === 0 && components[n.tag.slice(2)];
        if (c) c.order.forEach(function (name) {
          var p = c.props[name];
          if (p.kind === "instance") iconsIn(n.attrs[name] != null ? n.attrs[name] : p.default || "");
        });
        if (n.tag === "img" && n.attrs.src) {
          var file = normalize("size/" + x[0].replace(/[^/]+$/, "") + n.attrs.src);
          if (/^assets\//.test(file)) images[file] = true;
        }
      });
    });
    var asset = function (file) { return { name: file.replace(/^assets\//, "").replace(/\.\w+$/, ""), file: file }; };

    return {
      errors: errors,
      pages: order.map(function (id) { return pages[id]; }),
      links: links,
      journeys: { start: start, end: order.filter(function (id) { return "data-end" in bodyOf(id).attrs; }), journeys: named },
      components: {
        components: ids.slice().sort(function (a, b) {
          return (components[a].group || "").localeCompare(components[b].group || "") || a.localeCompare(b);
        }).map(function (id) {
          var c = components[id], out = { id: id, name: pascal(id), group: c.group };
          if (c.source) out.source = c.source;
          if (c.note) out.note = c.note;
          out.properties = c.order.map(function (name) {
            var p = c.props[name], prop = { name: titleCase(name), kind: p.kind };
            if (p.options) prop.options = p.options;
            if (p.default !== undefined) prop.default = p.default;
            return prop;
          }).concat(c.slots.map(function (s) { return { name: titleCase(s), kind: "slot" }; }));
          out.states = c.states;
          out.usedOn = order.filter(function (page) { return onPage(id, page); });
          return out;
        }),
      },
      assets: {
        logos: product.logo ? [asset(product.logo)] : [],
        images: Object.keys(images).concat(product.art || []).filter(function (f, i, all) { return f !== product.logo && all.indexOf(f) === i; }).sort().map(asset),
        icons: { set: "lucide", version: lucideVersion, names: Object.keys(icons).sort() },
      },
    };
  }

  G.BABUL_DESCRIBE = { parse: parse, fromDom: fromDom, Collector: Collector, startOf: startOf };
})(typeof window !== "undefined" ? window : globalThis);
